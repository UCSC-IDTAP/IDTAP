const url = 'https://swara.studio/';
import axios from 'axios';
import { AxiosProgressEvent } from 'axios';
import fetch from 'cross-fetch';
import { Piece } from './classes.ts';
import { 
  MusicianDBType, 
  GharanaType,
  TransMetadataType,
  RecUpdateType,
  UserType,
  RecType,
  CollectionType,
  QueryType,
  MultipleOptionType,
  MelographData,
  DN_ExtractorOptions,
} from '@shared/types.ts';
import {
  Instrument
} from '@shared/enums';
const getPiece = async (id: string): Promise<Piece> => {
  let piece;
  const request = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      _id: id
    })
  };
  try {
    const response = await fetch(url + 'getOneTranscription', request);
    if (response.ok) {
      piece = await response.json()
    }
  } catch (err) {
    console.error(err)
  }
  return piece
}

const pieceExists = async (id: string) => {
  const request = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  };
  const query = '?' + new URLSearchParams({ _id: id });
  try {
    const response = await fetch(url + 'pieceExists' + query, request);
    let data;
    if (response.ok) data = await response.json();
    return data
  } catch (err) {
    console.error(err)
  }
}

const excelData = async (id: string) => {
  const request = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  };
  const query = '?' + new URLSearchParams({ _id: id });
  try {
    const response = await fetch(url + 'excelData' + query, request);
    let data;
    if (response.ok) data = await response.blob();
    const a = document.createElement('a');
    if (data) a.href = window.URL.createObjectURL(data);
    a.download = 'data.xlsx';
    a.click();
  } catch (err) {
    console.error(err)
  }
}

const jsonData = async (id: string) => {
  const request = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  };
  const query = '?' + new URLSearchParams({ _id: id });
  try {
    const response = await fetch(url + 'jsonData' + query, request);
    let data;
    if (response.ok) data = await response.blob();
    const a = document.createElement('a');
    if (data) a.href = window.URL.createObjectURL(data);
    a.download = 'data.json';
    a.click();
  } catch (err) {
    console.error(err)
  }
}

const getAudioDBEntry = async (_id: string): Promise<RecType> => {
  let request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({_id})
  };
  const res = await fetch(url + 'getAudioDBEntry', request)
  if (res.ok) {
    return res.json()
  }
  return res.ok ? res.json(): undefined
}


const savePiece = async (piece: Piece) => {
  console.log(piece)
  const data = JSON.stringify(piece);
  let result;
  let request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: data
  };
  try {
    const res = await fetch(url + 'updateTranscription', request);
    if (res.ok) {
      result = await res.json()
    }
    return result
  } catch (err) {
    console.error(err)
  }
};

const getAllPieces = async (
    userID: string, 
    sortKey: string, 
    sortDir?: string | number,
    newPermissions?: boolean
  ): Promise<TransMetadataType[]> => {
  if (sortKey === undefined) {
    sortKey = 'title'
  }
  if (sortDir === undefined) {
    sortDir = '1'
  }
  let allPieces;
  let request = {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
  };
  const query = '?' + new URLSearchParams({
    userID: JSON.stringify(userID),
    sortKey: JSON.stringify(sortKey),
    sortDir: JSON.stringify(sortDir),
    newPermissions: JSON.stringify(newPermissions)
  });
  try {
    const response = await fetch(url + 'getAllTranscriptions' + query, request);
    if (response.ok) {
      allPieces = await response.json()
    }
  } catch (err) {
    console.error(err)
  }
  return allPieces
};

const updateVisibility = async (
  artifactType: 'audioEvent' | 'audioRecording' | 'transcription', 
  _id: string, 
  explicitPermissions: {
    edit: string[],
    view: string[],
    publicView: boolean
  }
  ) => {
    let result;
    let request = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        artifactType: artifactType,
        _id,
        explicitPermissions
      })
    };
    try {
      const res = await fetch(url + 'updateVisibility', request);
      if (res.ok) {
        result = await res.json()
      }
      return result
    } catch (err) {
      console.error(err)
    }  
  }

const createCollection = async (collection: CollectionType) => {
  let result: undefined | { acknowledged: boolean, insertedId: string };
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(collection)
  };
  try {
    const res = await fetch(url + 'createCollection', request);
    if (res.ok) {
      result = await res.json()
    } else {
      console.error(res)
    }
    
  } catch (err) {
    console.error(err)
  }
  return result
}

const deleteCollection = async (colID: string) => {
  let result: undefined | { acknowledged: boolean, deletedCount: number };
  const request = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ _id: colID })
  };
  try {
    const res = await fetch(url + 'deleteCollection', request);
    if (res.ok) {
      result = await res.json()
    } else {
      console.error(res)
    }
    
  } catch (err) {
    console.error(err)
  }
  return result
}

const updateCollection = async (collection: CollectionType) => {
  let result: undefined | { acknowledged: boolean, modifiedCount: number };
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(collection)
  };
  try {
    const res = await fetch(url + 'updateCollection', request);
    if (res.ok) {
      result = await res.json()
    } else {
      console.error(res)
    }
    
  } catch (err) {
    console.error(err)
  }
  return result
}

