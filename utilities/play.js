const { createAudioPlayer, NoSubscriberBehavior, joinVoiceChannel, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const { ActivityType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { soundcloudInfo, youtubeInfo, SoundCloudResource, YouTubeResource } = require('./playremote.js');
const { localInfo, localResource } = require('./localplay.js');
const embedcreator = require('../embed.js');
connection = null;
collector = null;
paused = null;
// Create Track Class

async function createEmbed(track, playerstatus, volume) {
	if (track.original_messageurl) {
		url = track.original_messageurl;
	}
	else {
		url = track.url;
	}
	readablevolume = volume * 100;
	if (readablevolume > 100) {
		readablevolume = 100;
	}
	embed = embedcreator.setembed ({
		title: `${playerstatus}: ${track.name}`,
		thumbnail: {
			url: track.artistImage,
		},
		url: url,
		author: {
			name: track.artist,
			icon_url: track.artistImage,
		},
		description: `**Artist:** ${track.artist}\n**URL:** ${track.url}\n**Volume:** ${readablevolume}%`,
		color: 0x19ebfe,
		image: {
			url: track.image,
		},
	});
	return embed;
}
async function createButtons() {
	var row = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('pause')
				.setLabel('⏯')
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId('stop')
				.setLabel('⏹')
				.setStyle(ButtonStyle.Danger),
		);
	return row;
}
// Create Button Collector
async function buttonCollector(interaction, player) {
	if (interaction.type === 2) {
		filter = i => (i.customId === 'pause' || i.customId === 'stop') && i.user.id === interaction.user.id && i.message.interaction.id === interaction.id;
	}
	else {
		filter = i => (i.customId === 'pause' || i.customId === 'stop') && i.user.id === interaction.author.id;
	}
	collector = interaction.channel.createMessageComponentCollector({ filter, componentType: ComponentType.Button });
	collector.on('collect', async i => {
		if (i.customId === 'pause') {
			if (paused) {
				await i.deferUpdate();
				unpause(player);
			}
			else {
				await i.deferUpdate();
				pause(player);
			}
		}
		else if (i.customId === 'stop') {
			console.log('stop');
			await i.deferUpdate();
			stop(player);
		}
	},
	);
	collector.on('end', collected => {
		console.log(`Collected ${collected.size} items`);
	},
	);
}
async function stop() {
	if (player) {
		player.stop();
		playerstatus = 'Stopped';
		await createEmbed(track, playerstatus, volume);
		if (trackinteraction.type === 2) {
			await trackinteraction.editReply({
				embeds: [embed],
				ephemeral: true,
			});
		}
		else {
			await trackinteraction.edit({
				embeds: [embed],
			});
		}
	}
}
async function pause() {
	player.pause();
	playerstatus = 'Paused';
	createEmbed(track, playerstatus, volume);
	if (trackinteraction.type === 2) {
		await trackinteraction.editReply({
			embeds: [embed],
			ephemeral: true,
		});
	}
	else {
		await trackinteraction.edit({
			embeds: [embed],
		});
	}
	paused = true;
}
async function unpause() {
	player.unpause();
	playerstatus = 'Now Playing';
	createEmbed(track, playerstatus, volume);
	if (trackinteraction.type === 2) {
		await trackinteraction.editReply({
			embeds: [embed],
			ephemeral: true,
		});
	}
	else {
		await trackinteraction.edit({
			embeds: [embed],
		});
	}
	paused = false;
}


async function joinVC(channel) {
	connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	});
	connection.on(VoiceConnectionStatus.Ready, async () => {
		if (await channel.guild.members.me.voice.channel.type === 13) {
			await channel.guild.members.me.voice.setSuppressed(false);
		}
	},
	);
	return connection;
}
async function leaveVC() {
	connection.destroy();
}
async function addTrack(url, volume, channel, interaction) {
	try {
		if (interaction.type === 19) {
			trackinteraction = await interaction.reply({
				embeds: [embedcreator.setembed({
					title: 'Loading...',
					description: '',
					color: 0x19ebfe,
				})], ephemeral: true });
		}
		else if (interaction.type === 2) {
			trackinteraction = interaction;
			await interaction.reply({
				embeds: [embedcreator.setembed({
					title: 'Loading...',
					description: '',
					color: 0x19ebfe,
				})], ephemeral: true });
		}
		if (url.includes('youtube') || url.includes('youtu.be')) {
			track = await youtubeInfo(url);
		}
		else if (url.includes('soundcloud')) {
			track = await soundcloudInfo(url);
		}
		else {
			track = await localInfo(url, interaction);
		}
		if (track) {
			await joinVC(channel);
			await createPlayer(channel);
		}
		if (player._state.status === 'idle') {
			playTrack(track, volume);
			playerstatus = 'Now Playing';
			embed = await createEmbed(track, playerstatus, volume);
			row = await createButtons();
			if (trackinteraction.type === 2) {
				await trackinteraction.editReply({
					embeds: [embed],
					components: [row],
					ephemeral: true,
				});
			}
			else {
				await trackinteraction.edit({
					embeds: [embed],
					components: [row],
				});
			}
			buttonCollector(interaction);
		}
	}
	catch (error) {
		console.log(error);
		return embedcreator.sendError(error);
	}
}
async function createPlayer() {
	player = createAudioPlayer(
		{
			noSubscriberBehavior: NoSubscriberBehavior.Stop,
			noSubscriberBehaviorTimeout: 10000,
		},
	);
	player.on('error', error => {
		console.log(error);
		return embedcreator.sendError(error);
	},
	);
	return player;
}
async function NowPlaying(track) {
	try {
	// set now playing status
		await global.client.user.setActivity(`${track.name} by ${track.artist}`, {
			type: ActivityType.Playing,
		});
		console.log(`Now Playing: ${track.name} by ${track.artist}`);
		// log now playing
		embedcreator.log(`Now Playing: ${track.name} by ${track.artist}`);
		player.on(AudioPlayerStatus.Idle, async () => {
			console.log('Finished playing ' + track.name);
			playerstatus = 'Finished playing';
			await collector.stop();
			embed = await createEmbed(track, playerstatus, volume);
			if (trackinteraction.type === 2) {
				await trackinteraction.editReply({
					embeds: [embed],
					ephemeral: true,
				});
			}
			else {
				await trackinteraction.edit({
					embeds: [embed],
				}).then(async () => {
					await trackinteraction.delete();
				},
				);
			}
			global.client.user.setActivity('your music', { type: ActivityType.Playing });
			return embedcreator.log('Finished playing ' + track.name);
		},
		);
	}
	catch (error) {
		console.log(error);
		return embedcreator.sendError(error);
	}
}
async function 	playTrack(track, volume) {
	try {
		if (track.url.includes('youtube') || track.url.includes('instagram')) {
			resource = await YouTubeResource(track.url, volume);
		}
		else if (track.url.includes('soundcloud')) {
			resource = await SoundCloudResource(track.url, volume);
		}
		else {
			resource = await localResource(track.url, volume);
		}
		connection.subscribe(player);
		player.play(resource);
		await NowPlaying(track);
	}
	catch (error) {
		console.log(error);
		return embedcreator.sendError(error);
	}

}
module.exports = {
	joinVC,
	leaveVC,
	buttonCollector,
	createButtons,
	createEmbed,
	stop,
	pause,
	unpause,
	addTrack,
};