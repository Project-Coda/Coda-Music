const play = require('../utilities/playremote.js');
const embedcreator = require('../embed.js');
module.exports = {
	async execute(message, args) {
		console.log('play');
		// check if user is in a voice channel
		if (!message.member.voice.channel) {
			message.reply('You must be in a voice channel to use this command.');
			return;
		}
		try {
			try {
				// get message user is replying to
				source_messageid = message.reference.messageId;
				// get message
				source_message = await message.channel.messages.fetch(source_messageid);
				url = source_message.attachments.first().proxyURL;
			}
			catch (err){
				console.log(err);
			}
			// get voice channel
			const voiceChannel = message.member.voice.channel;
			// get volume
			if (args[2]) {
				volume = args[2];
				volume = parseInt(volume);
				volume = volume / 100;
			}
			else {
				volume = 1;
			}
			// play song
			play.addTrack(url, volume, voiceChannel, message);
		}
		catch (error) {
			console.log(error);
			message.reply({ embeds:[embedcreator.setembed(
				{
					title: 'Error',
					description: 'An error occurred while trying to play the song.',
				})],
			});
			return embedcreator.sendError(error);
		}
	},
};