const getAllAudioRecordingMetadata = async (): Promise<RecType[]> => {
  let allAudio: RecType[] = [];
  let request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  };
  await fetch(url + 'getAllAudioRecordingMetadata', request)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
    }).then(data => {
      if (data) {
        allAudio = data
      }
    }).catch(err => console.error(err));
  return allAudio
}



const getAllAEMetadata = async (): Promise<AudioEventMetadataType[]> => {
  let allAudioEvents;
  const request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  };
  try {
    const response = await fetch(url + 'getAllAudioEventMetadata', request);
    if (response.ok) {
      allAudioEvents = await response.json()
    }
    
  } catch (err) {
    console.error(err)
  }
  return allAudioEvents
}

const getAudioEvent = async (_id: string) => {
  let audioEvent;
  const suffix = '?' + new URLSearchParams({ _id: _id });
  const request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  try {
    const response = await fetch(url + 'getAudioEvent' + suffix, request);
    if (response.ok) {
      audioEvent = await response.json()
    }
    return audioEvent
  } catch (err) {
    console.error(err)
  }
}

const getAudioRecording = async (_id: string): Promise<RecType> => {
  let audioRecording;
  const suffix = '?' + new URLSearchParams({ _id: _id });
  const request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  try {
    const response = await fetch(url + 'getAudioRecording' + suffix, request);
    if (response.ok) {
      // console.log(response);
      audioRecording = await response.json()
    }
  } catch (err) {
    console.error(err)
  }
  return audioRecording
};

const getAllTransOfAudioFile = async (
    audioID: string, 
    userID: string
  ): Promise<TransMetadataType[]> => {
  let allTrans;
  const suffix = '?' + new URLSearchParams({
    audioID: audioID,
    userID: userID
  });
  const request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  try {
    const extUrl = url + 'getAllTranscriptionsOfAudioFile' + suffix;
    const response = await fetch(extUrl, request);
    if (response.ok) {
      allTrans = await response.json()
    }
    
  } catch (err) {
    console.error(err)
  }
  return allTrans
};

const getAllMusicians = async (): Promise<MusicianDBType[]> => {
  let allMusicians: MusicianDBType[] = [];
  let request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  };
  try {
    const res = await fetch(url + 'getAllMusicians', request);
    if (res.ok) {
      allMusicians = await res.json()
    }
  } catch (err) {
    console.error(err)
  }
  return allMusicians
}

const getSortedMusicians = async (verbose=false): Promise<MusicianNameType[]> => {
  let allMusicians: MusicianNameType[] = [];
  let request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  };
  const query = verbose ? '?' + new URLSearchParams({ 
    verbose: verbose.toString() 
  }): '';
  const fullQuery = url + 'getSortedMusicians' + query;
  try {
    
    const res = await fetch(fullQuery, request);
    if (res.ok) {
      allMusicians = await res.json()
    }
  } catch (err) {
    console.error(err)
  }
  return allMusicians
}



const getEventTypes = async () => {
  // query 'audioEventTypes' mongoDB collection to get all event types
  let allEventTypes: string[] = []; 
  let request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  };
  try {
    const res = await fetch(url + 'getEventTypes', request);
    if (res.ok) {
      allEventTypes = await res.json()
    }
  } catch (err) {
    console.error(err)
  }
  return allEventTypes
};

const getGharana = async (initName: string) => {
  // get gharana from musician's name
  let gharana;
  let request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  };
  await fetch(url + 'getGharana?' + new URLSearchParams({ 
    initName: JSON.stringify(initName) 
  }), request)
    .then(res => {
      if (res.ok) {
        return res.json();
      }
    }).then(data => {
      if (data) {
        gharana = data.Gharana
      }
    }).catch(err => console.error(err))
    return gharana  
};

const addMusicianToDB = async (data: {
  fullName: string,
  initName: string,
  gharana: string,
  instrument: string
}): Promise<{ acknowledged: boolean, insertedId: string}> => {
  // add musician to DB
  let out;
  let request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      fullName: data.fullName, 
      initName: data.initName, 
      gharana: data.gharana, 
      instrument: data.instrument 
    })
  };
  try {
    const res = await fetch(url + 'addMusicianToDB', request);
    if (res.ok) {
      out = await res.json()
    }
    
  } catch (err) {
    console.error(err)
  }
  return out

};

const addGharanaToDB = async (data: { name: string, members: string[] }) => {
  // add gharana to DB
  let out;
  let request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: data.name, members: data.members })
  };
  try {
    const res = await fetch(url + 'addGharanaToDB', request);
    if (res.ok) {
      out = await res.json()
    }
    return out
  } catch (err) {
    console.error(err)
  }
};

const addCountryToDB = async (continent: string, country: string) => {
  // add country to DB
  let out;
  let request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ country: country, continent: continent })
  };
  try {
    const res = await fetch(url + 'addCountryToDB', request);
    if (res.ok) {
      out = await res.json()
    }
  } catch (err) {
    console.error(err)
  }
  return out
};

