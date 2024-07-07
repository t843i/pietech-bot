const axios = require('axios');
const trelloAPI = require('trello');
const FormData = require('form-data');
const fs = require('fs').promises;
const path = require('path');
const urlLib = require('url');

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

async function getProducts() {
  try {
    const cards = await trello.getCardsOnList('66806f80e37fa1a9bd312806');

    const products = await Promise.all(cards.map(async (card) => {
      const labels = card.labels;

      const priceLabel = labels.find(label => label.color === 'green');
      const idLabel = labels.find(label => label.color === 'blue');

      let attachmentUrl = null;
      const attachments = await trello.getAttachmentsOnCard(card.id);
      if (attachments.length > 0) {
        attachmentUrl = attachments[0].url;
      }

      return {
        id: idLabel ? idLabel.name : null,
        name: card.name,
        description: card.desc,
        price: priceLabel ? priceLabel.name : null,
        attachmentUrl: attachmentUrl
      };
    }));

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

async function getInfo(search, listId) {
  let locatedCard = null;

  await trello.getCardsOnList(listId).then((cards) => {
    locatedCard = cards.find((card) => card.name === search);
  });

  if (!locatedCard) {
    return null;
  }

  const checklists = await trello.getChecklistsOnCard(locatedCard.id);
  const productsChecklist = checklists.find((checklist) => checklist.name === 'products');

  const products = productsChecklist ? productsChecklist.checkItems.map((item) => item.name) : [];

  return {
    id: locatedCard.id,
    name: locatedCard.name,
    desc: locatedCard.desc,
    due: locatedCard.due || null,
    products: products,
  };
}

async function createProduct(name, desc, price, attachmentUrl) {
  const randomId = Math.random().toString(36).substring(2, 10);

  const card = await trello.addCard(name, desc, '66806f80e37fa1a9bd312806');

  let priceLabel = await trello.makeRequest('post', '/1/labels', {
    name: price,
    color: 'green',
    idBoard: '666e058cc319d3e71c06c42c'
  });

  let idLabel = await trello.makeRequest('post', '/1/labels', {
    name: randomId,
    color: 'blue',
    idBoard: '666e058cc319d3e71c06c42c'
  });

  await trello.addLabelToCard(card.id, priceLabel.id);
  await trello.addLabelToCard(card.id, idLabel.id);

  if (attachmentUrl) {
    try {
      const response = await axios({
        method: 'get',
        url: attachmentUrl,
        responseType: 'arraybuffer'
      });

      const parsedUrl = new urlLib.URL(attachmentUrl);
      const fileName = path.basename(parsedUrl.pathname);

      const safeFileName = fileName.replace(/[^a-z0-9.]/gi, '_');

      const tempFilePath = path.join(__dirname, '..', safeFileName);
      await fs.writeFile(tempFilePath, response.data);

      const form = new FormData();
      form.append('file', await fs.readFile(tempFilePath), {
        filename: safeFileName,
        contentType: response.headers['content-type']
      });

      await axios.post(
        `https://api.trello.com/1/cards/${card.id}/attachments`,
        form,
        {
          params: {
            key: process.env.TRELLO_KEY,
            token: process.env.TRELLO_TOKEN
          },
          headers: form.getHeaders()
        }
      );

      await fs.unlink(tempFilePath);

    } catch (error) {
      console.error('Error handling attachment:', error);
    }
  }

  
  

  return card;
}

async function getProduct(randomId) {
  const cards = await trello.getCardsOnList("666e058cc319d3e71c06c42c");
  const card = cards.find(card => card.labels.some(label => label.name === randomId));

  if (!card) {
    return null;
  }

  return card;
}


async function deleteCard(cardId) {
  await trello.deleteCard(cardId);
}

async function addCard(name, desc, listId) {
  let id = await trello.addCard(name, desc, listId).id;

  trello.addChecklistToCard(id, "products")
}

async function getUserProducts(search, listId) {
  const cardInfo = await getInfo(search, listId);

  if (!cardInfo) {
    console.log('Card not found.');
    return null;
  }

  const checklists = await trello.getChecklistsOnCard(cardInfo.id);
  const productsChecklist = checklists.find((checklist) => checklist.name === 'products');

  if (!productsChecklist) {
    console.log('Products checklist not found.');
    return null;
  }

  const checklistItems = productsChecklist.checkItems.map((item) => item.name);

  return checklistItems;
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  getUserProducts,
  getRobloxPicture,
  getInfo,
  deleteCard,
  addCard,
};
