const mongodb = require('mongodb');

const generateAudioRecordingsDB = async () => {
  const agg = [
    {
      '$project': {
        'recordings': {
          '$objectToArray': '$recordings'
        }, 
        '_id': 0, 
        'parentID': '$_id',
        'name': '$name',
        'userID': '$userID',

      }
    }, {
      '$unwind': {
        'path': '$recordings'
      }
    }, {
      '$project': {
        '_id': '$recordings.v.audioFileId', 
        'duration': '$recordings.v.duration', 
        'saEstimate': '$recordings.v.saEstimate',
        'saVerified': '$recordings.v.saVerified',
        'date': '$recordings.v.date', 
        'location': '$recordings.v.location', 
        'musicians': '$recordings.v.musicians', 
        'raags': '$recordings.v.raags', 
        'parentID': '$parentID',
        'octOffset': '$recordings.v.octOffset',
        'parentTitle': '$name',
        'userID': '$userID',
        'parentTrackNumber': '$recordings.k',
        'collections': []

      }
    }, {
      '$merge': {
        'into': 'audioRecordings',
        'on': '_id',
        'whenMatched': 'merge',
        'whenNotMatched': 'insert'
      }
    }
  ];
  const webAddress = 'swara.f5cuf.mongodb.net/swara';
  const password = process.env.PASSWORD;
  const username = process.env.USER_NAME;
  const login = `srv://${username}:${password}`;
  const uri = `mongodb+${login}@${webAddress}`;

  try {
    const client = await mongodb.MongoClient.connect(
      uri,
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    const coll = client.db('swara').collection('audioEvents');
    const cursor = coll.aggregate(agg);
    const result = await cursor.toArray();
    console.log(result);
    await client.close();
  } catch (e) {
    console.error(e);
  }
  
}

// generateAudioRecordingsDB();
exports.generateAudioRecordingsDB = generateAudioRecordingsDB
