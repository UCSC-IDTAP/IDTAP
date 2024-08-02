import { 
  Raga, 
  Trajectory, 
  Piece,
  Pitch,
  Phrase
} from '@/js/classes.ts';

import {
  ValueFn
} from 'd3';

type CollectionType = {
  _id?: string;
  title: string;
  userID: string;
  permissions: {
    view: string[]; // list of userIDs
    edit: string[]; // list of userIDs
    publicView: boolean; // potentially overrides the need for view list
  };
  purpose: 'Pedagogical' | 'Research' | 'Appreciative' | 'Creative' | 'Other';
  description?: string;
  audioRecordings: string[]; // list of audioRecordingIDs
  audioEvents: string[]; // list of audioEventIDs
  transcriptions: string[]; // list of transcriptionIDs
  userName?: string;
  dateCreated?: Date;
  dateModified?: Date;
  color?: string;
}

type AutoValue = {
  normTime: number,
  value: number
}

type UserType = {
  email: string;
  family_name: string;
  given_name: string;
  name: string;
  picture: string;
  sub: string;
  waiverAgreed: boolean;
  _id: string;
}

type ContextMenuOptionType = {
  text: string,
  action: () => void,
  enabled?: boolean,
}

type TransMetadataType = {
  title: string,
  audioID: string,
  dateCreated: string,
  dateModified: string,
  durTot: number,
  family_name: string,
  given_name: string,
  instrumentation: string[],
  location: string,
  name: string,
  permissions: string,
  performers: string[],
  raga: {
    name: string,
    fundamental: number,
    ratios: number[]
  },
  transcriber: string,
  userID: string,
  _id: string,
  explicitPermissions: {
    publicView: boolean,
    edit: string[],
    view: string[]
  },
  soloist?: string,
  soloInstrument?: string,
}


type MusicianDBType = {
  _id: string;
  'Initial Name': string;
  'Full Name'?: string;
  'First Name'?: string;
  'Middle Name'?: string;
  'Second Middle Name'?: string;
  'Last Name'?: string;
  'Alternative Name'?: string;
  Born?: number;
  Died?: number;
  Gharana?: string;
  Gender?: 'M' | 'F' | 'O';
  Instrument?: string;
  'All Instruments'?: string[];
}

type GharanaType = {
  _id: string;
  name: string;
  members: string[];
}


type CategoryType = (
  'trajectoryID' |
  'pitch' |
  'vowel' |
  'startingConsonant' |
  'endingConsonant' |
  'anyConsonant' |
  'pitchSequenceStrict' |
  'pitchSequenceLoose' |
  'trajSequenceStrict' | 
  'trajSequenceLoose' |
  'sectionTopLevel' |
  'alapSection' |
  'compType' | 
  'compSecTempo' |
  'tala' | 
  'phraseType' |
  'elaborationType' |
  'vocalArtType' | 
  'instArtType' |
  'incidental'
)

type DesignatorType = 'includes' | 'excludes' | 'startsWith' | 'endsWith';

type SegmentationType = (
  'phrase' |
  'group' |
  'sequenceOfTrajectories' |
  'connectedSequenceOfTrajectories'
)

type SecCatType = {
  "Pre-Chiz Alap": {
    "Pre-Chiz Alap": boolean,
  },
  "Alap": {
    "Alap": boolean,
    "Jor": boolean,
    "Alap-Jhala": boolean,
  },
  "Composition Type": {
    "Dhrupad": boolean,
    "Bandish": boolean,
    "Thumri": boolean,
    "Ghazal": boolean,
    "Qawwali": boolean,
    "Dhun": boolean,
    "Tappa": boolean,
    "Bhajan": boolean,
    "Kirtan": boolean,
    "Kriti": boolean,
    "Masitkhani Gat": boolean,
    "Razakhani Gat": boolean,
    "Ferozkhani Gat": boolean,
  },
  "Comp.-section/Tempo": {
    "Ati Vilambit": boolean,
    "Vilambit": boolean,
    "Madhya": boolean,
    "Drut": boolean,
    "Ati Drut": boolean,
    "Jhala": boolean,
  },
  "Tala": {
    "Ektal": boolean,
    "Tintal": boolean,
    "Rupak": boolean
  },
  "Improvisation": {
    "Improvisation": boolean,
  },
  "Other": {
    "Other": boolean,
  },
  "Top Level": (
    "Pre-Chiz Alap" | 
    "Alap" | 
    "Composition" | 
    "Improvisation" | 
    "Other" |
    "None"
  )
}

