import { MongoClient } from 'mongodb';
import { gatherDatabaseInfo } from './dbStats.js';

// Replace with your local MongoDB connection string and database name
const settings = 'retryWrites=true&w=majority';
const webAddress = 'swara.f5cuf.mongodb.net/swara';
const password = process.env.PASSWORD;
const username = process.env.USER_NAME;
const login = `srv://${username}:${password}`;
const uri = `mongodb+${login}@${webAddress}?${settings}`;

async function test() {
  let client;
  try {
    client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    const db = client.db('swara');
    const stats = await gatherDatabaseInfo(db);
    console.log('Database Stats:', stats);
  } catch (error) {
    console.error('Error while testing:', error);
  } finally {
    if (client) {
      client.close();
    }
  }
}

test();
