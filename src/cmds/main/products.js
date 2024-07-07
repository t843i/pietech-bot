const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
  } = require('discord.js');
  const { getUserProducts, getInfo, getProducts } = require('../../utils/getDBInfo');

  module.exports = {
    data: new SlashCommandBuilder()
      .setName('products')
      .setDescription('Displays all products available.')
      .setDMPermission(false),
    userPermissions: [PermissionFlagsBits.SendMessages],
    botPermissions: [PermissionFlagsBits.Connect],
  
    execute: async (client, interaction) => {
        const guild = client.guilds.cache.get('1240337564527755397');
        const member = await interaction.guild.members.fetch(interaction.user.id);
      
        const products = await getProducts()

        let productsString = "";
            let priceString = "";

            if (products.length === 0) {
                productsString = "None!";
                priceString = "None!"
            } else {
                for (let i in products) {
                    productsString += products[i].name + "\n";
                    priceString += "<:robux:1256758421685010433> "+products[i].price + "\n"
                }
            }

            const infoEmbed = new EmbedBuilder()
            .setTitle("<:trolley:1256764270847332403>  Product List")
            .addFields(
                { name: 'Product', value: productsString, inline: true },
                { name: 'Price', value: priceString, inline: true},
            )

            .setDescription(
                'Our products currently on-sale.'
              )

            .setColor('#1D84BF')
            .setTimestamp()
            .setFooter({
            text: 'pietech • Products',
            iconURL: 'https://i.imgur.com/XUEdhfL.png',
            });

            let row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel("Open Hub")
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://www.roblox.com/')
                )

            interaction.reply({ embeds: [infoEmbed], components: [row] })

  }
}