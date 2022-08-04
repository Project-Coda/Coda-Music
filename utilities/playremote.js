const { createAudioPlayer, NoSubscriberBehavior, createAudioResource, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');
const { ActivityType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const ytdl = require('ytdl-core');
const scdl = require('soundcloud-downloader').default;
const embedcreator = require('../embed.js');
const env = require('../env.js');
const { joinVC, leaveVC, buttonCollector, createButtons, createEmbed, Track, stop, pause, unpause } = require('./play.js');
track = null;
player = null;
paused = false;
trackinteraction = null;
queue = [];

async function addTrack(url, volume, channel, interaction) {
	try {
		trackinteraction = interaction;
		await interaction.reply({
			embeds: [embedcreator.setembed({
				title: 'Loading...',
				description: '',
				color: 0x19ebfe,
			})], ephemeral: true });
		if (url.includes('youtube')) {
			track = await youtubeInfo(url);
		}
		else if (url.includes('soundcloud')) {
			track = await soundcloudInfo(url);
		}
		else {
			track = await localInfo(url);
		}
		if (track) {
			queue.push(track);
			await joinVC(channel);
			await createPlayer(channel);
			console.log(queue);
			console.log(player._state.status);
		}
		if (player._state.status === 'idle') {
			playTrack(track, volume);
			playerstatus = 'Now Playing';
			embed = await createEmbed(track, playerstatus, volume);
			row = await createButtons();
			await interaction.editReply({
				embeds: [embed],
				components: [row],
				ephemeral: true,
			});
			buttonCollector(interaction);
		}

	}
	catch (error) {
		console.log(error);
		return embedcreator.sendError(error);
	}
}

async function soundcloudInfo(url) {
	try {
		const info = await scdl.getInfo(url, env.soundcloud.client_id);
		console.log(info);
		const track = new Track(info.title, url, info.user.username, info.user.avatar_url, info.artwork_url);
		return track;
	}
	catch (error) {
		console.log(error);
		return embedcreator.sendError(error);
	}
}
async function youtubeInfo(url) {
	try {
		info = await ytdl.getBasicInfo(url);
		array = info.videoDetails.thumbnails;
		image = array[array.length - 1].url;
		console.log(info);
		authorimage = info.videoDetails.author.thumbnails;
		authorimage = authorimage[authorimage.length - 1].url;
		track = new Track(info.videoDetails.title, url, info.videoDetails.author.name, authorimage, image);
		return track;
	}
	catch (error) {
		console.log(error);
		return embedcreator.sendError(error);
	}
}

async function YouTubeResource(url, volume) {
	try {
		const yt = ytdl(url, {
			filter: 'audioonly',
		});
		if (volume < 1) {
			const resource = createAudioResource(yt, {
				inlineVolume: true,
			});
			resource.volume.setVolume(volume);
			return resource;
		}
		else {
			const resource = createAudioResource(yt);
			return resource;
		}
	}
	catch (error) {
		console.log(error);
		return embedcreator.sendError(error);
	}
}
async function SoundCloudResource(url, volume) {
	try {
		const sc = await scdl.download(url, env.soundcloud.client_id);
		if (volume < 1) {
			const resource = createAudioResource(sc, {
				inlineVolume: true,
			});
			console.log('volume' + volume);
			resource.volume.setVolume(volume);
			return resource;
		}
		else {
			const resource = createAudioResource(sc);
			return resource;
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
		embed = await createEmbed(track, playerstatus, volume);
		await trackinteraction.editReply({
			embeds: [embed],
			ephemeral: true,
		});
		global.client.user.setActivity('your music', { type: ActivityType.Playing });
		return embedcreator.log('Finished playing ' + track.name);
	},
	);
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
			return embedcreator.sendError('Invalid URL');
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
	YouTubeResource,
	playTrack,
	addTrack,
	createPlayer,
	joinVC,
	createEmbed,
	leaveVC,
	stop,
	pause,
	unpause,
	createButtons,
	Track,
	buttonCollector,
};