type QueryType = {
  category: CategoryType,
  designator: DesignatorType,
  pitch?: Pitch,
  trajectoryID?: number,
  vowel?: string,
  consonant?: string,
  pitchSequence?: Pitch[],
  trajIdSequence?: number[],
  sectionTopLevel?: SecCatType['Top Level'],
  alapSection?:  keyof SecCatType['Alap'],
  compType?: keyof SecCatType['Composition Type'],
  compSecTempo?: keyof SecCatType['Comp.-section/Tempo'],
  tala?: keyof SecCatType['Tala'],
  phraseType?: keyof PhraseCatType['Phrase'],
  elaborationType?: keyof PhraseCatType['Elaboration'],
  vocalArtType?: keyof PhraseCatType['Vocal Articulation'],
  instArtType?: keyof PhraseCatType['Instrumental Articulation'],
  incidental?: keyof PhraseCatType['Incidental'],
}

type MultipleReturnType = [
  Trajectory[][], 
  (number | string | { phraseIdx: number, trajIdx: number })[],
  QueryAnswerType[],
];


type QueryAnswerType = {
  trajectories: Trajectory[],
  identifier: (number | string | { phraseIdx: number, trajIdx: number }),
  title: string,
  startTime: number,
  endTime: number,
  duration: number,
  segmentation: SegmentationType,
}

type MultipleOptionType = {
  transcriptionID?: string,
  segmentation?: SegmentationType,
  sequenceLength?: number,
  piece?: Piece,
  minDur?: number,
  maxDur?: number,
  every?: boolean,
}

type PhraseCatType = {
  "Phrase": {
    "Mohra": boolean,
    "Mukra": boolean,
    "Asthai": boolean,
    "Antara": boolean,
    "Manjha": boolean,
    "Abhog": boolean,
    "Sanchari": boolean,
    "Jhala": boolean
  },
  "Elaboration": {
    "Vistar": boolean,
    "Barhat": boolean,
    "Prastar": boolean,
    "Bol Banao": boolean,
    "Bol Alap": boolean,
    "Bol Bandt": boolean,
    "Behlava": boolean,
    "Gat-kari": boolean,
    "Tan (Sapat)": boolean,
    "Tan (Gamak)": boolean,
    "Laykari": boolean,
    "Tihai": boolean,
    "Chakradar": boolean,
  },
  "Vocal Articulation": {
    "Bol": boolean,
    "Non-Tom": boolean,
    "Tarana": boolean,
    "Aakar": boolean,
    "Sargam": boolean
  },
  "Instrumental Articulation": {
    "Bol": boolean,
    "Non-Bol": boolean
  },
  "Incidental": {
    "Talk/Conversation": boolean,
      "Praise ('Vah')": boolean,
      "Tuning": boolean,
      "Pause": boolean,
  }
}

type UserDataType = {
  sub: string,
  picture: string,
  email: string,
  name: string,
  given_name: string,
  family_name: string
}

type RaisedLoweredType = {
  lowered: boolean,
  raised: boolean
}
type RuleProfileType = {
  sa: boolean,
  re: RaisedLoweredType,
  ga: RaisedLoweredType,
  ma: RaisedLoweredType,
  pa: boolean,
  dha: RaisedLoweredType,
  ni: RaisedLoweredType
}

type PCountType = {
  [key: number]: { pattern: number[], count: number }[],
  maxSize: number
}

type PitchNameType = 'Sa' | 're' | 'Re' | 'ga' | 'Ga' | 'ma' | 'Ma' | 'Pa' | 
  'dha' | 'Dha' | 'ni' | 'Ni';
