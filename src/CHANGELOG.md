# Changelog


* feat: use Python 3.11 with uv-managed venv for server scripts [c39e27e] (Jon Myers)
* chore: update server lockfile for qs override [038bae4] (Jon Myers)
* chore: update lockfile for qs override [61d7258] (Jon Myers)
* fix: update urllib3 to >=2.6.0 for security vulnerability [8f165e8] (Jon Myers)
* fix: add qs security override and improve deploy scripts [2340792] (Jon Myers)
### 2026-01-02

## January 2026

* docs: update editor instructions with missing shortcuts and fixes [17f8a25] (Jon Myers)
* docs: update editor instructions for December 2025 features [dba20a0] (Jon Myers)
### 2025-12-19

* fix: use e.code instead of e.key for alt+m shortcut [9b89916] (Jon Myers)
* feat: add alt/option+m shortcut to toggle meter magnet mode [bffd6f4] (Jon Myers)
* feat: snap playhead double-click to meter pulse [bb2a5ff] (Jon Myers)
* feat: snap drag dot arrow key nudge to meter pulses [d55645f] (Jon Myers)
* fix: snap both region start and end in Option+drag [8b0093f] (Jon Myers)
* fix: apply meter snap inline in dragEnd before drawing region [8591c29] (Jon Myers)
* fix: emit snapped regionEndPxl value in Option+drag [e95ba82] (Jon Myers)
* fix: emit snapped region values to update XAxis display [25fb3d9] (Jon Myers)
* feat: snap region selection to meter pulses when meter magnet is on [bc22d1f] (Jon Myers)
* fix: only exit serial mode when next trajectory is melodic [5db8574] (Jon Myers)
* fix: improve meter boundary click detection and serial mode exit [2f13004] (Jon Myers)
* fix: disable pointer-events on meter elements when not in meter mode [b08396a] (Jon Myers)
* fix: improve background click deselection in EditorMode.None [5c040ae] (Jon Myers)
* fix: allow trajectory mode to start at melodic boundaries with meter magnet [dd2c989] (Jon Myers)
* fix: serial mode trajectory insertion across multiple silence regions [a900ac4] (Jon Myers)
* fix: serial mode boundary detection and add Quantize to Meter option [31f7652] (Jon Myers)
* fix: add phrase/vibhag labels to display settings and fix vibhag drift [84bc899] (Jon Myers)
### 2025-12-18

* fix: clean up metronome audio nodes to prevent audio engine overflow [45b2f66] (Jon Myers)
* fix: improve vibhag vs matra level detection for multi-cycle input [d3659c6] (Jon Myers)
* fix: calculate nudge bounds from actual pulse positions, not theoretical [fabd61e] (Jon Myers)
* feat: redistribute last segment matras when adding time points [daae4aa] (Jon Myers)
* fix: ensure enough predicted times for multi-cycle addTimePoints [ae1262c] (Jon Myers)
* fix: correct filter in findClosestIdxs to use stored item index [c7df1c0] (Jon Myers)
* fix: pass override=true in offsetSegmentBoundary redistribution calls [af50693] (Jon Myers)
### 2025-12-16

* feat: add trimEndTime method for meter end re-interpolation [638df74] (Jon Myers)
* fix: improve tap-to-pulse meter creation and cycle addition [c344595] (Jon Myers)
* feat: call resetTempo after addTimePoints [0f20661] (Jon Myers)
* fix: find previous meter directly in addTimePointsToPrevMeter [68b0f25] (Jon Myers)
* fix: add tolerance to meter overlap check [bba1382] (Jon Myers)
* fix: guard against undefined meter and add vibhag expansion in addTimePointsToPrevMeter [b3f9aac] (Jon Myers)
* fix: memory leak in enterMeterModeWithPulses event listener cleanup [252e213] (Jon Myers)
* feat: segment-aware nudging for tala vibhag boundaries [f0b3ae9] (Jon Myers)
* fix: expand vibhag taps to matra timepoints for tala meters [117dac6] (Jon Myers)
* fix: use tala preset when inserting meter from pulses [0c81e01] (Jon Myers)
* feat: default layer visibility to 0 (vibhag level) [cbf069e] (Jon Myers)
* feat: distinguish vibhag beats in metronome with different sound [2c074eb] (Jon Myers)
* refactor: remove redundant displayTempo getter/setter from Meter [d8fada8] (Jon Myers)
* fix: tempo now correctly represents matra rate [0183293] (Jon Myers)
* feat: default to Tintal when tala mode is selected [aea23fb] (Jon Myers)
* fix: compensate for audio output latency in pulse tap detection [4cc470d] (Jon Myers)
* feat: rename layer radio buttons to Vibhag and Matra [468577a] (Jon Myers)
* feat: default meter mode to tala instead of custom [af15346] (Jon Myers)
* fix: compare meters by uniqueId instead of object identity [8187f90] (Jon Myers)
### 2025-12-15

