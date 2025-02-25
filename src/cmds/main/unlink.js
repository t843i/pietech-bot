
const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
  } = require('discord.js');
  const { deleteCard, getInfo, } = require('../../utils/getDBInfo');
  
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('unlink')
      .setDescription('removes your roblox account from the database.')
      .setDMPermission(false),
    userPermissions: [PermissionFlagsBits.SendMessages],
    botPermissions: [PermissionFlagsBits.Connect],
  
    execute: async (client, interaction) => {
        const guild = client.guilds.cache.get('1240337564527755397');
      const member = await interaction.guild.members.fetch(interaction.user.id);
      if (member.roles.cache.has('1240337564527755398')) {
        const confirmEmbed = new EmbedBuilder()
        .setTitle("<:info:1256689165857194004> Unlink")
        .setDescription(
          'Are you sure you wish to unlink? This process is **permanent.**'
        )
        .setColor('#1D84BF')
        .setTimestamp()
        .setFooter({
          text: 'pietech • Unlink',
          iconURL: 'https://i.imgur.com/XUEdhfL.png',
        });
        
        const confirmId = String(Math.random()*100)
        const cancelId = String(Math.random()*100)

        const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(confirmId)
            .setLabel("Confirm")
            .setStyle('Danger'),
          new ButtonBuilder()
            .setCustomId(cancelId)
            .setLabel('Cancel')
            .setStyle('Secondary')
        );

        interaction.reply({ embeds: [confirmEmbed], components: [row] })

        const filter = i => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === confirmId) {
                deleteCard(await getInfo(interaction.user.id, "666e05969c7355c52e253cb8").id)
                await member.roles.remove(guild.roles.cache.get('1240337564527755398'));
              
                const doneEmbed = new EmbedBuilder()
                .setTitle("<:yes:1256689164712415386> Unlinked")
                .setDescription(
                  'You have been successfully unlinked.'
                )
                .setColor('#0B9634')
                .setTimestamp()
                .setFooter({
                  text: 'pietech • Unlink',
                  iconURL: 'https://i.imgur.com/XUEdhfL.png',
                });

                i.update({ embeds: [doneEmbed], components: [] })
                
            } else if (i.customId === cancelId) {
                const cancelEmbed = new EmbedBuilder()
                .setTitle("<:no:1256689163667902566> Cancelled")
                .setDescription(
                  'Unlinking process cancelled.'
                )
                .setColor('#BF0E1A')
                .setTimestamp()
                .setFooter({
                  text: 'pietech • Unlink',
                  iconURL: 'https://i.imgur.com/XUEdhfL.png',
                });

                i.update({ embeds: [cancelEmbed], components: [] })
            }
          });
      } else {
            const cancelEmbed = new EmbedBuilder()
                .setTitle("<:no:1256689163667902566> Not Linked")
                .setDescription(
                  'You\'re account is not linked! Please run </link:1251672159361826886> to link your account!'
                )
                .setColor('#BF0E1A')
                .setTimestamp()
                .setFooter({
                  text: 'pietech • Unlink',
                  iconURL: 'https://i.imgur.com/XUEdhfL.png',
                });

                interaction.reply({ embeds: [cancelEmbed], components: [] })
      }
    },
  };