type ParamType = (
  number | 
  { value: (CategoryType | DesignatorType), text: string } | 
  PitchNameType |
  string |
  PitchSeqObjType[] | 
  PitchSeqObjType |
  number[]
  );

type PitchSeqObjType = {
  swara: PitchNameType,
  oct: number,
}

type MusicianType = {
  instrument?: string,
  role?: 'Soloist' | 'Accompanist' | 'Percussionist' | 'Drone',
  gharana?: string
}

type MusicianNameType = { 
  'First Name'?: string,
  'Last Name'?: string,
  'Initial Name': string,
  'Middle Name'?: string,
}

type RecObjType = {
  musicians: {
    [key: string]: {
      instrument: string,
      role: string,
      gharana: string
    }
  },
  date: {
    year: string,
    month: string,
    day: string
  },
  location: {
    continent: string,
    country: string,
    city: string
  },
  raags: {
    [key: string]: RaagType
  }
}
type PSecType = {
  end: number,
  start: number
}

type RaagType = {
  end: number,
  start: number,
  'performance sections'?: {
    [key: string]: PSecType
  }
}

type RecType = {
  audioFileId: string,
  date: {
    day: number,
    month: string,
    year: number
  },
  duration: number,
  location: {
    city: string,
    country: string,
    continent: string
  },
  musicians: {
    [key: string]: MusicianType
  },
  octOffset: number,
  raags: {
    [key: string]: RaagType
  },
  saEstimate: number,
  saVerified: boolean,
  _id?: string,
  parentID?: string,
  parentTitle?: string,
  parentTrackNumber?: string,
  explicitPermissions?: {
    edit: string[],
    view: string[],
    publicView: boolean
  },
  dateModified: string | Date,
  userID: string,
}

type AudioEventType = {
  'event type': string,
  name: string,
  permissions: string,
  userID: string,
  _id: string,
  recordings: {
    [key: number]: RecType
  },
  visible?: boolean,
  explicitPermissions?: {
    edit: string[],
    view: string[],
    publicView: boolean
  }
}

type LocationType = {
  _id: string,
} & {
  [key: string]: {
    [key: string]: string[]
  }
}

type RaagTimingType = {
  start: {
    hours: string,
    minutes: string,
    seconds: string
  },
  end: {
    hours: string,
    minutes: string,
    seconds: string
  }
}

type RecUpdateType = {
  musicians: { [name: string]: MusicianType },
  location: {
    continent?: string,
    country?: string,
    city?: string,
  },
  date: {
    year?: string,
    month?: string,
    day?: string,
  },
  raags: {
    [name: string]: {
      'performance sections': {
        [name: string]: PSecType
      }
    }
  },
  saEstimate: number,
  saVerified: boolean,
  octOffset: -1 | 0,
  explicitPermissions: {
    publicView: boolean,
    edit: string[],
    view: string[]
  }
};

type EditingSecType = {
  name?: string,
  start: number, 
  end: number, 
  startSecs: string, 
  startMins: string, 
  startHours: string,
  endSecs: string,
  endMins: string,
  endHours: string,
}

type TFuncType = ValueFn<
  SVGPathElement, 
  { x: number, y: number | null; }, 
  string>

type DrawDataType = {
  x: number,
  y: number,
  i?: number,
}

type NewPieceInfoType = {
  title: string;
  transcriber?: string;
  raga: string | Raga;
  audioID: string;
  permissions: string;
  explicitPermissions: {
    publicView: boolean;
    edit: string[];
    view: string[];
  };
  clone?: boolean;
  origID: string;
  instrumentation?: string[];
  phrases?: Phrase[];
  family_name?: string;
  given_name?: string;
  name?: string;
  soloist?: string;
  soloInstrument?: string;
}

type RagaNewPieceInfoType = {
  title: string;
  transcriber?: string;
  raga: Raga;
  audioID: string;
  permissions: string;
  explicitPermissions: {
    publicView: boolean;
    edit: string[];
    view: string[];
  };
  clone?: boolean;
  origID: string;
  instrumentation?: string[];
  phrases?: Phrase[];
  family_name?: string;
  given_name?: string;
  name?: string;
}

