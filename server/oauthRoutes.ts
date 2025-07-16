import express from 'express';
import { Collection } from 'mongodb';
import { OAuth2Client } from 'google-auth-library';

interface Collections {
  users: Collection;
}

export default function oauthRoutes(collections: Collections, googleClientId: string, googleClientSecret: string) {
  const router = express.Router();

  // Generate OAuth URL for Python client (no auth required)
  router.get('/authorize', async (req, res) => {
    try {
      const redirectUri = req.query.redirect_uri as string;
      const state = req.query.state as string;
      
      if (!redirectUri || !state) {
        return res.status(400).json({ error: 'Missing redirect_uri or state' });
      }
      
      const OAuthClient = new OAuth2Client({
        clientId: googleClientId,
        clientSecret: googleClientSecret,
        redirectUri: redirectUri
      });
      
      const authUrl = OAuthClient.generateAuthUrl({
        access_type: 'offline',
        scope: [
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile',
          'openid'
        ],
        state: state
      });
      
      res.json({ auth_url: authUrl });
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  });

  // Exchange authorization code for tokens (no auth required)
  router.post('/token', async (req, res) => {
    try {
      const { code, redirect_uri } = req.body;
      
      if (!code || !redirect_uri) {
        return res.status(400).json({ error: 'Missing code or redirect_uri' });
      }
      
      const OAuthClient = new OAuth2Client({
        clientId: googleClientId,
        clientSecret: googleClientSecret,
        redirectUri: redirect_uri
      });
      
      const { tokens } = await OAuthClient.getToken(code);
      OAuthClient.setCredentials(tokens);
      
      // Get user profile
      const userinfo = await OAuthClient.request({
        url: 'https://www.googleapis.com/oauth2/v3/userinfo'
      });
      
      // Register/login user in our database
      const profile = userinfo.data as any;
      const query = { sub: profile.sub };
      const update = { $set: profile };
      const options = { upsert: true, returnDocument: 'after' as const };
      const result = await collections.users.findOneAndUpdate(query, update, options);
      
      // Return tokens and user profile
      res.json({
        access_token: tokens.access_token,
        id_token: tokens.id_token,
        refresh_token: tokens.refresh_token,
        profile: result.value
      });
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  });

  return router;
}