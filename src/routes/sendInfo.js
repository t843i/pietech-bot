const { Router } = require('express');
const router = Router();

router.post('/send-info', async (req, res) => {
    const { userName, userId, productName, gameId } = req.body;

    if (!userName || !userId || !productName || !gameId) {
      return res.status(400).send({
        error: 'All fields (Username, UserId, Product, GameId) are required',
      });
    }

    console.log(
      `Received data - Username: ${userName}, UserId: ${userId}, Product: ${productName}, GameId: ${gameId}`
    );
    res.status(200).send({
      message: 'Data received successfully',
      userName,
      userId,
      productName,
      gameId,
    });

    const robloxPicUrl = await getRobloxPicture(userId);

    const infoEmbed = new EmbedBuilder()
      .setTitle(':warning:  Suspicious Usage')
      .addFields({ name: 'Username', value: userName })
      .addFields({
        name: 'User ID',
        value: `${userId} `,
      })
      .addFields({ name: 'Product Name', value: productName })
      .addFields({
        name: 'Usage Links',
        value: `[Game](https://www.roblox.com/games/${gameId}/)\n[Profile](https://www.roblox.com/users/${userId}/profile)`,
      })
      .addFields({ name: 'In-Game Info', value: 'Product has been destroyed.' })
      .setColor('#FFCC4D')
      .setTimestamp()
      .setThumbnail(robloxPicUrl.thumbnailUrl)
      .setFooter({
        text: 'Colin • WebApp Data',
        iconURL: 'https://i.imgur.com/zX3pJOc.png',
      });

    const channel = client.channels.cache.get('1176386492109693063');
    channel.send({ embeds: [infoEmbed] });
  });

  module.exports = router;