enum SortState {
  up = 'up',
  down = 'down',
}

enum EditorMode {
  Trajectory = 'Trajectory',
  Series = 'Series',
  PhraseDiv = 'PhraseDiv',
  Meter = 'Meter',
  Chikari = 'Chikari',
  Region = 'Region',
  AssemblagePhrasePick = 'AssemblagePhrasePick',
  None = 'None',
}

enum Instrument {
  Sitar = 'Sitar',
  Sarangi = 'Sarangi',
  Vocal_M = 'Vocal (M)',
  Vocal_F = 'Vocal (F)',
  Bansuri = 'Bansuri',
  Esraj = 'Esraj',
  Rabab = 'Rabab',
  Santoor = 'Santoor',
  Sarod = 'Sarod',
  Shehnai = 'Shehnai',
  Surbahar = 'Surbahar',
  Veena_Saraswati = 'Veena (Saraswati)',
  Veena_Vichitra = 'Veena (Vichitra)',
  Veena_Rudra_Bin = 'Veena (Rudra Bin)',
  Violin = 'Violin',
  Harmonium = 'Harmonium',
}

enum ControlsMode {
  Display = 'Display',
  Tag = 'Tag',
  Meter = 'Meter',
  Download = 'Download',
  Share = 'Share',
  Tuning = 'Tuning',
  Synthesis = 'Synthesis',
  Assemblage = 'Assemblage',
  None = 'None',
}

enum PlayheadAnimations {
  Animated = 'Animated',
  Block = 'Block',
  None = 'None',
}

enum ScaleSystem {
  Sargam = 'Sargam',
  Solfege = 'Solfege',
  PitchClass = 'Pitch Class',
  Cents = 'Fixed A440 Pitch + Cents',
  SargamCents = 'Sargam + Cents',
  SolfegeCents = 'Solfege + Cents',
  PitchClassCents = 'Pitch Class + Cents',
  MovableCCents = 'Movable C Pitch + Cents',
}

enum SargamRepresentation {
  Sargam = 'Sargam',
  Solfege = 'Solfege',
  PitchClass = 'Pitch Class',
  WesternPitch = 'Western Pitch',
}

enum PhonemeRepresentation {
  IPA = 'IPA',
  Devanagari = 'Devanagari',
  Latin = 'English',
}

enum LabelScheme {
  Structured = 'Structured',
  AdHoc = 'Ad Hoc',
}

enum PitchRepresentation {
  Chroma = 'chroma',
  PitchNumber = 'pitchNumber',
  SargamLetter = 'sargamLetter',
  OctavedSargamLetter = 'octavedSargamLetter',
  ScaleDegree = 'scaleDegree',
  OctavedScaleDegree = 'octavedScaleDegree',
}

enum Segmentation {
  UserDefined = 'user-defined',
  Silence = 'silence',
  Chikari = 'chikari',
  MelodicDiscontinuity = 'melodic discontinuity',
}

enum PitchInclusionMethod {
  All = 'all',
  AboveThreshold = 'above threshold', // not implemented yet
}



export {
  SortState,
  EditorMode,
  Instrument,
  ControlsMode,
  PlayheadAnimations,
  ScaleSystem,
  SargamRepresentation,
  PhonemeRepresentation,
  LabelScheme,
  PitchRepresentation,
  Segmentation,
  PitchInclusionMethod,
}
