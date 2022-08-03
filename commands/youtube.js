const { SlashCommandBuilder } = require('@discordjs/builders');
const play = require('../utilities/play.js');
const embedcreator = require('../embed.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('youtube')
		.setDescription('Allows you to play music from YouTube.')
		.addStringOption(option =>
			option.setName('url')
				.setDescription('The URL of the YouTube video to play.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('volume')
				.setDescription('The volume of the song.')
				.setRequired(false)),
	async execute(interaction) {
		// check if user is in a voice channel
		if (!interaction.member.voice.channel) {
			interaction.reply('You must be in a voice channel to use this command.');
			return;
		}
		try {
			// get voice channel
			const voiceChannel = interaction.member.voice.channel;
			// get url
			if (interaction.options.get('url')) {
				url = interaction.options.get('url').value;
			}
			// get volume
			if (interaction.options.get('volume')) {
				volume = interaction.options.get('volume').value;
				volume = parseInt(volume);
				volume = volume / 100;
			}
			else {
				volume = 1;
			}
			// play song
			play.addTrack(url, volume, voiceChannel, interaction);
		}
		catch (error) {
			console.log(error);
			interaction.reply({ embeds:[embedcreator.setembed(
				{
					title: 'Error',
					description: 'An error occurred while trying to play the song.',
				})],
			});
			return embedcreator.sendError(error);
		}
	},

};