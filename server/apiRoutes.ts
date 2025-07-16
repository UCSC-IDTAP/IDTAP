import express from 'express';
import { Collection, ObjectId } from 'mongodb';
import { spawn } from 'child_process';

interface Collections {
  transcriptions: Collection;
  users?: Collection;
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

  return router;
}
