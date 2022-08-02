const { SlashCommandBuilder } = require('@discordjs/builders');
const play = require('../utilities/play.js');
const embedcreator = require('../embed.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('Leaves the voice channel.'),
	async execute(interaction) {
		try {
			// play song
			await play.leaveVC();
			embed = embedcreator.setembed({
				title: 'Left Voice Channel',
				description: 'The bot has left the voice channel.',
			});
			// send embed
			return interaction.reply({ embeds:[embed], ephemeral: true });
		}
		catch (error) {
			console.log(error);
			interaction.reply({ embeds:[embedcreator.setembed(
				{
					title: 'Error',
					description: 'An error occurred while trying to leave the VC.',
				})],
			});
			return embedcreator.sendError(error);
		}
	},
};