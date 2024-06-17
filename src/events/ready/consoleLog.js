require('colors');

const {
  ActivityType,
  PresenceUpdateStatus,
  EmbedBuilder,
} = require('discord.js');

module.exports = async (client) => {
  console.log(`[INFO] ✅ Ready! Logged in as ${client.user.tag} 😀`.blue);
  client.user.setPresence({
    activities: [{ name: 'for API Requests 🤫', type: ActivityType.Listening }],
    status: PresenceUpdateStatus.DoNotDisturb,
  });
};