const addCityToDB = async (cont: string, country: string, city: string) => {
  // add city to DB
  let out;
  let request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ continent: cont, country: country, city: city })
  };
  try {
    const res = await fetch(url + 'addCityToDB', request);
    if (res.ok) {
      out = await res.json()
    }
  } catch (err) {
    console.error(err)
  }
  return out
};

const addRaagToDB = async (raag: string) => {
  // add raag to DB
  let out;
  let request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raag: raag })
  };
  console.log(request)
  try {
    const res = await fetch(url + 'addRaagToDB', request);
    if (res.ok) {
      out = await res.json()
    }
  } catch (err) {
    console.error(err)
  }
  return out
};

const updateAudioRecording = async (
  recID: string, 
  updates: RecUpdateType, 
  aeId?: string,
  parentTrackNum?: number | string
  ) => {
  // update audio recording
  console.log(updates)
  let out;
  if (aeId !== undefined && parentTrackNum === undefined) {
    throw new Error('parentTrackNum must be defined if ae_id is defined')
  }
  let request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      _id: recID, 
      updates: updates, 
      ae_id: aeId, 
      parentTrackNum: parentTrackNum 
    })
  };
  try {
    const res = await fetch(url + 'updateAudioRecording', request);
    if (res.ok) {
      out = await res.json()
    }
    
  } catch (err) {
    console.error(err)
  }
  return out
};



const getInstruments = async (melody: boolean = true): Promise<string[]> => {
  melody = melody || false;
  const searchParams = new URLSearchParams({ melody: 'true' });
  const suffix = melody ? '?' + searchParams : '';
  let instruments;
  let request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  };

  try {
    const res = await fetch(url + 'getInstruments' + suffix, request);
    if (res.ok) {
      instruments = await res.json()
    }
  } catch (err) {
    console.error(err)
  }
  return instruments
};

const getNumberOfSpectrograms = async (id: string) => {
  const suffix = '?' + new URLSearchParams({
    id: id
  });
  let out;
  const request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  };
  try {
    const res = await fetch(url + 'getNumberOfSpectrograms' + suffix, request);
    if (res.ok) {
      out = await res.json();
      return out
    }
  } catch (err) {
    console.error(err)
  }  
};

const verifySpectrogram = async (id: string) => {
  const suffix = '?' + new URLSearchParams({
    id: id
  });
  let out;
  const request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  };
  try {
    const res = await fetch(url + 'verifySpectrogram' + suffix, request);
    if (res.ok) {
      out = await res.json();
      return out
    }
  } catch (err) {
    console.error(err)
  }  
};

const verifyMelograph = async (id: string) => {
  const suffix = '?' + new URLSearchParams({
    id: id
  });
  let out;
  const request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  };
  try {
    const res = await fetch(url + 'verifyMelograph' + suffix, request);
    if (res.ok) {
      out = await res.json();
      return out
    }
  } catch (err) {
    console.error(err)
  }  
};

const makeSpectrograms = async (recId: string, saEst: string | number) => {
  let out;
  // console.log('recId: ', recId, '; saEst: ', saEst)
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ recId: recId, saEst: saEst })
  };
  try {
    const res = await fetch(url + 'makeSpectrograms', request);
    if (res.ok) {
      out = await res.json();
      return out
    }
  } catch (err) {
    console.error(err)
  }
};

const makeMelograph = async (recId: string, saEst: string | number) => {
  let out;
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ recId: recId, saEst: saEst })
  };
  try {
    const res = await fetch(url + 'makeMelograph', request);
    if (res.ok) {
      out = await res.json();
      return out
    }
  } catch (err) {
    console.error(err)
  }

};

const getRagaNames = async (): Promise<string[]> => {
  // gets all raga names
  let ragas;
  const request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  };
  try {
    const res = await fetch(url + 'getRagaNames', request);
    if (res.ok) {
      ragas = await res.json()
    }
  } catch (err) {
    console.error(err)
  }
  return ragas
};

const getRaagRule = async (name: string) => {
  let rule;
  const request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const searchParams = new URLSearchParams({ name: name })
  try {
    const res = await fetch(url + 'getRaagRule?' + searchParams, request);
    if (res.ok) {
      rule = await res.json();
      return rule
    }
  } catch (err) {
    console.error(err)
  }
}

const getLocationObject = async (): Promise<LocationType> => {
  // gets location object
  let location;
  const request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  };
  try {
    const res = await fetch(url + 'getLocationObject', request);
    if (res.ok) {
      location = await res.json();
      
    }
  } catch (err) {
    console.error(err)
  }
  return location
};

const getPerformanceSections = async (): Promise<string[]> => {
  let performanceSections;
  const request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  };
  try {
    const res = await fetch(url + 'getPerformanceSections', request);
    if (res.ok) {
      performanceSections = await res.json()
    }
  } catch (err) {
    console.error(err)
  }
  return performanceSections
};

