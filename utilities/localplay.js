const embedcreator = require('../embed.js');
const { Track } = require('./track.js');
const { createAudioResource } = require('@discordjs/voice');
async function localInfo(url, message) {
	try {
		source_messageid = message.reference.messageId;
		source_message = await message.channel.messages.fetch(source_messageid);
		user = await source_message.member;
		channelid = source_message.channel.id;
		guildid = source_message.guild.id;
		messageid = source_message.id;
		original_messageurl = 'https://discordapp.com/channels/' + guildid + '/' + channelid + '/' + messageid;
		avatar = await user.displayAvatarURL();
		artist = await user.displayName;
		image = await avatar;
		await message.delete();
		// Get Track Title
		title = await source_message.attachments.first().name;
		const track = new Track(title, url, artist, avatar, image, original_messageurl);
		return track;
	}
	catch (error) {
		console.log(error);
		return embedcreator.sendError(error);
	}
}
async function localResource(url, volume) {
	try {
		if (volume < 1) {
			const resource = createAudioResource(url, {
				inlineVolume: true,
			});
			resource.volume.setVolume(volume);
			return resource;
		}
		else {
			const resource = createAudioResource(url);
			return resource;
		}
	}
	catch (error) {
		console.log(error);
		return embedcreator.sendError(error);
	}
}

module.exports = { localInfo, localResource };