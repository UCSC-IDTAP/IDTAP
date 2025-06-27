# Changelog


* test: cover group deserialization [ea25ca8] (Jon Myers)
* test: cover phrase fallback grid creation [d29bdea] (Jon Myers)
* test: include nonzero id trajectory in noteViewPhrase [92efc45] (Jon Myers)
* test: ensure chikari setter populates grid [d9e1eed] (Jon Myers)
* test: verify phrase duration scaling [d833eea] (Jon Myers)
* test: verify trajectory log frequency range [98c1a4e] (Jon Myers)
* test: cover Trajectory.durationsOfFixedPitches [9d7e8ed] (Jon Myers)
* test: ensure custom ratios update tuning [2932caf] (Jon Myers)
* test: normalize articulation key [d13dd5e] (Jon Myers)
* test: ensure id6 default durArray [1b6ce4b] (Jon Myers)
* test: ensure vocal instrumentation defaults articulations empty [a06d772] (Jon Myers)
* test: cover negative pitch numbers [d2afa71] (Jon Myers)
* test: handle out of range ratio index [6c9ae74] (Jon Myers)
* test: ensure valueAtX rejects out-of-range times [41a62ff] (Jon Myers)
* test: group edge cases without dependency changes [f118216] (Jon Myers)
* test: cover section cleanup paths [6bd221e] (Jon Myers)
* test: add sloped getter and endTime check [900bcc4] (Jon Myers)
* test: validate Trajectory constructor errors [26f5185] (Jon Myers)
* test: ensure zero duration segments removed [18aa585] (Jon Myers)
* test: add removeConsonant coverage [0700b8d] (Jon Myers)
* test: ensure error on non string consonant stroke [995c2f7] (Jon Myers)
* test: validate grid padding in Phrase [3ee8461] (Jon Myers)
* test: verify pitch realignment [d9c9889] (Jon Myers)
* test: cover error in trajIdxFromTime [6497bac] (Jon Myers)
* test: expand Group coverage [f4a3ea2] (Jon Myers)
* test: validate undefined ratios [b177c31] (Jon Myers)
* test: add invalid swara constructor cases [91bf748] (Jon Myers)
* test: cover pitch constructor validation [37aa872] (Jon Myers)
* test: cover extreme octave strings [96f4ff5] (Jon Myers)
* test: cover extreme octave strings [ccfc074] (Jon Myers)
* test: cover piece constructor defaults [a2b9cfc] (Jon Myers)
* test: ensure allDisplayVowels requires vocal instrument [c4cdd01] (Jon Myers)
* test: cover model Raga conversion methods [be2ca6b] (Jon Myers)
* test: cover octave rounding branch [1efaebe] (Jon Myers)
### 2025-06-27

* test: ensure strokeNickname defaults for d [eefbe7c] (Jon Myers)
* test: verify stroke nickname for r [cf74bb8] (Jon Myers)
* test: add trajectory proportions cases [24ba51d] (Jon Myers)
* test: extend raga suite [c8d1b0c] (Jon Myers)
* test: expand group coverage [3ea986c] (Jon Myers)
* test: expand Pitch coverage [7fc65ec] (Jon Myers)
* test: extend Group unit tests [b370297] (Jon Myers)
* test: expand trajectory coverage [9026dc7] (Jon Myers)
* test: cover additional trajectory and piece cases [15ff52c] (Jon Myers)
* test: cover raga util branches [f2e5294] (Jon Myers)
* test: parameterize trajectory compute [4a9038b] (Jon Myers)
* test: expand piece utility coverage [2e8e071] (Jon Myers)
* test: add section duplicates test [1654c47] (Jon Myers)
* test: add automation fromJSON round-trip and assemblage descriptor checks [1500cc5] (Jon Myers)
### 2025-06-26

* Feat: Implemented four strings for Chikari [d7158ba] (Jon Myers)
### 2025-06-17

* Feat: Added Assemblage editor [c0386f1] (Jon Myers)
### 2025-06-05

