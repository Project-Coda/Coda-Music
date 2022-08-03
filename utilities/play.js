const { createAudioPlayer, NoSubscriberBehavior, createAudioResource, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');
const { ActivityType } = require('discord.js');
const ytdl = require('ytdl-core');
const embedcreator = require('../embed.js');
connection = null;
track = null;
player = null;
queue = [];
// Create Track Class
class Track {
	constructor(name, url, artist, image) {
		this.name = name;
		this.url = url;
		this.artist = artist;
		this.image = image;
	}
}
async function createEmbed(track) {
	embed = embedcreator.setembed ({
		title: `Now Playing: ${track.name}`,
		url: track.url,
		description: `**Artist:** ${track.artist}\n**URL:** ${track.url}`,
		color: 0x19ebfe,
		image: {
			url: track.image,
		},
	});
	return embed;
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
async function addTrack(url, volume, channel, interaction) {
	try {
		interaction.reply({
			embeds: [embedcreator.setembed({
				title: 'Loading...',
				description: '',
				color: 0x19ebfe,
			})], ephemeral: true });
		track = await youtubeInfo(url);
		queue.push(track);
		await joinVC(channel);
		await createPlayer(channel);
		console.log(queue);
		console.log(player._state.status);
		if (player._state.status === 'idle') {
			playTrack(track, volume);
			embed = await createEmbed(track);
			interaction.editReply({
				embeds: [embed],
				ephemeral: true,
			});
		}

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
		track = new Track(info.videoDetails.title, url, info.videoDetails.author.name, image);
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
	player.on(AudioPlayerStatus.Idle, () => {
		console.log('Finished playing ' + track.name);
		global.client.user.setActivity('your music', { type: ActivityType.Playing });
		return embedcreator.log('Finished playing ' + track.name);
	},
	);
}
async function 	playTrack(track, volume) {
	if (track.url.includes('youtube')) {
		resource = await YouTubeResource(track.url, volume);
	}
	else if (track.url.includes('soundcloud')) {
		resource = await SoundCloudResource(track.url);
	}
	connection.subscribe(player);
	player.play(resource);
	await NowPlaying(track);
}
module.exports = {
	YouTubeResource,
	playTrack,
	addTrack,
	createPlayer,
	joinVC,
	createEmbed,
	leaveVC,
};
