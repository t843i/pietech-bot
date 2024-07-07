const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    embedLength,
  } = require('discord.js');
  const { getUserProducts, getInfo, createProduct, getProduct } = require('../../utils/getDBInfo');

  module.exports = {
    data: new SlashCommandBuilder()
        .setName('createproduct')
        .setDescription('Creates a product ')
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Name of the product')
                .setRequired(true)
            )
        .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Description of the product')
                        .setRequired(true)
                    )
        .addIntegerOption(option =>
            option.setName('price')
            .setDescription('The price of the product.')
            .setRequired(true)
        )
        .addAttachmentOption(option => 
            option.setName('file')
            .setDescription('The product\'s file.')
            .setRequired(true)
        ),
    userPermissions: [PermissionFlagsBits.Administrator],
    botPermissions: [PermissionFlagsBits.Connect],
  
    execute: async (client, interaction) => {
        const guild = client.guilds.cache.get('1240337564527755397');
        const member = await interaction.guild.members.fetch(interaction.user.id);
        
        if (member.permissions.has(PermissionFlagsBits.Administrator)) {

            const infoEmbed = new EmbedBuilder()
            .setTitle("<a:loading:1256758767572353125>  Uploading product...")
            .setColor('#1D84BF')
            .setTimestamp()
            .setFooter({
            text: 'pietech • Product Creation',
            iconURL: 'https://i.imgur.com/XUEdhfL.png',
            });

            interaction.reply({embeds: [infoEmbed]})

            const name = interaction.options.getString('name');
            const description = interaction.options.getString('description');
            const price = interaction.options.getInteger('price');
            const attachment = interaction.options.getAttachment('file');

            const product = await createProduct(name, description, price, attachment.url);

            const sendDm = new EmbedBuilder()
                .setTitle("<:yes:1256689164712415386> Product Created")
                .addFields(
                    { name: 'Product Name', value: name },
                    { name: 'Description', value: description },
                    { name: 'Price', value: `<:robux:1256758421685010433> ${price}` },
                )
                .setColor('#0B9634')
                .setTimestamp()
                .setFooter({
                  text: 'pietech • Product Creation',
                  iconURL: 'https://i.imgur.com/XUEdhfL.png',
                });

            interaction.editReply({embeds: [sendDm]})

        } else {
            const cancelEmbed = new EmbedBuilder()
                .setTitle("<:no:1256689163667902566> No permission")
                .setDescription(
                  'You do not have permission to execute this command.'
                )
                .setColor('#BF0E1A')
                .setTimestamp()
                .setFooter({
                  text: 'pietech • Create Product',
                  iconURL: 'https://i.imgur.com/XUEdhfL.png',
                });

                interaction.reply({ embeds: [cancelEmbed], components: [] })
        }
  }
}