import { describe, test, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import apiRoutes from '../../../server/apiRoutes';

describe('apiRoutes /transcriptions', () => {
  test('succeeds when many documents are present', async () => {
    const docs = Array.from({ length: 1000 }, (_, i) => ({ _id: String(i), title: `t${i}` }));
    let usedProjection: any = null;
    const cursor = {
      project(p: any) { usedProjection = p; return this; },
      collation() { return this; },
      sort() { return this; },
      toArray() { return Promise.resolve(docs); },
    };
    const collections = {
      transcriptions: { find: () => cursor } as any,
    };
    const app = express();
    app.use(apiRoutes(collections as any));
    const res = await request(app)
      .get('/transcriptions')
      .query({ userId: 'u1', sortKey: 'title', sortDir: '1' });

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(docs.length);
    const expectedProjection = {
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
    expect(usedProjection).toEqual(expectedProjection);
  });
});
