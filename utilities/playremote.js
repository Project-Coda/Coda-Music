const { createAudioResource } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const scdl = require('soundcloud-downloader').default;
const embedcreator = require('../embed.js');
const env = require('../env.js');
const { Track } = require('./track.js');
track = null;

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
		url = info.videoDetails.video_url;
		image = array[array.length - 1].url;
		authorimage = info.videoDetails.author.thumbnails;
		authorimage = authorimage[authorimage.length - 1].url;
		track = new Track(info.videoDetails.title, url, info.videoDetails.author.name, authorimage, image);
		console.log(track);
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

module.exports = {
	YouTubeResource,
	SoundCloudResource,
	youtubeInfo,
	soundcloudInfo,
};
