require('dotenv').config();

const { Client, GatewayIntentBits, EmbedBuilder, Collection, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
const { addCard, getInfo } = require('./utils/getDBInfo.js');
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
  const guild = client.guilds.cache.get('1161421824253513728');
  const member = await guild.members.fetch(discordId);
  const channel = guild.channels.cache.get('1161468198445654147');

  if (!member) return null;

  await member
    .setNickname(`${info.displayName} (@${info.userName})`)
    .catch((err) => console.log(err));
  await member.roles.add(guild.roles.cache.get('1161466150090199142'));

  const completeEmbed = new EmbedBuilder()
    .setTitle('<:yes:1256689164712415386> Success')
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
    .setColor('#0B9634')
    .setThumbnail(info.pictureUrl)
    .setTimestamp()
    .setFooter({
      text: 'pietech • Account Linked',
      iconURL: 'https://i.imgur.com/XUEdhfL.png',
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
    .setColor('#0B9634')
    .setTimestamp()
    .setFooter({
      text: 'pietech • Link Logs',
      iconURL: 'https://i.imgur.com/XUEdhfL.png',
    });

  const logChannel = guild.channels.cache.get('1161468198445654147');
  return await logChannel.send({ embeds: [logEmbed] });
}

function generateRandomString(length) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

async function handleLinking(interaction) {
  if (!interaction.isButton()) return;
  if (interaction.customId === 'linkButton') {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (member.roles.cache.has('1161466150090199142')) {
      const alreadyEmbed = new EmbedBuilder()
        .setTitle("<:no:1256689163667902566> Error")
        .setDescription('Your account has already been linked. Run </unlink:1251680677565436007> to unlink.')
        .setColor('#BF0E1A')
        .setTimestamp()
        .setFooter({
          text: 'pietech • Error',
          iconURL: 'https://i.imgur.com/XUEdhfL.png',
        });
      return interaction.reply({ embeds: [alreadyEmbed], ephemeral: true });
    } else {

      if (getInfo(interaction.user.id, '666e05969c7355c52e253cb8') != null) {
        const guild = client.guilds.cache.get('1161421824253513728');

        await interaction.reply({content: 'You were previously linked, so you have been reverified.', ephemeral: true})

        await member.roles.add(guild.roles.cache.get('1161466150090199142'));
        return;
      }
      const randomString = generateRandomString(20);
      await addCard(randomString, interaction.user.id, '666e0594a25b1e47cd7040bc');

      let row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel("Verify")
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://tynelink.co.uk/user/${randomString}`)
                )
      return interaction.reply({ content: "Kindly follow the link below to continue the verification process.", ephemeral: true, components: [row] });
    }
  }
}

client.on(Events.InteractionCreate, async interaction => {
  handleLinking(interaction)
  if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);


  console.log(interaction.customId)



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