const createNewPiece = async (obj: Piece): Promise<
  (NewPieceDataType | undefined)
  > => {
  const data = JSON.stringify(obj);
  let out;
  let request = {
    method: 'POST',
    headers: {
      'Conent-Type': 'application/json'
    },
    body: data
  };
  await fetch(url + 'insertNewTranscription', request)
    .then(response => {
      if (response.ok) {
        return response.json()
      }
    }).then((data: NewPieceDataType) => {
      if (data) {
        out = data
      }
    })
  return out
};

const deletePiece = async (piece: TransMetadataType) => {
  let out;
  let request = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      '_id': piece._id,
      'userID': piece.userID
    })
  };
  try {
    const response = await fetch(url + 'oneTranscription', request);
    if (response.ok) {
      out = await response.json();
    }
    return out
  } catch (err) {
    console.error(err)
  }
  return out
};

const deleteAudioEvent = async (aeID: string) => {
  let out;
  let request = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      '_id': aeID
    })
  };
  try {
    const response = await fetch(url + 'deleteAudioEvent', request);
    if (response.ok) {
      out = await response.json();
    }
    return out
  } catch (err) {
    console.error(err)
  }
}

const deleteRecording = async (recID: string) => {
  // delete a particular recording
  let out;
  let request = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      '_id': recID
    })
  };
  try {
    const response = await fetch(url + 'deleteRecording', request);
    if (response.ok) {
      out = await response.json();
    }
    return out
  } catch (err) {
    console.error(err)
  }
};

const initializeAudioEvent = async (
    userID: string, 
    name?: string, 
    eventType?: string
    ): Promise<{ acknowledged: boolean, insertedId: string }> => {
  const bodyObj: {
    'userID': string,
    'name'?: string,
    'eventType'?: string
  } = {
    'userID': userID,
  };
  if (name !== undefined) {
    bodyObj['name'] = name
  }
  if (eventType !== undefined) {
    bodyObj['eventType'] = eventType
  }
  console.log(bodyObj)
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bodyObj)
  };
  let out;
  try {
    const response = await fetch(url + 'initializeAudioEvent', request);
    if (response.ok) {
      out = await response.json();
    }
    
  } catch (err) {
    console.error(err)
  }
  return out
}

const cleanEmptyDoc = async (_id: string) => {
  const request = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }, 
    body: JSON.stringify({
      '_id': _id  
    })
  };
  let out;
  try {
    const response = await fetch(url + 'cleanEmptyDoc', request);
    if (response.ok) {
      out = await response.json();
    }
    return out
  } catch (err) {
    console.error(err)
  }
}

const saveAudioMetadata = async (
    _id: string, updates: object, addMusicians: object[]
  ) => {
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      '_id': _id,
      'updates': updates,
      'addMusicians': addMusicians
    })
  };
  console.log(updates)
  let out;
  try {
    const response = await fetch(url + 'saveAudioMetadata', request);
    if (response.ok) {
      out = await response.json();
    }
    return out
  } catch (err) {
    console.error(err)
  }
}

const updateSaEstimate = async (
  recID: string, 
  aeID: string, 
  recIdx: number | string, 
  saEst: number | string, 
  ver: boolean, 
  octOffset: number
  ) => {
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'recID': recID,
      'aeID': aeID,
      'recIdx': recIdx,
      'saEstimate': saEst,
      'verified': ver,
      'octOffset': octOffset
    }),
  };
  let out;
  try {
    const response = await fetch(url + 'updateSaEstimate', request);
    if (response.ok) {
      out = await response.json()
    }
    return out
  } catch (err) {
    console.error(err)
  }
}

const getVerifiedStatus = async (aeID: string, recIdx: string) => {
  const request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  };
  let out;
  try {
    const params = new URLSearchParams({ aeID: aeID, recIdx: recIdx });
    const response = await fetch(url + 'getVerifiedStatus?' + params, request);
    if (response.ok) {
      out = await response.json()
    }
    return out
  } catch (err) {
    console.error(err)
  }
}

const saveRaagRules = async (
  name: string | undefined, 
  rules: object, 
  date: Date,
  newName?: string
  ) => {
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, rules, date, newName })
  };
  let out;
  try {
    const response = await fetch(url + 'saveRaagRules', request);
    if (response.ok) {
      out = await response.json()
    }
    return out
  } catch (err) {
    console.error(err)
  }
}

const getAllCollections = async (): Promise<CollectionType[]> => {
  let out;
  const request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  try {
    const response = await fetch(url + 'getAllCollections', request);
    if (response.ok) {
      out = await response.json()
    }
  } catch (err) {
    console.error(err)
  }
  return out

}

const getAllGharanas = async (): Promise<GharanaType[]> => {
  let out;
  const request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  try {
    const response = await fetch(url + 'getAllGharanas', request);
    if (response.ok) {
      out = await response.json()
    }
  } catch (err) {
    console.error(err)
  }
  return out
}