type RagaSeedType = {
  name: string;
  fundamental: number;
  ratios: number[];
}

type PassedDataType = {
  title: string;
  raga: RagaSeedType;
  audioEvent: string;
  audioRecording?: RecType;
  origID: string;
  family_name?: string;
  given_name?: string;
  name?: string;
  instrumentation?: string[];
  transcriber?: string;
  soloist?: string;
  soloInstrument?: string;
}

type AudioEventMetadataType = {
  _id: string,
  userID: string,
  permissions: string,
  "event type": string,
  name: string,
  recordings: RecType[],
  explicitPermissions?: {
    edit: string[],
    view: string[]
    publicView: boolean
  }
}

type IpaVowelType = {
  eng_trans: string,
  english: string,
  hindi: { initial: string, final: string | null },
  ipa: string,
  iso_15919: string,
  type: string
  urdu: { initial: string, final: string, medial?: string },
  null: boolean
}

type IPAConsonantType = {
  eng_trans: string,
  example: string,
  hindi: string,
  ipa: string,
  iso_15919: string,
  type: string,
}

type NewPieceDataType = {
  acknowledged: boolean,
  insertedId: string
}

type OnProgressType = (percent: number) => void;

type RulesType = {
  sa: boolean,
  re: {
    lowered: boolean,
    raised: boolean
  },
  ga: {
    lowered: boolean,
    raised: boolean
  },
  ma: {
    lowered: boolean,
    raised: boolean
  },
  pa: boolean,
  dha: {
    lowered: boolean,
    raised: boolean
  },
  ni: {
    lowered: boolean,
    raised: boolean
  }
}

type VibObjType = {
  periods: number;
  vertOffset: number;
  initUp: boolean;
  extent: number;
}

type IdType = 'id0' | 'id1' | 'id2' | 'id3' | 'id4' | 'id5' | 'id6' | 'id7' |
  'id8' | 'id9' | 'id10' | 'id12' | 'id13';

type TrajIdFunction =
  ((x: number, lf?: number[], sl?: number, da?: number[]) => number) |
  ((x: number, lf?: number[], da?: number[]) => number) |
  ((x: number, lf?: number[], sl?: number) => number) |
  ((x: number, lf?: number[]) => number) |
  ((x: number) => number);

type OutputType = 'pitchNumber' | 'chroma' | 'pitch' | 'pitchClass';

type AffiliationType = { 
  psId: string, 
  idx: number, 
  layer?: number,
  segmentedMeterIdx: number,
  strong: boolean,
};

type ArtNameType = (
  'pluck' | 'hammer-off' | 'hammer-on' | 'slide' | 'dampen' | 'consonant'
)
type StrokeNicknameType = "d" | "r" | "da" | "ra" | "di" | "ri"

import { SortState } from '@/ts/enums';

type SortFuncType = ((a: RecType, b: RecType) => (-1 | 0 | 1)) | 
                  ((a: TransMetadataType, b: TransMetadataType) => (-1 | 0 | 1))

type GetDisplayType = (item: RecType | TransMetadataType) => string | number;

type FilterableTableType = {
  label: string,
  minWidth: number,
  prioritization: number,
  sortFunction?: SortFuncType,
  growable: boolean,
  initSortState: SortState,
  getDisplay: GetDisplayType
}

type UserCheckType = (item: RecType | TransMetadataType, userID: string) => boolean;

