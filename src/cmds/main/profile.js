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
      .setName('profile')
      .setDescription('Displays your products')
      .setDMPermission(false),
    userPermissions: [PermissionFlagsBits.SendMessages],
    botPermissions: [PermissionFlagsBits.Connect],
  
    execute: async (client, interaction) => {
        const guild = client.guilds.cache.get('1240337564527755397');
        const member = await interaction.guild.members.fetch(interaction.user.id);
      
        const search = await getInfo(interaction.user.id, "666e05969c7355c52e253cb8")

        let products = await getProducts()

        if (search == null) {
            const cancelEmbed = new EmbedBuilder()
                .setTitle("<:no:1256689163667902566> Not Linked")
                .setDescription(
                  'You\'re account is not linked! Please run </link:1251672159361826886> to link your account!'
                )
                .setColor('#BF0E1A')
                .setTimestamp()
                .setFooter({
                  text: 'pietech • Profile',
                  iconURL: 'https://i.imgur.com/XUEdhfL.png',
                });

                interaction.reply({ embeds: [cancelEmbed], components: [] })
        } else {

            let ownedProducts = search.products

            let productsString = "";

            if (search.products.length === 0) {
                productsString = "None!";
            } else {
                for (let i in search.products) {

                    if (ownedProducts[i]== products[i].id) {
                        productsString += products[i].name + "\n";
                    }

                }
            }

            const infoEmbed = new EmbedBuilder()
            .setTitle("<:info:1256689165857194004>  Profile")
            .setThumbnail(interaction.user.displayAvatarURL())
            .addFields(
                { name: 'Joined', value: `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:D>` },
                { name: 'Registered', value: `<t:${Math.floor(interaction.user.createdAt.getTime() / 1000)}:D>` },
                { name: 'Licenses', value: productsString },
            )

            .setColor('#1D84BF')
            .setTimestamp()
            .setFooter({
            text: 'pietech • Profile',
            iconURL: 'https://i.imgur.com/XUEdhfL.png',
            });

            interaction.reply({ embeds: [infoEmbed], components: [] })

        }

  }
}