const newUploadFile = async (file: File, onProgress: OnProgressType, {
  audioEventType = 'add',
  audioEventID = undefined,
  recIdx = undefined,
  userID = undefined,
  aeName = undefined,
  aeType = undefined,
}: {
  audioEventType?: 'add' | 'create' | 'none',
  audioEventID?: string,
  recIdx?: number,
  userID?: string,
  aeName?: string,
  aeType?: string
} = {}) => {
  if (audioEventType === 'add') {
    if (audioEventID === undefined) {
      throw new Error('audioEventID must be defined')
    }
    if (recIdx === undefined) {
      throw new Error('recIdx must be defined')
    }
    const formData = new FormData();
    formData.append('audioFile', file);
    formData.append('audioEventID', audioEventID);
    formData.append('recIdx', String(recIdx));
    formData.append('audioEventType', audioEventType);
    formData.append('userID', userID || '');
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progEvent: AxiosProgressEvent) => {
        const progressPercent = 100 * progEvent.loaded / progEvent.total!;
        if (onProgress) onProgress(progressPercent);
        return progressPercent
      }
    };
    try {
      const response = await axios.post(url+'newUploadFile', formData, config)
      if (response.statusText !== 'OK') {
        throw new Error(`Error! status: ${response.status}`)
      }
      return response.data;
    } catch (err) {
      console.log(err)
    }
  } else if (audioEventType === 'create') {
    // first create new audio event
    if (userID === undefined) {
      throw new Error('userID must be defined')
    }
    const result = await initializeAudioEvent(userID, aeName, aeType);
    audioEventID = result.insertedId;
    const formData = new FormData();
    formData.append('audioFile', file);
    formData.append('audioEventID', audioEventID);
    formData.append('recIdx', '0');
    formData.append('audioEventType', audioEventType);
    formData.append('userID', userID);
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progEvent: AxiosProgressEvent) => {
        const progressPercent = 100 * progEvent.loaded / progEvent.total!;
        if (onProgress) onProgress(progressPercent);
        return progressPercent
      }
    };
    try {
      const response = await axios.post(url+'newUploadFile', formData, config)
      if (response.statusText !== 'OK') {
        throw new Error(`Error! status: ${response.status}`)
      }
      return response.data;
    } catch (err) {
      console.log(err)
    }
  } else {
    if (userID === undefined) {
      throw new Error('userID must be defined')
    }
    const formData = new FormData();
    formData.append('audioFile', file);
    formData.append('audioEventType', audioEventType);
    formData.append('userID', userID);
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progEvent: AxiosProgressEvent) => {
        const progressPercent = 100 * progEvent.loaded / progEvent.total!;
        if (onProgress) onProgress(progressPercent);
        return progressPercent
      }
    };
    try {
      const response = await axios.post(url+'newUploadFile', formData, config)
      if (response.statusText !== 'OK') {
        throw new Error(`Error! status: ${response.status}`)
      }
      return response.data;
    } catch (err) {
      console.log(err)
    }

  }
}

const addRecordingToCollection = async (recordingID: string, colID: string) => {
  let out;
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ recordingID, colID })
  };
  try {
    const response = await fetch(url + 'addRecordingToCollection', request);
    if (response.ok) {
      out = await response.json()
    }
  } catch (err) {
    console.error(err)
  }
  return out
}

const getLooseRecordings = async (userID: string): Promise<RecType[]> => {
// gets all recordings that are not part of an audio event
  let out;
  const request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  try {
    const params = new URLSearchParams({ userID: userID });
    const response = await fetch(url + 'getLooseRecordings?' + params, request);
    if (response.ok) {
      out = await response.json()
    }
  } catch (err) {
    console.error(err)
  }
  return out
}

const addAEToCollection = async (audioEventID: string, colID: string) => {
  let out;
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ audioEventID, colID })
  };
  try {
    const response = await fetch(url + 'addAudioEventToCollection', request);
    if (response.ok) {
      out = await response.json()
    }
  } catch (err) {
    console.error(err)
  }
  return out
}

const addTransToCollection = async (transcriptionID: string, colID: string) => {
  let out;
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ transcriptionID, colID })
  };
  try {
    const response = await fetch(url + 'addTranscriptionToCollection', request);
    if (response.ok) {
      out = await response.json()
    }
  } catch (err) {
    console.error(err)
  }
  return out
}

const removeRecFromColl = async (recordingID: string, colID: string) => {
  let out;
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ recordingID, colID })
  };
  try {
    const res = await fetch(url + 'removeRecordingFromCollection', request);
    if (res.ok) {
      out = await res.json()
    }
  } catch (err) {
    console.error(err)
  }
  return out
}

const removeAEfromColl = async (audioEventID: string, colID: string) => {
  let out;
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ audioEventID, colID })
  };
  try {
    const res = await fetch(url + 'removeAudioEventFromCollection', request);
    if (res.ok) {
      out = await res.json()
    }
  } catch (err) {
    console.error(err)
  }
  return out
}

const removeTFromColl = async (transcriptionID: string, colID: string) => {
  let out;
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ transcriptionID, colID })
  };
  try {
    const res = await fetch(url + 'removeTranscriptionFromCollection', request);
    if (res.ok) {
      out = await res.json()
    }
  } catch (err) {
    console.error(err)
  }
  return out
}