* fix: prevent debounced click handler from clearing pulse selection [0834bb5] (Jon Myers)
* feat: integrate pulse tap recording with meter insertion [9b0e76d] (Jon Myers)
* feat: add pulse tap recording UI and capture time tracking [dc9dfde] (Jon Myers)
* chore: default metronome checkbox to off [ec66aa2] (Jon Myers)
* fix: correct metronome scheduling filter condition [960a0a2] (Jon Myers)
* fix: increase metronome woodblock amplitude [9477989] (Jon Myers)
* fix: initialize metronome gain nodes explicitly on Synths setup [7eaf2e5] (Jon Myers)
* fix: filter out trajectories with invalid logFreqs in allDisplayBols [bdbcbf1] (Jon Myers)
* chore: remove debug console.log statements [49ce9d2] (Jon Myers)
### 2025-12-12

* docs: add comment explaining query param precedence (pIdx > t) [726ff2b] (Jon Myers)
* refactor: use explicit undefined checks for bounds validation [079086a] (Jon Myers)
* chore: remove unused queryTime prop from TranscriptionLayer [fbd9a32] (Jon Myers)
* feat: add pIdx and inst query params for phrase-based navigation [d4f1c00] (Jon Myers)
* fix: scroll to correct position when opening editor with ?t= query param [14b55d7] (Jon Myers)
* fix: update deployTSServer to deploy files to correct location [ded7ff5] (Jon Myers)
### 2025-12-10

* fix: regenerate lockfile to match overrides configuration [80eb7da] (Jon Myers)
* fix: don't change metronome volume when loop is toggled [057a6c5] (Jon Myers)
* fix: disable metronome when loop is enabled [34ef8dc] (Jon Myers)
* feat: disable metronome when pitch shift or region speed is enabled [5228d54] (Jon Myers)
* refactor: consolidate woodblock to single instance and add cancel method [49656e2] (Jon Myers)
* refactor: integrate WoodblockSynth class for metronome clicks [e9afc9a] (Jon Myers)
* feat: add metronome UI controls and fix displayTempo references [68d35eb] (Jon Myers)
* feat: add highpass filter option to metronome bursts [2e400f7] (Jon Myers)
* feat: add displayTempo getter/setter and fix complex hierarchy handling [a348d2b] (Jon Myers)
### 2025-12-08

## December 2025

* fix: prevent axis line from being covered by phrase/vibhag rows [96753d6] (Jon Myers)
* fix: enable direct tempo input by splitting update methods [961905e] (Jon Myers)
### 2025-11-19

* feat: add vibhaga labels display to X-axis with cycle repetition support [4ff2f06] (Jon Myers)
* fix: prevent Page Up/Down/Home/End keys from scrolling editor window [09c7897] (Jon Myers)
### 2025-11-17

* chore: remove remaining debug console.log statements [70bea57] (Jon Myers)
* refactor: simplify throttle/debounce in lazy loading [8637e90] (Jon Myers)
* chore: clean up lazy loading implementation [04df599] (Jon Myers)
### 2025-11-13

* fix: implement viewport-based tracking for bidirectional lazy loading [290270b] (Jon Myers)
### 2025-11-12

* fix: update vite override to match lockfile version [698da6d] (Jon Myers)
* fix: upgrade vite to 7.2.1 to patch file system bypass vulnerability [8bfc008] (Jon Myers)
### 2025-11-06

## November 2025

* fix: rebuild extract.js for phrase-based section tracking and add backup docs [df5d24a] (Jon Myers)
### 2025-10-04

## October 2025

