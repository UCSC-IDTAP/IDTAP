import express from 'express';
import { Collection, ObjectId } from 'mongodb';

interface Collections {
  transcriptions: Collection;
}

export default function apiRoutes(collections: Collections) {
  const router = express.Router();

  router.get('/transcriptions', async (req, res) => {
    const userId = String(req.query.userId);
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
        { "explicitPermissions.edit": userId },
        { "explicitPermissions.view": userId },
        { userID: userId },
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

  router.post('/transcription', async (req, res) => {
    const userId = String(req.query.userId || req.body.userId);
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

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
      const isOwner = existingTranscription.userID === userId;
      const hasEditPermission = existingTranscription.explicitPermissions?.edit?.includes(userId);

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
    const userId = String(req.query.userId || req.body.userId);
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

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
        const isOwner = existingTranscription.userID === userId;

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