import { 
  UserDataType,
  AudioEventMetadataType,
  IpaVowelType,
  IPAConsonantType,
  LocationType,
  NewPieceDataType,
  OnProgressType,
  MusicianNameType,
  DisplaySettings
} from '@shared/types.ts'

const userLoginGoogle = async (userData: UserDataType) => {
  const data = JSON.stringify({
    sub: userData.sub,
    picture: userData.picture,
    email: userData.email,
    name: userData.name,
    given_name: userData.given_name,
    family_name: userData.family_name,
    collections: [],
    transcriptions: [],
    savedQueries: [],
  });
  let out;
  let request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: data
  };
  try {
    const response = await fetch(url + 'userLoginGoogle', request);
    if (response.ok) {
      out = await response.json()
    }
    return out
  } catch (err) {
    console.error(err)
  }
}

const agreeToWaiver = async (userID: string) => {
  let out;
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userID: userID })
  };
  try {
    const response = await fetch(url + 'agreeToWaiver', request);
    if (response.ok) {
      out = await response.json()
    }
    return out
  } catch (err) {
    console.error(err)
  }
}

const nameFromUserID = async (userID: string) => {
  let out;
  const request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  try {
    const params = new URLSearchParams({ userID: JSON.stringify(userID) });
    const response = await fetch(url + 'nameFromUserID?' + params, request);
    if (response.ok) {
      out = await response.json()
    }
    return out
  } catch (err) {
    console.error(err)
  }
}

const handleGoogleAuthCode = async (code: string, redirectURL: string) => {
  let out;
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      authCode: code,
      redirectURL: redirectURL
    })
  };
  try {
    const response = await fetch(url + 'handleGoogleAuthCode', request);
    if (response.ok) {
      out = await response.json()
    } return out
  } catch (err) {
    console.error(err)
  }
}

const updateTranscriptionTitle = async (id: string, title: string) => {
  let out;
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: id, 
      title: title
    })
  };
  try {
    const response = await fetch(url + 'updateTranscriptionTitle', request);
    if (response.ok) {
      out = await response.json()
    }
    return out
  } catch (err) {
    console.error(err)
  }
}

const updateTranscriptionPermissions = async (id: string, perm: string) => {
  let out;
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: id,
      permissions: perm
    })
  };
  try {
    const res = await fetch(url + 'updateTranscriptionPermissions', request);
    if (res.ok) {
      out = await res.json()
    }
    return out
  } catch (err) {
    console.error(err)
  }
}

const saveMultiQuery = async (
  title: string,
  userID: string,
  transcriptionID: string,
  queries: QueryType[], 
  options: MultipleOptionType
) => {
  let out;
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title, userID, transcriptionID, queries, options })
  };
  try {
    const response = await fetch(url + 'saveMultiQuery', request);
    if (response.ok) {
      out = await response.json()
    }
    return out
  } catch (err) {
    console.error(err)
  }
}

const loadQueries = async (userID: string, transcriptionID: string): Promise<
  {
    title: string,
    queries: QueryType[],
    options: MultipleOptionType,
    _id: string,
  }[]
  > => {
  let out;
  const request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  try {
    const params = new URLSearchParams({ userID, transcriptionID });
    const response = await fetch(url + 'loadQueries?' + params, request);
    if (response.ok) {
      out = await response.json()
    }
    
  } catch (err) {
    console.error(err)
  }
  return out
}

const deleteQuery = async (userID: string, queryID: string) => {
  let out;
  const request = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userID, queryID })
  };
  try {
    const response = await fetch(url + 'deleteQuery', request);
    if (response.ok) {
      out = await response.json()
    }
    return out
  } catch (err) {
    console.error(err)
  }
}

const updateTranscriptionOwner = async (
    id: string, ownerObj: UserType, originalOwnerID: string
    ) => {
  let out;
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      transcriptionID: id,
      userID: ownerObj['_id'],
      name: ownerObj['name'],
      family_name: ownerObj['family_name'],
      given_name: ownerObj['given_name'],
      originalOwnerID: originalOwnerID
    })
  };
  try {
    const res = await fetch(url + 'updateTranscriptionOwner', request);
    if (res.ok) {
      out = await res.json()
    }
    return out
  } catch (err) {
    console.error(err)
  }
}

const cloneTranscription = async ({
  id = undefined,
  title = undefined,
  newOwner = undefined,
  permissions = undefined,
  name = undefined,
  family_name = undefined,
  given_name = undefined,
  explicitPermissions = {
    edit: [],
    view: [],
    publicView: false
  },
  soloist = undefined,
  soloInstrument = undefined,
}: {
  id?: string,
  title?: string,
  newOwner?: string,
  permissions?: string,
  name?: string,
  family_name?: string,
  given_name?: string,
  explicitPermissions?: {
    edit: string[],
    view: string[]
    publicView: boolean
  },
  soloist?: string,
  soloInstrument?: string
} = {}) => {
  let out;
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: id, 
      title: title, 
      newOwner: newOwner, 
      permissions: permissions,
      name: name,
      family_name: family_name,
      given_name: given_name,
      explicitPermissions: explicitPermissions,
      soloist: soloist,
      soloInstrument: soloInstrument
    })
  };
  try {
    const response = await fetch(url + 'cloneTranscription', request);
    if (response.ok) {
      out = await response.json()
    }
    return out
  } catch (err) {
    console.error(err)
  }
}