export enum CMap {
  Blues = 'interpolateBlues',
  BrBG = 'interpolateBrBG',
  BuGn = 'interpolateBuGn',
  BuPu = 'interpolateBuPu',
  Cividis = 'interpolateCividis',
  Cool = 'interpolateCool',
  CubehelixDefault = 'interpolateCubehelixDefault',
  GnBu = 'interpolateGnBu',
  Greens = 'interpolateGreens',
  Greys = 'interpolateGreys',
  Inferno = 'interpolateInferno',
  Magma = 'interpolateMagma',
  OrRd = 'interpolateOrRd',
  Oranges = 'interpolateOranges',
  PRGn = 'interpolatePRGn',
  PiYG = 'interpolatePiYG',
  Plasma = 'interpolatePlasma',
  PuBu = 'interpolatePuBu',
  PuBuGn = 'interpolatePuBuGn',
  PuOr = 'interpolatePuOr',
  PuRd = 'interpolatePuRd',
  Purples = 'interpolatePurples',
  Rainbow = 'interpolateRainbow',
  RdBu = 'interpolateRdBu',
  RdGy = 'interpolateRdGy',
  RdPu = 'interpolateRdPu',
  RdYlBu = 'interpolateRdYlBu',
  RdYlGn = 'interpolateRdYlGn',
  Reds = 'interpolateReds',
  Sinebow = 'interpolateSinebow',
  Spectral = 'interpolateSpectral',
  Turbo = 'interpolateTurbo',
  Viridis = 'interpolateViridis',
  Warm = 'interpolateWarm',
  YlGn = 'interpolateYlGn',
  YlGnBu = 'interpolateYlGnBu',
  YlOrBr = 'interpolateYlOrBr',
  YlOrRd = 'interpolateYlOrRd'  
}

type RenderCall = {
  canvasIdx: number,
  startX: number,
  width: number
}

type MessageType = 'initial' | 'crop' | 'scale' | 'power' | 'color';


interface ProcessMessage {
  type: MessageType;
  extData?: number[];
  extDataShape?: [number, number];
  logMin?: number;
  logMax?: number;
  newScaledShape?: [number, number];
  newPower?: number;
  newCMap?: CMap;
  audioID?: string;
  newVerbose?: boolean;
}

interface WorkerMessage {
  msg: 'process' | 'requestRenderData';
  payload: ProcessMessage | { startX: number, width: number };
}

type MelographData = {
  data_chunks: number[][],
  time_chunk_starts: number[],
  time_increment: number,
}

type SargamDisplayType = { 
  sargam: string, 
  time: number, 
  logFreq: number,
  uId: string,
  track: number,
  pos?: number,
};

type VowelDisplayType = {
  time: number,
  logFreq: number,
  ipaText: string,
  devanagariText: string,
  englishText: string,
  uId: string,
}

type ConsonantDisplayType = {
  time: number,
  logFreq: number,
  ipaText: string,
  devanagariText: string,
  englishText: string,
  uId: string
}

type InstrumentTrackType = {
  inst: string,
  idx: number,
  displaying: boolean,
  sounding: boolean,
  color: string,
  selColor: string,
}

type PhraseDivDisplayType = {
  time: number,
  type: 'phrase' | 'section',
  idx: number,
}

export type { 
  CollectionType, 
  UserType, 
  ContextMenuOptionType,
  MusicianDBType,
  GharanaType,
  CategoryType,
  DesignatorType,
  SegmentationType,
  QueryType,
  MultipleReturnType,
  QueryAnswerType,
  MultipleOptionType,
  SecCatType,
  PhraseCatType,
  UserDataType,
  RaisedLoweredType,
  RuleProfileType,
  PCountType,
  PitchNameType, 
  ParamType,
  PitchSeqObjType,
  MusicianType,
  RecObjType,
  PSecType,
  RaagType,
  RecType,
  AudioEventType,
  LocationType,
  RaagTimingType,
  RecUpdateType,
  EditingSecType,
  TransMetadataType,
  TFuncType,
  DrawDataType,
  NewPieceInfoType,
  RagaNewPieceInfoType,
  PassedDataType,
  AudioEventMetadataType,
  IpaVowelType,
  IPAConsonantType,
  NewPieceDataType,
  OnProgressType,
  RulesType,
  VibObjType,
  IdType,
  TrajIdFunction,
  OutputType,
  AffiliationType,
  ArtNameType,
  StrokeNicknameType,
  AutoValue,
  FilterableTableType,
  SortFuncType,
  GetDisplayType,
  UserCheckType,
  MusicianNameType,
  RenderCall,
  MessageType,
  ProcessMessage,
  WorkerMessage,
  MelographData,
  SargamDisplayType,
  VowelDisplayType,
  ConsonantDisplayType,
  InstrumentTrackType,
  PhraseDivDisplayType
};

