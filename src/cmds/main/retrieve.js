const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
  } = require('discord.js');
  const axios = require('axios');
  const fs = require('fs').promises;
  const path = require('path');
  const urlLib = require('url');
  const { getUserProducts, getInfo, getProducts, getProduct } = require('../../utils/getDBInfo');
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('retrieve')
      .setDescription('Displays your products')
      .setDMPermission(false),
    userPermissions: [PermissionFlagsBits.SendMessages],
    botPermissions: [PermissionFlagsBits.Connect],
  
    execute: async (client, interaction) => {
      const guild = client.guilds.cache.get('1240337564527755397');
      const member = await interaction.guild.members.fetch(interaction.user.id);
  
      const search = await getInfo(interaction.user.id, "666e05969c7355c52e253cb8");
  
      let products = await getProducts();
  
      if (search == null) {
        const cancelEmbed = new EmbedBuilder()
          .setTitle("<:no:1256689163667902566> Not Linked")
          .setDescription('You\'re account is not linked! Please run </link:1251672159361826886> to link your account!')
          .setColor('#BF0E1A')
          .setTimestamp()
          .setFooter({
            text: 'pietech • Profile',
            iconURL: 'https://i.imgur.com/XUEdhfL.png',
          });
  
        interaction.reply({ embeds: [cancelEmbed], components: [] });
      } else {
        if (search.products.length === 0) {
          const cancelEmbed = new EmbedBuilder()
            .setTitle("<:no:1256689163667902566> No Products")
            .setDescription('You do not own any licenses!')
            .setColor('#BF0E1A')
            .setTimestamp()
            .setFooter({
              text: 'pietech • Retrieve',
              iconURL: 'https://i.imgur.com/XUEdhfL.png',
            });
  
          interaction.reply({ embeds: [cancelEmbed], components: [] });
          return;
        }
  
        const infoEmbed = new EmbedBuilder()
          .setTitle("<:info:1256689165857194004> Retrieve")
          .setDescription("Please select the licenses you wish to retrieve from our hub.")
          .setColor('#1D84BF')
          .setTimestamp()
          .setFooter({
            text: 'pietech • Retrieve',
            iconURL: 'https://i.imgur.com/XUEdhfL.png',
          });
  
        let limit = products.length;
  
        if (limit > 3) {
          limit = 3;
        }
  
        const select = new StringSelectMenuBuilder()
          .setCustomId('string')
          .setPlaceholder('Please select the license(s) you wish to retrieve.')
          .setMinValues(1)
          .setMaxValues(limit);
  
        for (let i in search.products) {
          for (let v in products) {
            if (search.products[i] == products[v].id) {
              select.addOptions(
                new StringSelectMenuOptionBuilder()
                  .setLabel(products[v].name)
                  .setValue(products[v].id)
                  .setDescription(products[v].description),
              );
            }
          }
        }
  
        const row = new ActionRowBuilder().addComponents(select);
  
        interaction.reply({ embeds: [infoEmbed], components: [row] });
  
        const collector = interaction.channel.createMessageComponentCollector({
          filter: i => i.isStringSelectMenu() && i.user.id === interaction.user.id,
          time: 15000
        });
  
        collector.on('collect', async p => {

            const waitEmbed = new EmbedBuilder()
            .setTitle("<a:loading:1256758767572353125>  Sending products...")
            .setColor('#1D84BF')
            .setTimestamp()
            .setFooter({
            text: 'pietech • Retrieve',
            iconURL: 'https://i.imgur.com/XUEdhfL.png',
            });


            interaction.editReply({embeds: [waitEmbed], components: []})
            
          await p.deferUpdate();
          const selectedProducts = p.values;
  
          let products = await getProducts();
          let files = [];
          let filePaths = [];
  
          for (let i in selectedProducts) {
            for (let v in products) {
              if (selectedProducts[i] == products[v].id) {
                let attachmentUrl = products[v].attachmentUrl;
                try {
                  const response = await axios({
                    method: 'get',
                    url: attachmentUrl,
                    responseType: 'arraybuffer'
                  });
  
                  const parsedUrl = new urlLib.URL(attachmentUrl);
                  const fileName = path.basename(parsedUrl.pathname);
  
                  const safeFileName = fileName.replace(/[^a-z0-9.]/gi, '_');
  
                  const tempFilePath = path.join(__dirname, '../..', safeFileName);
                  await fs.writeFile(tempFilePath, response.data);
  
                  files.push({
                    attachment: tempFilePath,
                    name: safeFileName
                  });
                  filePaths.push(tempFilePath);
                } catch (error) {
                  console.error('Error handling attachment:', error);
                }
              }
            }
          }
  
          const doneEmbed = new EmbedBuilder()
            .setTitle("<:yes:1256689164712415386> Retrieved Products")
            .setDescription('Here are the licenses you retrieved.')
            .setColor('#0B9634')
            .setTimestamp()
            .setFooter({
              text: 'pietech • Retrieve',
              iconURL: 'https://i.imgur.com/XUEdhfL.png',
            });
  
          let sentMsg;
  
          try {
            await interaction.user.send({ embeds: [doneEmbed] }).catch(error => {
                const cancelEmbed = new EmbedBuilder()
                .setTitle("<:no:1256689163667902566> Unable to DM")
                .setDescription(
                  'I was unable to DM you your products! Please turn on direct messages!'
                )
                .setColor('#BF0E1A')
                .setTimestamp()
                .setFooter({
                  text: 'pietech • Retrieve',
                  iconURL: 'https://i.imgur.com/XUEdhfL.png',
                });

                interaction.editReply({embeds: [cancelEmbed]})
            })
            await interaction.user.send({files: files}).then(msg => {
                sentMsg = msg.url;
              });
            const sendDm = new EmbedBuilder()
              .setTitle("<:yes:1256689164712415386> Products Sent")
              .setDescription('Your licenses have been sent to your DMs!')
              .setColor('#0B9634')
              .setTimestamp()
              .setFooter({
                text: 'pietech • Retrieve',
                iconURL: 'https://i.imgur.com/XUEdhfL.png',
              });
  
            let row2 = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setLabel("Jump to DM")
                  .setStyle(ButtonStyle.Link)
                  .setURL(sentMsg)
              );
  
            interaction.editReply({ embeds: [sendDm], components: [row2] });
          } catch (error) {
            const cancelEmbed = new EmbedBuilder()
              .setTitle("<:no:1256689163667902566> Unable to DM")
              .setDescription('I was unable to DM you! Please enable your direct messages.')
              .setColor('#BF0E1A')
              .setTimestamp()
              .setFooter({
                text: 'pietech • Retrieve',
                iconURL: 'https://i.imgur.com/XUEdhfL.png',
              });
            interaction.editReply({ embeds: [cancelEmbed], components: [] });
            return;
          } finally {
            for (let filePath of filePaths) {
              await fs.unlink(filePath);
            }
          }
        });
      }
    }
  };
  