const getInstrumentation = async (audioID: string) => {
  let out;
  const request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  try {
    const params = new URLSearchParams({ audioID: JSON.stringify(audioID) });
    const response = await fetch(url + 'getInstrumentation?' + params, request);
    if (response.ok) {
      out = await response.json()
    }
    return out
  } catch (err) {
    console.error(err)
  }
}

const getIpaVowels = async (): Promise<IpaVowelType[]> => {
  let out;
  const request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  try {
    const response = await fetch(url + 'getIpaVowels', request);
    if (response.ok) {
      out = await response.json()
    }
  } catch (err) {
    console.error(err)
  }
  return out
}

const getConsonants = async (): Promise<IPAConsonantType[]> => {
  let out;
  const request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  try {
    const response = await fetch(url + 'getConsonants', request);
    if (response.ok) {
      out = await response.json()
    }
    
  } catch (err) {
    console.error(err)
  }
  return out
}

const getAllUsers = async () => {
  let out;
  const request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  try {
    const response = await fetch(url + 'allUsers', request);
    if (response.ok) {
      out = await response.json()
    }
    return out
  } catch (err) {
    console.error(err)
  }
}

const getMelographJSON = async (recID: string): Promise<MelographData> => {
  let out;
  try {
    const url = `https://swara.studio/melographs/${recID}/melograph.json`;
    const response = await fetch(url);
    if (response.ok) {
      out = await response.json()
    }
    
  } catch (err) {
    console.error(err)
  }
  return out
}

const getRecsFromIds = async (recIDs: string[]) => {
  let out;
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      recIDs
    })
  };
  try {
    const response = await fetch(url + 'getRecsFromIds', request);
    if (response.ok) {
      out = await response.json()
    }
    return out
  } catch (err) {
    console.error(err)
  }
}

const getAEsFromIds = async (aeIDs: string[]) => {
  let out;
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      aeIDs
    })
  };
  try {
    const response = await fetch(url + 'getAEsFromIds', request);
    if (response.ok) {
      out = await response.json()
    }
    return out
  } catch (err) {
    console.error(err)
  }
};

const getTranscriptionsFromIds = async (transIDs: string[], userID: string) => {
  let out;
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      transIDs,
      userID
    })
  };
  try {
    const response = await fetch(url + 'getTranscriptionsFromIds', request);
    if (response.ok) {
      out = await response.json()
    }
    return out
  } catch (err) {
    console.error(err)
  }
}

const getEditableCollections = async (userID: string): Promise<CollectionType[]> => {
  let out;
  const request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  try {
    const params = new URLSearchParams({ userID: JSON.stringify(userID) });
    const res = await fetch(url + 'getEditableCollections?' + params, request);
    if (res.ok) {
      out = await res.json()
    }
    
  } catch (err) {
    console.error(err)
  }
  return out
}

const getSavedSettings = async (userID: string) => {
  let out: DisplaySettings[] = [];
  const request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  try {
    const params = new URLSearchParams({ userID: userID });
    const res = await fetch(url + 'getSavedSettings?' + params, request);
    if (res.ok) {
      out = await res.json()
    }
  } catch (err) {
    console.error(err)
  }
  return out
}

const saveDisplaySettings = async (userID: string, settings: DisplaySettings) => {
  let out;
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userID, settings })
  };
  try {
    const res = await fetch(url + 'saveDisplaySettings', request);
    if (res.ok) {
      out = await res.json()
    }
    return out
  } catch (err) {
    console.error(err)
  }
}

const getDefaultSettings = async (userID: string) => {
  let out: string = '';
  const request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  try {
    const params = new URLSearchParams({ userID: userID });
    const res = await fetch(url + 'getDefaultSettings?' + params, request);
    if (res.ok) {
      out = await res.json()
    }
  } catch (err) {
    console.error(err)
  }
  return out
}

const setDefaultSettings = async (userID: string, settingsID: string) => {
  let out;
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userID, settingsID })
  };
  try {
    const res = await fetch(url + 'setDefaultSettings', request);
    if (res.ok) {
      out = await res.json()
    }
  } catch (err) {
    console.error(err)
  }
  return out
};

const updateSavedDisplaySettings = async (userId: string, uniqueId: string, settings: DisplaySettings) => {
  let out;
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId, uniqueId, settings })
  };
  try {
    const res = await fetch(url + 'updateDisplaySettings', request);
    if (res.ok) {
      out = await res.json()
    }
  } catch (err) {
    console.error(err)
  }
  return out
}

const deleteSavedDisplaySettings = async (userId: string, uniqueId: string) => {
  let out;
  const request = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId, uniqueId })
  };
  try {
    const res = await fetch(url + 'deleteDisplaySettings', request);
    if (res.ok) {
      out = await res.json()
    }
  } catch (err) {
    console.error(err)
  }
  return out
}

