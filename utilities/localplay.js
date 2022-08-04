const
async function localInfo(url) {
	try {
		source_messageid = trackinteraction.reference.messageId;
		source_message = await trackinteraction.channel.messages.fetch(source_messageid);
		user = await source_message.member;

		avatar = await user.displayAvatarURL();
		artist = await user.displayName;
		image = await avatar;
		// Get Track Title
		title = await source_message.attachments.first().name;
		const track = new Track(title, url, artist, avatar, image);
		return track;
	}
	catch (error) {
		console.log(error);
		return embedcreator.sendError(error);
	}
}

module.exports = { localInfo };