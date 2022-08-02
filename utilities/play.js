const { createAudioPlayer, NoSubscriberBehavior, createAudioResource, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');
const { ActivityType } = require('discord.js');
const ytdl = require('ytdl-core');
const embedcreator = require('../embed.js');
channel = null;
track = null;
player = null;
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
	channel = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	});
	return channel;
}
async function leaveVC() {
	channel.destroy();
}
async function YouTube(player, url, volume, channel) {
	try {
		info = await ytdl.getBasicInfo(url);
		const yt = ytdl(url, {
			filter: 'audioonly',
		});
		const resource = createAudioResource(yt, {
			inlineVolume: true,
		});
		await player.play(resource);
		await channel.subscribe(player);
		if (volume != 1) {
			console.log(`Setting volume to ${volume}`);
			resource.volume.setVolume(volume);
		}
		array = info.videoDetails.thumbnails;
		image = array[array.length - 1].url;
		track = new Track(info.videoDetails.title, url, info.videoDetails.author.name, image);
		player.on(AudioPlayerStatus.Idle, (track) => {
			console.log('Finished playing.');
			global.client.user.setActivity('your music', { type: ActivityType.Playing });
			return embedcreator.log('Finished playing ' + track.name);
		},
		);
		await NowPlaying(track);
		return track;
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
}
module.exports = {
	YouTube,
	createPlayer,
	joinVC,
	createEmbed,
	leaveVC,
};
