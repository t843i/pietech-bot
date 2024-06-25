
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require('discord.js');
const { addCard } = require('../../utils/getDBInfo');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('link')
    .setDescription('link your roblox account to discord')
    .setDMPermission(false),
  userPermissions: [PermissionFlagsBits.SendMessages],
  botPermissions: [PermissionFlagsBits.Connect],

  execute: async (client, interaction) => {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (member.roles.cache.has('1240337564527755398')) {
      const alreadyEmbed = new EmbedBuilder()
        .setTitle("<:deny:1251684196049748098> Error")
        .setDescription(
          'Your account has already been linked. Run </unlink:1251680677565436007> to unlink.'
        )
        .setColor('#F54D5F')
        .setTimestamp()
        .setFooter({
          text: 'Tynelink • Error',
          iconURL: 'https://imgur.com/a/tl-rS3EhiP',
        });
      return interaction.reply({ embeds: [alreadyEmbed], ephemeral: true });
    } else {
      const randomString = generateRandomString(20);
      await addCard(
        randomString,
        interaction.user.id,
        '666e0594a25b1e47cd7040bc'
      );

      const embed = new EmbedBuilder()
        .setTitle('<:info:1251684198318735402>  Account Linking')
        .setDescription(
          `Press the button below to authorise your Roblox account.`
        )
        .setColor('#3498DB')
        .setTimestamp()
        .setFooter({
          text: 'Tynelink • Linking',
          iconURL: 'https://imgur.com/a/tl-rS3EhiP',
        });

      const button = new ButtonBuilder()
        .setLabel('Authorise Roblox Account')
        .setURL(`https://tynelink.co.uk/user/${randomString}`)
        .setStyle(ButtonStyle.Link);

      const row = new ActionRowBuilder().addComponents(button);

      return interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true,
      });
    }
  },
};

function generateRandomString(length) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
