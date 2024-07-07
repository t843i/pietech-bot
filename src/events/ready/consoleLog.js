require('colors');
const fs = require('fs');
const path = require('path');

const {
  ActivityType,
  PresenceUpdateStatus,
  EmbedBuilder,
  ButtonBuilder, ButtonStyle, ActionRowBuilder,
} = require('discord.js');

const messageDataPath = path.join(__dirname, '..', 'messageData.json');

module.exports = async (client) => {
  console.log(`[INFO] ✅ Ready! Logged in as ${client.user.tag} 😀`.blue);

  client.user.setPresence({
    activities: [{ name: 'for API Requests 🤫', type: ActivityType.Listening }],
    status: PresenceUpdateStatus.DoNotDisturb,
  });

  const channel = await client.channels.fetch('1161466846575337642');
  
  let previousMessageId = null;
  if (fs.existsSync(messageDataPath)) {
    const messageData = JSON.parse(fs.readFileSync(messageDataPath, 'utf-8'));
    previousMessageId = messageData.messageId;
  }

  if (previousMessageId) {
    try {
      const previousMessage = await channel.messages.fetch(previousMessageId);
      if (previousMessage) {
        await previousMessage.delete();
        console.log('[INFO] Previous message deleted.'.green);
      }
    } catch (error) {
      console.error(`[ERROR] Failed to delete previous message: ${error.message}`.red);
    }
  }

  const embed = new EmbedBuilder()
    .setTitle('<:info:1256689165857194004> Account Linking')
    .setDescription('Press the button below to authorise your Roblox account.')
    .setColor('#1D84BF')
    .setTimestamp()
    .setFooter({
      text: 'pietech • Linking',
      iconURL: 'https://i.imgur.com/XUEdhfL.png',
    });

  const button = new ButtonBuilder()
    .setLabel('Authorise Roblox Account')
    .setCustomId('linkButton')
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(button);

  const newMessage = await channel.send({
    embeds: [embed],
    components: [row],
  });

  const newMessageData = { messageId: newMessage.id };
  fs.writeFileSync(messageDataPath, JSON.stringify(newMessageData), 'utf-8');
  console.log('[INFO] New message sent and ID saved.'.green);
};
