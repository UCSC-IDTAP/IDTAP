import express from 'express';
import { Collection } from 'mongodb';

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

  return router;
}
