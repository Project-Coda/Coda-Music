const { createAudioPlayer, NoSubscriberBehavior, createAudioResource, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');
const { ActivityType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const embedcreator = require('../embed.js');
const env = require('../env.js');
connection = null;
// Create Track Class
class Track {
	constructor(name, url, artist, artistImage, image) {
		this.name = name;
		this.url = url;
		this.artist = artist;
		this.artistImage = artistImage;
		this.image = image;
	}
}
async function createEmbed(track, playerstatus, volume) {
	readablevolume = volume * 100;
	embed = embedcreator.setembed ({
		title: `${playerstatus}: ${track.name}`,
		url: track.url,
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
	const filter = i => (i.customId === 'pause' || i.customId === 'stop') && i.user.id === interaction.user.id && i.message.interaction.id === interaction.id;
	const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: ComponentType.Button });
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
		console.log(`Collected ${collected} items`);
	},
	);
}
async function stop() {
	if (player) {
		player.stop();
		playerstatus = 'Stopped';
		await createEmbed(track, playerstatus, volume);
		await trackinteraction.editReply({
			embeds: [embed],
			ephemeral: true,
		});
	}
}
async function pause() {
	player.pause();
	playerstatus = 'Paused';
	createEmbed(track, playerstatus, volume);
	await trackinteraction.editReply({
		embeds: [embed],
		ephemeral: true,
	});
	paused = true;
}
async function unpause() {
	player.unpause();
	playerstatus = 'Now Playing';
	createEmbed(track, playerstatus, volume);
	await trackinteraction.editReply({
		embeds: [embed],
		ephemeral: true,
	}),
	paused = false;
}


async function joinVC(channel) {
	connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	});
	return connection;
}
async function leaveVC() {
	connection.destroy();
}
module.exports = {
	joinVC,
	leaveVC,
	buttonCollector,
	createButtons,
	createEmbed,
	Track,
	stop,
	pause,
	unpause,
};