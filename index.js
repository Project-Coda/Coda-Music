const { Client, GatewayIntentBits, Partials, ActivityType } = require('discord.js');
const env = require('./env.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('node:fs');
const embedcreator = require('./embed.js');
const figlet = require('figlet');
const pkg = require('./package.json');
const { roleCheckEmbed } = require('./utilities/rolecheck.js');
global.client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.MessageContent,
	],
	partials: [
		Partials.Message,
		Partials.Channel,
	],
});
global.client.login(env.discord.token);
console.log(figlet.textSync('CODA MUSIC', {
	font: 'Standard',
	horizontalLayout: 'default',
	verticalLayout: 'default',
}));
console.log(`Version: ${pkg.version}`);
console.log(`Author: ${pkg.author}`);
console.log(`GitHub: ${pkg.repository.url}`);
global.client.once('ready', async () => {
	console.log('Ready!');
	// set the client's presence
	global.client.user.setActivity('your music', { type: ActivityType.Playing });
});

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Place your client and guild ids here
const clientId = env.discord.client_id;
const guildId = env.discord.guild;

for (const file of commandFiles) {
	console.log(`Loading command ${file}...`);
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(env.discord.token);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.');
	}
	catch (error) {
		console.error(error);
		embedcreator.sendError(error);
	}
})();

global.client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;
	var allowed = await roleCheckEmbed(interaction);
	if (allowed) {
	// check if user has permission to use the command
		console.log(interaction.commandName);
		const commandFile = `./commands/${interaction.commandName}.js`;
		if (!fs.existsSync(commandFile)) return;
		const command = require(commandFile);
		await command.execute(interaction);
	}
});
global.client.on('messageCreate', async message => {
	if (message.author.bot) return;
	if (!message.content.startsWith(env.discord.prefix)) return;
	console.log('Command received!');
	const args = message.content.slice(env.discord.prefix.length).split(' ');
	const commandName = args[1];
	console.log(commandName);
	var allowed = await roleCheckEmbed(message);
	if (allowed) {
		const commandFile = `./message_commands/${commandName}.js`;
		if (!fs.existsSync(commandFile)) return;
		const command = require(commandFile);
		await command.execute(message, args);
	}
},
);
// handle audio resource error events
global.client.on('audioResourceError', async (error) => {
	console.error(error);
	embedcreator.sendError(error);
},
);