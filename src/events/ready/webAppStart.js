require('colors');

const express = require('express');
const bodyParser = require('body-parser');
const {
  getRobloxPicture,
  getInfo,
  deleteCard,
  addCard,
} = require('../../utils/getDBInfo');
const { linkUser } = require('../../index');
const { EmbedBuilder } = require('discord.js');

const cookieParser = require('cookie-parser');
const { Issuer, TokenSet, custom, generators } = require('openid-client');

const sendInfoRouter = require('../../routes/sendInfo');

module.exports = async (client) => {
  const app = express();
  const port = process.env.PORT || 3000;
  const url = process.env.URL || 'http://localhost';

  const clientId = process.env.ROBLOX_CLIENT_ID;
  const clientSecret = process.env.ROBLOX_CLIENT_SECRET;

  const cookieSecret = process.env.COOKIE_SECRET || generators.random();
  const secureCookieConfig = {
    secure: true,
    httpOnly: true,
    signed: true,
  };

  app.use(cookieParser(cookieSecret));
  app.use(express.urlencoded({ extended: true }));

  app.use(bodyParser.json());

  async function main() {
    const issuer = await Issuer.discover(
      'https://apis.roblox.com/oauth/.well-known/openid-configuration'
    );

    const oClient = new issuer.Client({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uris: [`https://tynelink.co.uk/oauth/callback`],
      response_types: ['code'],
      scope: 'openid profile',
      id_token_signed_response_alg: 'ES256',
    });

    oClient[custom.clock_tolerance] = 180;

    async function saveDiscordIdToCookie(req, res, next) {
      res.cookie('discordId', req.params.discordId, secureCookieConfig);
      next();
    }

    async function retrieveDiscordIdFromCookie(req, res, next) {
      req.discordId = req.signedCookies.discordId;
      next();
    }

    async function checkLoggedIn(req, res, next) {
      if (req.signedCookies.tokenSet) {
        let tokenSet = new TokenSet(req.signedCookies.tokenSet);
        if (tokenSet.expired()) {
          tokenSet = await oClient.refresh(tokenSet);
          res.cookie('tokenSet', tokenSet, secureCookieConfig);
        }
        next();
      } else {
        res.redirect(`/login`);
      }
    }

    app.get('/', (req, res) => {
      res.send('Colin Alive 😎');
    });

    app.get('/user/:discordId', saveDiscordIdToCookie, async (req, res) => {
      const cardInfo = await getInfo(
        req.params.discordId,
        '666e0594a25b1e47cd7040bc'
      );

      if (!cardInfo) {
        return res.status(400).json({ error: 'Invalid request' });
      }

      res.redirect(`/login`);
    });

    app.get('/login', retrieveDiscordIdFromCookie, (req, res) => {
      const state = generators.state();
      const nonce = generators.nonce();
      const discordId = req.discordId;

      res
        .cookie('state', state, secureCookieConfig)
        .cookie('nonce', nonce, secureCookieConfig)
        .redirect(
          oClient.authorizationUrl({
            scope: oClient.scope,
            state,
            nonce,
            discordId,
          })
        );
    });

    app.get('/logout', async (req, res) => {
      if (req.signedCookies.tokenSet) {
        oClient.revoke(req.signedCookies.tokenSet.refresh_token);
      }
      res.clearCookie('tokenSet').redirect('/');
    });

    app.get('/oauth/callback', async (req, res) => {
      const params = oClient.callbackParams(req);
      const tokenSet = await oClient.callback(
        `https://tynelink.co.uk/oauth/callback`,
        params,
        {
          state: req.signedCookies.state,
          nonce: req.signedCookies.nonce,
        }
      );

      const discordId = req.signedCookies.discordId;

      res
        .cookie('tokenSet', tokenSet, secureCookieConfig)
        .clearCookie('state')
        .clearCookie('nonce')
        .redirect(`/home?discordId=${discordId}`);
    });

    app.get('/home', checkLoggedIn, async (req, res) => {
      const tokenSet = new TokenSet(req.signedCookies.tokenSet);
      const cardInfo = await getInfo(
        req.query.discordId,
        '666e0594a25b1e47cd7040bc'
      );
        await deleteCard(cardInfo.id);

      const data = {
        userId: tokenSet.claims().sub,
        displayName: tokenSet.claims().name,
        userName: tokenSet.claims().preferred_username,
        pictureUrl: tokenSet.claims().picture,
      };

      linkUser(cardInfo.desc, data);

      const exists = await getInfo(cardInfo.desc, '666e05969c7355c52e253cb8');
      if (exists) await deleteCard(exists.id);

      await addCard(
        cardInfo.desc,
        tokenSet.claims().sub,
        '666e05969c7355c52e253cb8'
      );

      res.redirect('https://discord.gg/cFXhwAhwhJ');
    });

    app.use('/api', sendInfoRouter);

    app.listen(port, () => {
      console.log(`[INFO] ✅ Web server running at ${url}:${port}`.blue);
    });
  }

  main().catch(console.error);
};
