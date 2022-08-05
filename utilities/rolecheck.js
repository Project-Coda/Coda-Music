const env = require('../env.js');
const embedcreator = require('../embed.js');
async function roleCheck(interaction) {
	if (interaction.member.roles.cache.has(env.discord.dj_role)) {
		return true;
	}
	else {
		return false;
	}
}
async function roleCheckEmbed(interaction) {
	allowed = await roleCheck(interaction);
	if (allowed) {
		return true;
	}
	else if (interaction.type === 2) {
		await interaction.reply({
			embeds: [ embedcreator.setembed(
				{
					title: 'Incident Reported',
					description: 'You do not have permission to use this command. This incident has been reported.',
					color: 0xe74c3c,
				},
			),
			], ephemeral: true,
		});
	}
	else {
		await interaction.reply({
			embeds: [ embedcreator.setembed(
				{
					title: 'Incident Reported',
					description: 'You do not have permission to use this command. This incident has been reported.',
					color: 0xe74c3c,
				},
			),
			],
		});
		global.client.channels.cache.get(env.discord.logs_channel).send({
			embeds: [ embedcreator.setembed(
				{
					title: 'Incident Detected',
					description: `${interaction.member.user} tried to use the music bot but did not have the correct role.`,
				},
			)],
		},
		);
		return false;
	}
}
module.exports = { roleCheck, roleCheckEmbed };