* feat: while a drag dot is selected, pressing enter / return  deselects drag dots, leaving trajectory selected [f23bc20] (Jon Myers)
* Feat: holding shift and pressing left or right while a trajectory is selected now selects or moves to a different selected drag dot. (fixes #639) [979e826] (Jon Myers)
* Feat: Improved the look and privacy when adding users as editors or viewers of a transcription [3e69f03] (Jon Myers)
* feat: while a drag dot is selected, pressing enter / return  deselects drag dots, leaving trajectory selected [68b9ed3] (Jon Myers)
* Feat: holding shift and pressing left or right while a trajectory is selected now selects or moves to a different selected drag dot. (fixes #639) [264b2d7] (Jon Myers)
* Feat: Improved the look and privacy when adding users as editors or viewers of a transcription [c1b2093] (Jon Myers)
### 2025-06-02

## June 2025

* Feat: clicking on a drag dot now makes it selected, allowing it to be dragged by clicking and dragging with the mouse or nudged by pressing the arrow keys. [64b0719] (Jon Myers)
* Feat: While a trajectory is selected, press tab to select the next trajectory, or shift-tab to select the previous trajectory. [5f61ee3] (Jon Myers)
* Feat: Trajectory orientation dots can now be removed while in trajectory mode by hodling alt / option and clicking on a dot [fe4c26e] (Jon Myers)
### 2025-05-19

* Feat: Now when holding option / alt while a single trajectory is selected, arrow keys can be used to adjust slope. [160e6d7] (Jon Myers)
### 2025-05-06

## May 2025

* Feat: Added ability to add orientation dot to Trajectory via context menu [1e4e7fb] (Jon Myers)
* Feat: traj 6 can now have an unlimited number of points. [4d5e816] (Jon Myers)
### 2025-04-24

* Feat: Added toggleable phrase labels in X axis [18cda53] (Jon Myers)
### 2025-04-22

* Feat: Added ability to annotated trajectories. [ba0ecc0] (Jon Myers)
### 2025-04-21

* Feat: Added ad hoc annotations for sections and phrases [fa3fa34] (Jon Myers)
### 2025-04-18

* Feat: Added ability to select an excerpt from a recording when setting up a transcription [729b243] (Jon Myers)
### 2025-04-08

## April 2025

* feat: added ability to download "staff tuning", to show cents offset of tuning system on stave with C as tonic [c40beab] (Jon Myers)
### 2025-03-20

* Feat: scale system designation now is implemented in visibility of "Pitch Label" (formerly "Sargam") [2066007] (Jon Myers)
* Feat: implemented scale systems in tuning controls [a143341] (Jon Myers)
### 2025-03-19

* Feat: added a number of scale systems with cents deviations and implemented them in YAxis labeling [7b09b05] (Jon Myers)
### 2025-03-18

* fix: sharing transcription link now working correctly [ce15305] (Jon Myers)
* Feat: Imaging and Color Controls has been renamed to Transcription and Graphic Controls [75bb998] (Jon Myers)
* Fix: Scrolling playhead timing fixed on windows [450a204] (Jon Myers)
### 2025-03-13

* Fix: fixes windows but with animated playhead [3475f0c] (Jon Myers)
### 2025-03-12

* Fix: addresses bugs with playback timing, especially chikari and plucks being late. [2dcf234] (Jon Myers)
* feat: Visibility settings can now be saved via Display Settings [a8c5fcb] (Jon Myers)
* feat: moved visibility controls away from upper right and into "imaging and color controls" [fce3f98] (Jon Myers)
### 2025-03-10

* Feat: Implemented various scaleSystem settings for yAxis [20c6ded] (Jon Myers)
* Fix: bug where incorrect sargam line was moving in response to tuning changes [564c1e2] (Jon Myers)
### 2025-03-07

## March 2025

* Feat: "remove from collection" now accessible from editor [ffbb8dd] (Jon Myers)
* Feat: Add to collection is now available from within editor via the context menu [9b77cb6] (Jon Myers)
* Feat: Transcriptions are now sortable by most recently viewed (by the current user). Also, this is now the default sort state. [40aea20] (Jon Myers)
* Fix: spectrogram now updates current canvas when changing max or min pitch [caecf0a] (Jon Myers)
* Feat: added title to audio recoridngs [b3b3c2c] (Jon Myers)
### 2025-02-27

* fix: prevents the creation of transcriptions with non-implemented instrumentation. [657b115] (Jon Myers)
### 2025-02-26

* Feat: added reset audio button [68ffce0] (Jon Myers)
* fix: updated vite config so that assetsIncluded hack only happens for buildi (not for running dev server). Now audio synths work again. [db7b7fa] (Jon Myers)
* fix: All labels now associated with appropriate checkbox or radio button [ebe2ca8] (Jon Myers)
### 2025-02-25

* fix: deploy should now deploy after updates to changelog [779f707] (Jon Myers)
* Feat: All pushes to and merges into main branch now build app and deploy to swara.studio automatically via github actions [6b3106e] (Jon Myers)
* feat: alerts user when the piece doesn't exist or they don't have permission to view [9daa089] (Jon Myers)
* fix: when linked to a file you don't have permission to view, you are now redirected away to the transcriptions tab [2ebbcba] (Jon Myers)
* feat: Added invite code to collections so that collection owners can enroll anyone with invite link. [4c9f031] (Jon Myers)
### 2025-02-24

* fix: error where krintin and slide middle articulations were disappearing when nudged too close to edges [a56f016] (Jon Myers)
### 2025-02-21

* fix: server error when uploading long recordings [52b3f54] (Jon Myers)
### 2025-02-20

## February 2025

* feat: added soloist to transcriptions [8c276a5] (Jon Myers)
* Fix: firefox x-axis placement is now offset correctly [24c9bf3] (Jon Myers)
### 2025-01-21

* fix: bug with regex characters not being properly escaped in filterableTable, was causing screen to turn black. [c64d192] (Jon Myers)
* fix: disallow ability to change transcription modes if user doesn't have editing permissions [4a705e0] (Jon Myers)
* feat: added link to changelog from landing page [dbe45a5] (Jon Myers)
* fix: bug wherein certain pitches aren't allowing for trajectory orienting dots to be added [ebaa596] (Jon Myers)
* feat: double-clicking on transcription label in collections now opens transcription in editor [ae629d8] (Jon Myers)
### 2025-01-17

* fix: corrected which github action is in use [f8a0453] (Jon Myers)
* fix: saving auto-deploy for later [95027f3] (Jon Myers)
* fix: update deploy script [df1022d] (Jon Myers)
* feat: auto build and deploy [c89ee19] (Jon Myers)
* feat: adding changelog to site [66de273] (Jon Myers)
### 2025-01-14

## January 2025