const getTranscriptionInstrumentation = async (transcriptionID: string) => {
  let out: Instrument[] = [];
  const request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  try {
    const params = new URLSearchParams({ transcriptionID: transcriptionID });
    const res = await fetch(url + 'getTranscriptionInstrumentation?' + params, request);
    if (res.ok) {
      out = await res.json()
    }
  } catch (err) {
    console.error(err)
  }
  return out
}

const updateInstrumentation = async (transcriptionID: string, instrumentation: Instrument[]) => {
  let out;
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ transcriptionID, instrumentation })
  };
  try {
    const res = await fetch(url + 'updateInstrumentation', request);
    if (res.ok) {
      out = await res.json()
    }
  } catch (err) {
    console.error(err)
  }
  return out
}

const updateCollectionInviteCode = async (id: string, inviteCode: string) => {
  let out;
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id, inviteCode })
  };
  try {
    const res = await fetch(url + 'updateCollectionInviteCode', request);
    if (res.ok) {
      out = await res.json()
    }
  } catch (err) {
    console.error(err)
  }
  return out
}

const enrollUserInCollection = async (userID: string, inviteCode: string) => {
  let out;
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userID, inviteCode })
  };
  try {
    const res = await fetch(url + 'enrollUserInCollection', request);
    if (res.ok) {
      out = await res.json()
    }
  } catch (err) {
    console.error(err)
  }
  return out
}

const updateTranscriptionViewed = async (
  userID: string, 
  transcriptionID: string
) => {
  let out;
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userID, transcriptionID })
  };
  try {
    const res = await fetch(url + 'updateTranscriptionViewed', request);
    if (res.ok) {
      out = await res.json()
    }
  } catch (err) {
    console.error(err)
  }
  return out
}

const getUsersLastViewedTranscriptions = async (
  userId: string
): Promise<{ [key: string]: string }> => {
  let out;
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId })
  }
  try {
    const res = await fetch(url + 'getUsersLastViewedTranscriptions', request);
    if (res.ok) {
      out = await res.json()
    }
  } catch (err) {
    console.error(err)
  }
  return out
}

const getDNExtractExcel = async (id: string, options: DN_ExtractorOptions) => {
  let out;
  const request = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  try {
    const params = new URLSearchParams({ id, options: JSON.stringify(options) });
    const res = await fetch(url + 'DNExtractExcel?' + params, request);
    if (res.ok) {
      out = await res.arrayBuffer();
    }
  } catch (err) {
    console.error(err)
  }
  return out
}


export { 
  getPiece,
  savePiece,
  getAllPieces,
  createNewPiece,
  deletePiece,
  deleteAudioEvent,
  getAudioDBEntry,
  getAllAudioRecordingMetadata,
  newUploadFile,
  getSortedMusicians,
  getEventTypes,
  getGharana,
  getRagaNames,
  getInstruments,
  getLocationObject,
  getPerformanceSections,
  initializeAudioEvent,
  cleanEmptyDoc,
  saveAudioMetadata,
  getAllAEMetadata,
  getAudioEvent,
  updateSaEstimate,
  getVerifiedStatus,
  getRaagRule,
  saveRaagRules,
  getAudioRecording,
  getNumberOfSpectrograms,
  userLoginGoogle,
  agreeToWaiver,
  nameFromUserID,
  makeSpectrograms,
  pieceExists,
  handleGoogleAuthCode,
  cloneTranscription,
  excelData,
  jsonData,
  updateTranscriptionTitle,
  updateTranscriptionPermissions,
  getInstrumentation,
  getIpaVowels,
  getConsonants,
  getAllTransOfAudioFile,
  getAllUsers,
  updateTranscriptionOwner,
  getMelographJSON,
  makeMelograph,
  deleteRecording,
  createCollection,
  deleteCollection,
  updateCollection,
  getAllCollections,
  getEditableCollections,
  addRecordingToCollection,
  addAEToCollection,
  addTransToCollection,
  removeRecFromColl,
  removeAEfromColl,
  removeTFromColl,
  getRecsFromIds,
  getAEsFromIds,
  getTranscriptionsFromIds,
  getAllMusicians,
  getAllGharanas,
  addMusicianToDB,
  addGharanaToDB,
  addCountryToDB,
  addCityToDB,
  addRaagToDB,
  updateAudioRecording,
  verifySpectrogram,
  verifyMelograph,
  updateVisibility,
  getLooseRecordings,
  saveMultiQuery,
  loadQueries,
  deleteQuery,
  getSavedSettings,
  saveDisplaySettings,
  getDefaultSettings,
  setDefaultSettings,
  updateSavedDisplaySettings,
  deleteSavedDisplaySettings,
  getTranscriptionInstrumentation,
  updateInstrumentation,
  updateCollectionInviteCode,
  enrollUserInCollection,
  updateTranscriptionViewed,
  getUsersLastViewedTranscriptions,
  getDNExtractExcel,
}
