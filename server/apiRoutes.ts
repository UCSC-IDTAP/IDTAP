import express from 'express';
import { Collection, ObjectId } from 'mongodb';
import { spawn } from 'child_process';
import fileUpload from 'express-fileupload';

interface Collections {
  transcriptions: Collection;
  users?: Collection;
  audioEvents?: Collection;
  audioRecordings?: Collection;
  musicians?: Collection;
  ragas?: Collection;
  locations?: Collection;
}

export default function apiRoutes(collections: Collections) {
  const router = express.Router();

  router.get('/transcriptions', async (req, res) => {
    const googleUserId = req.user!.id; // Google OAuth sub
    
    // Look up MongoDB user ID from Google OAuth sub
    const user = await collections.users?.findOne({ sub: googleUserId });
    const mongoUserId = user?._id?.toString();
    const sortKey = String(req.query.sortKey);
    const sortDirParam = String(req.query.sortDir);
    const sortDir = sortDirParam === '1' ? 1 : -1;

    const projection = {
      title: 1,
      dateCreated: 1,
      dateModified: 1,
      location: 1,
      _id: 1,
      durTot: 1,
      raga: 1,
      userID: 1,
      permissions: 1,
      name: 1,
      family_name: 1,
      given_name: 1,
      audioID: 1,
      instrumentation: 1,
      explicitPermissions: 1,
      soloist: 1,
      soloInstrument: 1,
    };

    const query = {
      $or: [
        { "explicitPermissions.publicView": true },
        { "explicitPermissions.edit": mongoUserId },
        { "explicitPermissions.view": mongoUserId },
        { userID: mongoUserId },
      ],
    };

    const sort: Record<string, 1 | -1> = {};
    sort[sortKey] = sortDir;

    try {
      const results = await collections.transcriptions
        .find(query)
        .project(projection)
        .collation({ locale: 'en' })
        .sort(sort)
        .toArray();
      res.json(results);
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  });

  router.get('/transcription/:id', async (req, res) => {
    const googleUserId = req.user!.id; // Google OAuth sub
    const transcriptionId = req.params.id;
    
    // Look up MongoDB user ID from Google OAuth sub
    const user = await collections.users?.findOne({ sub: googleUserId });
    const mongoUserId = user?._id?.toString();

    if (!transcriptionId) {
      return res.status(400).json({ error: 'Transcription ID is required' });
    }

    try {
      // Build the same permission query as in GET /transcriptions
      const query = {
        _id: new ObjectId(transcriptionId),
        $or: [
          { "explicitPermissions.publicView": true },
          { "explicitPermissions.edit": mongoUserId },
          { "explicitPermissions.view": mongoUserId },
          { userID: mongoUserId },
        ],
      };

      const transcription = await collections.transcriptions.findOne(query);

      if (!transcription) {
        return res.status(404).json({ error: 'Transcription not found or access denied' });
      }

      res.json(transcription);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/transcription/:id/json', async (req, res) => {
    const userId = req.user!.id; // Get from authenticated token
    const transcriptionId = req.params.id;

    if (!transcriptionId) {
      return res.status(400).json({ error: 'Transcription ID is required' });
    }

    try {
      // Check permissions using the same logic as GET /transcription/:id
      const query = {
        _id: new ObjectId(transcriptionId),
        $or: [
          { "explicitPermissions.publicView": true },
          { "explicitPermissions.edit": userId },
          { "explicitPermissions.view": userId },
          { userID: userId },
        ],
      };

      const transcription = await collections.transcriptions.findOne(query);

      if (!transcription) {
        return res.status(404).json({ error: 'Transcription not found or access denied' });
      }

      // Generate and serve JSON data (same logic as original jsonData route)
      const argvs = [
        'make_excel.py',
        transcriptionId,
        `data/json/${transcriptionId}.json`,
        `data/excel/${transcriptionId}.xlsx`
      ];

      const pythonScript = spawn('python3', argvs);
      
      pythonScript.stdout.on('data', data => {
        console.log(`stdout: ${data}`)
      });
      
      pythonScript.stderr.on('data', data => {
        console.error(`stderr: ${data}`)
      });
      
      pythonScript.on('close', () => {
        res.download(`data/json/${transcriptionId}.json`);
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/transcription/:id/excel', async (req, res) => {
    const userId = req.user!.id; // Get from authenticated token
    const transcriptionId = req.params.id;

    if (!transcriptionId) {
      return res.status(400).json({ error: 'Transcription ID is required' });
    }

    try {
      // Check permissions using the same logic as GET /transcription/:id
      const query = {
        _id: new ObjectId(transcriptionId),
        $or: [
          { "explicitPermissions.publicView": true },
          { "explicitPermissions.edit": userId },
          { "explicitPermissions.view": userId },
          { userID: userId },
        ],
      };

      const transcription = await collections.transcriptions.findOne(query);

      if (!transcription) {
        return res.status(404).json({ error: 'Transcription not found or access denied' });
      }

      // Generate and serve Excel data (same logic as original excelData route)
      const argvs = [
        'make_excel.py',
        transcriptionId,
        `data/json/${transcriptionId}.json`,
        `data/excel/${transcriptionId}.xlsx`
      ];

      const pythonScript = spawn('python3', argvs);
      
      pythonScript.stdout.on('data', data => {
        console.log(`stdout: ${data}`)
      });
      
      pythonScript.stderr.on('data', data => {
        console.error(`stderr: ${data}`)
      });
      
      pythonScript.on('close', () => {
        res.download(`data/excel/${transcriptionId}.xlsx`);
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/transcription', async (req, res) => {
    const googleUserId = req.user!.id; // Google OAuth sub
    
    // Look up MongoDB user ID from Google OAuth sub
    const user = await collections.users?.findOne({ sub: googleUserId });
    const mongoUserId = user?._id?.toString();

    if (!req.body._id) {
      return res.status(400).json({ error: 'Transcription ID is required' });
    }

    try {
      // First, fetch the existing transcription to check permissions
      const transcriptionId = new ObjectId(req.body._id);
      const existingTranscription = await collections.transcriptions.findOne({ _id: transcriptionId });

      if (!existingTranscription) {
        return res.status(404).json({ error: 'Transcription not found' });
      }

      // Check permissions: user must be owner OR have explicit edit permission
      const isOwner = existingTranscription.userID === mongoUserId;
      const hasEditPermission = existingTranscription.explicitPermissions?.edit?.includes(mongoUserId);

      if (!isOwner && !hasEditPermission) {
        return res.status(403).json({ 
          error: 'You do not have permission to edit this transcription' 
        });
      }

      // Prepare update object (exclude _id from updates)
      const updateObj: { [key: string]: any } = {};
      Object.keys(req.body).forEach(key => {
        if (key !== '_id') updateObj[key] = req.body[key];
      });
      updateObj['dateModified'] = new Date();
      if (updateObj['dateCreated']) {
        updateObj['dateCreated'] = new Date(updateObj['dateCreated']);
      }

      // Update the transcription
      const query = { '_id': transcriptionId };
      const update = { '$set': updateObj };
      const result = await collections.transcriptions.updateOne(query, update);

      res.json({ ...result, dateModified: updateObj['dateModified'] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/visibility', async (req, res) => {
    const googleUserId = req.user!.id; // Google OAuth sub
    
    // Look up MongoDB user ID from Google OAuth sub
    const user = await collections.users?.findOne({ sub: googleUserId });
    const mongoUserId = user?._id?.toString();

    if (!req.body._id) {
      return res.status(400).json({ error: 'Artifact ID is required' });
    }

    if (!req.body.artifactType) {
      return res.status(400).json({ error: 'Artifact type is required' });
    }

    if (!req.body.explicitPermissions) {
      return res.status(400).json({ error: 'Explicit permissions are required' });
    }

    try {
      // Only handle transcriptions for now (can be extended later)
      if (req.body.artifactType === 'transcription') {
        // First, fetch the existing transcription to check ownership
        const transcriptionId = new ObjectId(req.body._id);
        const existingTranscription = await collections.transcriptions.findOne({ _id: transcriptionId });

        if (!existingTranscription) {
          return res.status(404).json({ error: 'Transcription not found' });
        }

        // Check ownership: only the owner can update visibility/permissions
        const isOwner = existingTranscription.userID === mongoUserId;

        if (!isOwner) {
          return res.status(403).json({ 
            error: 'Only the owner can update visibility settings' 
          });
        }

        // Update the visibility/permissions
        const query = { _id: transcriptionId };
        const update = { $set: { 
          "explicitPermissions": req.body.explicitPermissions 
        } };
        const result = await collections.transcriptions.updateOne(query, update);

        res.json(result);
      } else {
        return res.status(400).json({ 
          error: 'Only transcription visibility updates are currently supported via API' 
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/user', async (req, res) => {
    const googleUserId = req.user!.id; // Google OAuth sub
    
    try {
      // Look up fresh user data from MongoDB using Google OAuth sub
      const user = await collections.users?.findOne({ sub: googleUserId });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/agreeToWaiver', async (req, res) => {
    const googleUserId = req.user!.id; // Google OAuth sub
    
    // Look up MongoDB user ID from Google OAuth sub
    const user = await collections.users?.findOne({ sub: googleUserId });
    const mongoUserId = user?._id?.toString();

    if (!mongoUserId) {
      return res.status(400).json({ error: 'User not found' });
    }

    try {
      const query = { _id: new ObjectId(mongoUserId) };
      const update = { $set: { waiverAgreed: true } };
      const options = { upsert: true };
      const result = await collections.users?.updateOne(query, update, options);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Metadata endpoints for Python API client
  router.get('/musicians', async (req, res) => {
    try {
      const musicians = await collections.musicians?.find({}).toArray();
      res.json(musicians || []);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/ragas', async (req, res) => {
    try {
      const ragas = await collections.ragas?.find({}).toArray();
      const ragaNames = ragas?.map(raga => raga.name).sort() || [];
      res.json(ragaNames);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/ragaRules', async (req, res) => {
    try {
      const ragaName = req.query.name;
      
      if (!ragaName || typeof ragaName !== 'string') {
        return res.status(400).json({ error: 'Raga name is required' });
      }

      const query = { name: ragaName };
      const projection = { _id: 0, rules: 1, updatedDate: 1 };
      const options = { projection: projection };
      const result = await collections.ragas?.findOne(query, options);
      
      if (!result) {
        return res.status(404).json({ error: 'Raga not found' });
      }
      
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/instruments', async (req, res) => {
    try {
      // Get instruments from musicians collection
      const pipeline = [
        { $group: { _id: "$Solo Instrument" } },
        { $match: { _id: { $nin: [null, ""] } } },
        { $sort: { _id: 1 } }
      ];
      
      const instruments = await collections.musicians?.aggregate(pipeline).toArray();
      const instrumentNames = instruments?.map(inst => inst._id) || [];
      
      // Filter for melody instruments if requested
      if (req.query.melody === 'true') {
        const melodyInstruments = instrumentNames.filter(name => 
          !['Tabla', 'Pakhawaj', 'Ghatam', 'Kanjira', 'Mridangam'].includes(name)
        );
        res.json(melodyInstruments);
      } else {
        res.json(instrumentNames);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/locations', async (req, res) => {
    try {
      const locations = await collections.locations?.findOne({});
      res.json(locations || {});
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/gharanas', async (req, res) => {
    try {
      const pipeline = [
        { $group: { _id: "$Gharana" } },
        { $match: { _id: { $nin: [null, ""] } } },
        { $sort: { _id: 1 } }
      ];
      
      const gharanas = await collections.musicians?.aggregate(pipeline).toArray();
      const gharanaNames = gharanas?.map(gh => ({ name: gh._id })) || [];
      res.json(gharanaNames);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/performanceSections', async (req, res) => {
    try {
      // Common performance sections in Hindustani music
      const sections = [
        'Alap', 'Jor', 'Jhala', 'Vilambit', 'Madhya', 'Drut', 
        'Taan', 'Meend', 'Gamak', 'Sargam', 'Bol-taan'
      ];
      res.json(sections);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/eventTypes', async (req, res) => {
    try {
      const eventTypes = ['Recording', 'Live Performance', 'Practice Session', 'Teaching'];
      res.json(eventTypes);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/audioEvents', async (req, res) => {
    const googleUserId = req.user!.id;
    
    try {
      const user = await collections.users?.findOne({ sub: googleUserId });
      const mongoUserId = user?._id?.toString();

      if (!mongoUserId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Get audio events user can edit
      const events = await collections.audioEvents?.find({ 
        userID: mongoUserId 
      }).toArray();
      
      res.json(events || []);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Helper function to get file extension from MIME type
  function getSuffix(mimetype: string): string {
    const end = mimetype.split('/')[1];
    if (end === 'mpeg') {
      return '.mp3';
    } else if (end === 'wav' || end === 'x-wav') {
      return '.wav';
    } else if (end === 'm4a' || end === 'x-m4a') {
      return '.m4a';
    } else if (end === 'flac' || end === 'x-flac') {
      return '.flac';
    } else if (end === 'ogg' || end === 'x-ogg') {
      return '.opus';
    } else if (end === 'opus' || end === 'x-opus') {
      return '.opus';
    }
    return '.mp3'; // default
  }

  router.post('/uploadAudio', async (req, res) => {
    const googleUserId = req.user!.id; // Google OAuth sub
    
    // Look up MongoDB user ID from Google OAuth sub  
    const user = await collections.users?.findOne({ sub: googleUserId });
    const mongoUserId = user?._id?.toString();

    if (!mongoUserId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      if (!req.files || !req.files.audioFile) {
        return res.status(400).json({ error: 'No audio file uploaded' });
      }

      const audioFile = req.files.audioFile as fileUpload.UploadedFile;
      const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
      const audioEventConfig = req.body.audioEventConfig ? JSON.parse(req.body.audioEventConfig) : null;

      // Generate new audio ID
      const newId = new ObjectId();
      const dateModified = new Date().toISOString();

      // Create new audio event if needed or use existing one
      let audioEventID = audioEventConfig?.audioEventId;
      let recIdx = audioEventConfig?.recordingIndex || 0;
      
      if (!audioEventID) {
        // Create new audio event
        const newAudioEvent = {
          _id: new ObjectId(),
          name: metadata.title || 'Untitled Recording',
          userID: mongoUserId,
          recordings: [{}], // Will be populated below
          dateModified: dateModified,
          visibility: metadata.permissions?.publicView ? 'public' : 'private'
        };
        
        const audioEventResult = await collections.audioEvents?.insertOne(newAudioEvent);
        audioEventID = audioEventResult?.insertedId.toString();
        recIdx = 0;
      }

      // Update audio event with recording info
      const recPath = `recordings.${recIdx}`;
      const afIdPath = `${recPath}.audioFileId`;
      const datePath = `${recPath}.date`;
      const locationPath = `${recPath}.location`;
      const musiciansPath = `${recPath}.musicians`;
      const raagsPath = `${recPath}.raags`;
      const octOffsetPath = `${recPath}.octOffset`;
      const dateModifiedPath = `${recPath}.dateModified`;
      const expPermissionsPath = `${recPath}.explicitPermissions`;

      const aeQuery = { _id: new ObjectId(audioEventID) };
      const aeUpdate = { 
        $set: { 
          [afIdPath]: newId,
          [datePath]: metadata.date || {},
          [locationPath]: metadata.location || {},
          [musiciansPath]: metadata.musicians || {},
          [raagsPath]: metadata.ragas || {},
          [octOffsetPath]: 0,
          [dateModifiedPath]: dateModified,
          [expPermissionsPath]: {
            publicView: metadata.permissions?.publicView || true,
            edit: metadata.permissions?.edit || [],
            view: metadata.permissions?.view || []
          }         
        } 
      };
      
      await collections.audioEvents?.findOneAndUpdate(aeQuery, aeUpdate, { upsert: true });

      // Create audio recording entry
      const audioRecording = {
        _id: newId,
        duration: 0,
        saEstimate: 0,
        saVerified: false,
        octOffset: 0,
        collections: [],
        musicians: metadata.musicians || {},
        title: metadata.title || '',
        date: metadata.date || {},
        location: metadata.location || {},
        raags: metadata.ragas || {},
        parentID: audioEventID,
        parentTitle: metadata.title || 'Untitled Recording',
        aeUserID: mongoUserId,
        userID: mongoUserId,
        parentTrackNumber: recIdx,
        dateModified: dateModified,
        explicitPermissions: {
          publicView: metadata.permissions?.publicView || true,
          edit: metadata.permissions?.edit || [],
          view: metadata.permissions?.view || []
        }
      };

      await collections.audioRecordings?.insertOne(audioRecording);

      // Save the uploaded file
      const suffix = getSuffix(audioFile.mimetype);
      let filename = newId.toString() + suffix;
      const uploadPath = './uploads/' + filename;
      
      await audioFile.mv(uploadPath);

      // Convert opus to wav if needed
      if (suffix === '.opus') {
        const newFilename = newId.toString() + '.wav';
        const spawnArgs = ['-i', uploadPath, './uploads/' + newFilename];
        const convertProcess = spawn('ffmpeg', spawnArgs);
        
        convertProcess.stderr.on('data', data => {
          console.error(`ffmpeg stderr: ${data}`);
        });
        
        convertProcess.on('close', () => {
          console.log('opus conversion finished');
        });
        
        filename = newFilename;
      }

      // Process audio with Python script
      const processArgs = ['process_audio.py', filename, audioEventID, recIdx.toString(), newId.toString()];
      const processAudio = spawn('python3', processArgs);
      
      processAudio.stderr.on('data', data => {
        console.error(`process_audio stderr: ${data}`);
      });

      processAudio.on('close', (code) => {
        console.log(`process_audio finished with code ${code}`);
      });

      // Return response in expected format
      const response = {
        audio_id: newId.toString(),
        success: true,
        file_info: {
          name: audioFile.name,
          mimetype: audioFile.mimetype,
          size: audioFile.size
        },
        processing_status: {
          audio_processed: false, // Will be updated by Python script
          melograph_generated: false,
          spectrograms_generated: false
        }
      };

      res.json(response);
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ error: 'Internal server error', details: err });
    }
  });

  return router;
}
