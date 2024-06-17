require('dotenv').config();

const { Client, GatewayIntentBits, EmbedBuilder, Collection, Events } = require('discord.js');
const eventHandler = require('./handlers/eventHandler');
const { link } = require('./routes/sendInfo');
const { deployCmds } = require('./utils/deploy.js')
require('dotenv').config()



const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();
const fs = require('fs');
const path = require('path');
const foldersPath = path.join(__dirname, './cmds');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

(async () => {
  deployCmds()
  eventHandler(client);
  await client.login(process.env.TOKEN);
})();

async function linkUser(discordId, info) {
  const guild = client.guilds.cache.get('1240337564527755397');
  const member = await guild.members.fetch(discordId);
  const channel = guild.channels.cache.get('1250879203486863542');

  if (!member) return null;

  await member
    .setNickname(`${info.displayName} (@${info.userName})`)
    .catch((err) => console.log(err));
  await member.roles.add(guild.roles.cache.get('1240337564527755398'));

  const completeEmbed = new EmbedBuilder()
    .setTitle('<:confirm:1251684197186146306> Success')
    .setDescription('Your Roblox Account has been linked!')
    .addFields({
      name: 'Username',
      value: `[${info.displayName} (@${info.userName})](https://www.roblox.com/users/${info.userId}/profile)`,
      inline: true,
    })
    .addFields({
      name: 'User ID',
      value: info.userId,
      inline: true,
    })
    .setColor('#57F287')
    .setThumbnail(info.pictureUrl)
    .setTimestamp()
    .setFooter({
      text: 'Tynelink • Account Linked',
      iconURL: 'https://cdn.discordapp.com/attachments/1240337565043921049/1251675751191937107/Untitled_design_14.png?ex=666f7162&is=666e1fe2&hm=5c4aa511be73952a279e93ab90b30d0f20e4f794a9d201bff2cef9ed5f137bdd&',
    });

  await member.user.send({ embeds: [completeEmbed] });

  logEmbed = new EmbedBuilder()
    .setAuthor({
      name: member.user.tag,
      iconURL: member.user.avatarURL({
        dynamic: true,
      }),
    })
    .setTitle('Account Linked')
    .addFields({
      name: 'User',
      value: `<@${discordId}>`,
    })
    .addFields({
      name: 'Roblox Account',
      value: `[${info.displayName} (@${info.userName})](https://www.roblox.com/users/${info.userId}/profile)`,
    })
    .setThumbnail(info.pictureUrl)
    .setColor('#57F287')
    .setTimestamp()
    .setFooter({
      text: 'Colin • WebApp Logs',
      iconURL: 'https://i.imgur.com/zX3pJOc.png',
    });

  const logChannel = guild.channels.cache.get('1240337565043921050');
  return await logChannel.send({ embeds: [logEmbed] });
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(client, interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

module.exports = {
  linkUser,
};