* chore: remove debug logging from updatePhraseDivType [c08540d] (Jon Myers)
* fix: remove legacy sectionStartsGrid from database on save [1f21b2f] (Jon Myers)
* fix: get section index at correct time when toggling phrase div type [71a9ccf] (Jon Myers)
* fix: sync section categorization arrays when toggling phrase div type [61001b0] (Jon Myers)
* fix: correct section metadata cleanup timing in deletePhraseDiv [49feb0d] (Jon Myers)
* fix: update phraseCategorizationPreservation test for new phrase-based system [89895bc] (Jon Myers)
* feat: migrate to phrase-based section tracking with isSectionStart [057f8f0] (Jon Myers)
### 2025-09-30

* docs: update editor instructions with new UI controls [5f5b222] (Jon Myers)
* feat: add 5x nudge speed for drag dots with option/alt key [8e4efbe] (Jon Myers)
* fix: correct initial pulse selection direction with shift+arrow [9ca33b9] (Jon Myers)
* feat: add shift+arrow navigation for meter pulse selection [b066c4d] (Jon Myers)
* feat: implement select-then-drag pattern for meter pulses [ef8e138] (Jon Myers)
### 2025-09-25

* docs: add critical git branching guidelines to prevent direct main pushes [d1f3a05] (Jon Myers)
* feat: add custom track titles feature for instrument identification [770c1ef] (Jon Myers)
* fix: resolve string 2 trajectory splitting and merging issues in polyphonic operations [c4e80d3] (Jon Myers)
* fix: resolve polyphonic string cross-contamination in trajectory orientation dot operations [d065556] (Jon Myers)
### 2025-09-24

* fix: resolve ESLint configuration conflict and make linting optional in CI [71c312a] (Jon Myers)
* feat: add CI workflow for automated testing on PRs [24f7479] (Jon Myers)
* fix: resolve remaining failing tests in trajectory and apiRoutes [4f41fdf] (Jon Myers)
* fix: correct outdated phrase tests to match current implementation [184f27e] (Jon Myers)
* feat: implement categorization preservation for phrase division operations [75d3a13] (Jon Myers)
* fix: use zoom-aware threshold consistently for all dot attachments [1f064d5] (Jon Myers)
* refactor: extract attachment logic into reusable helper function [9d5eeed] (Jon Myers)
* fix: add missing closing parenthesis in claude-review workflow [9dce4b8] (Jon Myers)
* feat: implement zoom-aware attachment threshold for orientation dots [f77e171] (Jon Myers)
### 2025-09-23

* feat: comprehensive rewrite of Analysis Instructions as user guide [d448664] (Jon Myers)
### 2025-09-18

* fix: resolve dependabot security vulnerabilities [df29ebe] (Jon Myers)
* feat: add comprehensive analysis suite documentation and help system [cad4648] (Jon Myers)
* docs: fix accuracy issues in editor instructions [149495b] (Jon Myers)
* docs: refine editor instructions with accuracy improvements [bcbc3b1] (Jon Myers)
### 2025-09-17

* docs: correct tempo control description - sets meter tempo, not playback speed [4728e5c] (Jon Myers)
* docs: remove non-existent MIDI and CSV export options [fe07666] (Jon Myers)
* docs: clarify play/pause can be done via button click or spacebar [e767801] (Jon Myers)
* docs: correct mouse wheel navigation - no shift required for vertical scroll [b3f09a4] (Jon Myers)
* docs: complete comprehensive rewrite of user instructions [4be24e8] (Jon Myers)
* docs: start comprehensive rewrite of user instructions [5803562] (Jon Myers)
* docs: comprehensive update to CLAUDE.md development guide [df2337b] (Jon Myers)
### 2025-09-16

## September 2025

* feat: implement Polyphonic Individual Instrumentality for Sitar and Sarangi [bd55a2d] (Jon Myers)
### 2025-08-26

## August 2025

* fix: replace Claude workflow with working version from python-api [5c9f7b9] (Jon Myers)
* fix: update Claude workflow to use official OAuth action [b15d9c7] (Jon Myers)
* feat: add Claude PR review workflow [b5e9e0b] (Jon Myers)
* feat: add Claude PR review GitHub Action workflow [aa9086b] (Jon Myers)
* revert: remove Claude review workflow [e1f2a3d] (Jon Myers)
* feat: add Claude PR review GitHub Action workflow [3dc7119] (Jon Myers)
* feat: implement pulse-based getMusicalTime() method in TypeScript Meter class [622ac80] (Jon Myers)
### 2025-09-10

