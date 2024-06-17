const axios = require('axios');
const trelloAPI = require('trello');

const trello = new trelloAPI(process.env.TRELLO_KEY, process.env.TRELLO_TOKEN);


async function getRobloxPicture(userId) {
  const url = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`;
  let thumbnailUrl;
  await axios
    .get(url)
    .then(async (response) => {
      thumbnailUrl = await response.data.data[0].imageUrl;
    })
    .catch((error) => {
      console.error('Error fetching thumbnail:', error);
    });

  return { thumbnailUrl } || null;
}

async function getInfo(search, listId) {
  let locatedCard = null;

  await trello.getCardsOnList(listId).then((cards) => {
    locatedCard = cards.find((card) => card.name == search);
  });

  if (locatedCard)
    return {
      id: locatedCard.id,
      name: locatedCard.name,
      desc: locatedCard.desc,
      due: locatedCard.due || null,
    };

  return null;
}

async function deleteCard(cardId) {
  await trello.deleteCard(cardId);
}

async function addCard(name, desc, listId) {
  await trello.addCard(name, desc, listId);
}

module.exports = {
  getRobloxPicture,
  getInfo,
  deleteCard,
  addCard,
};
