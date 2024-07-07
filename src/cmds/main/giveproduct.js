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
  const { getUserProducts, getInfo, getProducts } = require('../../utils/getDBInfo');

  module.exports = {
    data: new SlashCommandBuilder()
      .setName('giveproduct')
      .setDescription('Gives a user licence(s)')
      .setDMPermission(false)
      .addUserOption(option => 
        option
          .setName('user')
          .setDescription('The user you wish to give licenses to.')
          .setRequired(true)
      ),
    userPermissions: [PermissionFlagsBits.SendMessages],
    botPermissions: [PermissionFlagsBits.Connect],
  
    execute: async (client, interaction) => {
      const target = interaction.options.getUser('user');
        const guild = client.guilds.cache.get('1240337564527755397');
        const member = await interaction.guild.members.fetch(interaction.user.id);
      
        const search = await getInfo(target.id, "666e05969c7355c52e253cb8")

        let products = await getProducts()

        if (search == null) {
            const cancelEmbed = new EmbedBuilder()
                .setTitle("<:no:1256689163667902566> Not Linked")
                .setDescription(
                  'This user is not currently linked!'
                )
                .setColor('#BF0E1A')
                .setTimestamp()
                .setFooter({
                  text: 'pietech • License',
                  iconURL: 'https://i.imgur.com/XUEdhfL.png',
                });

                interaction.reply({ embeds: [cancelEmbed], components: [] })
        } else {

          let userProducts = search.products;

          let unOwnedProducts = {};
          
          for (let i in products) {
            let productId = products[i].id;
            let owned = false;
          
            for (let v in userProducts) {
              let userProductId = userProducts[v];
          
              if (productId === userProductId) {
                owned = true;
                break;
              }
            }
          
            if (!owned) {
              unOwnedProducts[productId] = products[i];
            }
          }

          if (unOwnedProducts.length == 0) {
            const cancelEmbed = new EmbedBuilder()
                .setTitle("<:no:1256689163667902566> All Products Owned")
                .setDescription(
                  'This user already owns all products available!'
                )
                .setColor('#BF0E1A')
                .setTimestamp()
                .setFooter({
                  text: 'pietech • License',
                  iconURL: 'https://i.imgur.com/XUEdhfL.png',
                });

                interaction.reply({ embeds: [cancelEmbed], components: [] })
                return
          }
          
          const infoEmbed = new EmbedBuilder()
            .setTitle("<:info:1256689165857194004> Give License")
            .setDescription("Please select the licenses you wish to give the user.")
            .setColor('#1D84BF')
            .setTimestamp()
            .setFooter({
              text: 'pietech • Give License',
              iconURL: 'https://i.imgur.com/XUEdhfL.png',
            });
          
          const select = new StringSelectMenuBuilder()
            .setCustomId('string')
            .setPlaceholder('Please select the license(s) you wish to give.')
            .setMinValues(1)
            .setMaxValues(Object.keys(unOwnedProducts).length) 
            .addOptions(Object.values(unOwnedProducts).map(product => ({
              label: product.name,
              value: product.id,
              description: product.description
            })));
          
          interaction.reply({ embeds: [infoEmbed], components: [{ type: 1, components: [select] }] });
          

            

        }

  }
}