* fix: use minTrajDur for pitch snapping time threshold [0625a3b] (Jon Myers)
* fix: use IntersectionObserver API for immediate meter rendering [0493fd5] (Jon Myers)
* refactor: simplify meter refresh fix to only handle meters [27c8c58] (Jon Myers)
* fix: render meters immediately for visible chunks after zoom [3a10f96] (Jon Myers)
* fix: ensure meters are cleared and regenerated on zoom changes [4489e61] (Jon Myers)
* fix: enable Git LFS in GitHub Actions deployment [5cf35ea] (Jon Myers)
* feat: add timing display toggle for excerpt transcriptions [89d02d8] (Jon Myers)
### 2025-09-03

## September 2025

* feat: add Python Package, ISMIR Paper, and NEH Whitepaper links to landing page [e1bd633] (Jon Myers)
### 2025-08-28

* Fix: standardize UI for editing transcriptions permissions [a199f18] (Jon Myers)
* fix: update sha.js to 2.4.12 to resolve security vulnerability [f942083] (Jon Myers)
### 2025-08-26

* fix: correct recording duration type checking in NewPieceRegistrar [9714714] (Jon Myers)
### 2025-08-18

* fix: complete Python API audio upload processing pipeline [6d52cf3] (Jon Myers)
### 2025-08-14

* fix: add GitHub Actions permissions for changelog updates [ea8dafa] (Jon Myers)
* fix: upgrade tmp package to 0.2.4 in server package [11c510d] (Jon Myers)
* fix: upgrade tmp package to 0.2.4 via pnpm override [013b176] (Jon Myers)
### 2025-08-08

## August 2025

* refactor: remove duplicate Python API client code [9460c8d] (Jon Myers)
* chore: bump version to 0.1.2 [1e9b2c5] (Jon Myers)
* feat: add audio upload API and metadata endpoints [59447cd] (Jon Myers)
* feat: add agreeToWaiver endpoint to API routes and fix waiver caching [e3165a9] (Jon Myers)
### 2025-07-24

* fix: migrate ISMIR paper to Git LFS tracking [16f5c15] (Jon Myers)
* docs: add NEH white paper with Git LFS [b25bd44] (Jon Myers)
* docs: add ISMIR 2025 research paper [10b286f] (Jon Myers)
* chore: update Pipfile with build and twine dependencies [b863b83] (Jon Myers)
* feat: release v0.1.1 with interactive waiver prompting [99eafde] (Jon Myers)
* feat: require users to read waiver text before agreeing [4fbb856] (Jon Myers)
* feat: add research waiver requirement handling to Python API [0d79151] (Jon Myers)
* feat: publish Python API package to PyPI [d169a92] (Jon Myers)
* fix: upgrade axios to 1.11.0 to resolve CVE-2025-7783 [8b64544] (Jon Myers)
### 2025-07-23

* fix: update lockfiles for security patches [40ed5d7] (Jon Myers)
* fix: security fixes [10385f9] (Jon Myers)
* docs: add comprehensive web development guide [5667a3e] (Jon Myers)
### 2025-07-22

* feat: add user-specific override for dotted line animation [dca5657] (Jon Myers)
* refactor: clean up DottedLine type and remove unused pausedAt field [5b4fbc4] (Jon Myers)
* feat: add dotted line playback animation mode [689485f] (Jon Myers)
### 2025-07-17

* feat: implement secure token storage for Python client [e0b616d] (Jon Myers)
* fix: use VITE_GOOGLE_CLIENT_ID environment variable for proper Vite build integration [07f7c0e] (Jon Myers)
* fix: add VUE_APP_GOOGLE_CLIENT_ID environment variable to GitHub Actions build [75aaf34] (Jon Myers)
* feat: added privacy policy [967ea41] (Jon Myers)
### 2025-07-16

* fix: reset selectedDragDotIdx when tabbing between trajectories (#642) [cb4da48] (Jon Myers)
### 2025-07-15

## July 2025

* feat: port Assemblage class and tests to Python [59498be] (Jon Myers)
* refactor: consolidate trajectory test imports [548cc2c] (Jon Myers)
* fix: update paths and order after test move [7a60135] (Jon Myers)
* feat: port chikari to python [637efbf] (Jon Myers)
### 2025-06-27

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

