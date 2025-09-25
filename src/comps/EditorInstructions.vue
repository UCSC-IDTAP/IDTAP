<template>
    <div id="idtap-editor-instructions" :style='mainStyle'>
      <h1>IDTAP Editor User Guide</h1>
      <p><em>Complete instructions for musical transcription and analysis in IDTAP</em></p>
      <hr>

      <h2>Table of Contents</h2>
      <ol>
        <li>
          <a href="#getting-started">Getting Started</a>
          <ol type="a">
            <li><a href="#editor-overview">Editor Overview</a></li>
            <li><a href="#basic-navigation">Basic Navigation</a></li>
          </ol>
        </li>
        <li>
          <a href="#interface-elements">Interface Elements</a>
          <ol type="a">
            <li><a href="#editor-modes">Editor Modes</a></li>
            <li><a href="#instrument-tracks">Instrument Tracks</a></li>
            <li><a href="#polyphonic-instruments">Polyphonic Instruments (Sitar & Sarangi)</a></li>
            <li><a href="#editor-graph">Editor Graph</a></li>
            <li><a href="#editor-control-box">Editor Control Box (Upper Right Side)</a></li>
            <li><a href="#trajectory-editing-panel">Trajectory Editing Panel (Lower Right Side)</a></li>
          </ol>
        </li>
        <li>
          <a href="#control-panels">Control Panels</a>
          <ol type="a">
            <li><a href="#control-panels-overview">Control Panels Overview</a></li>
            <li><a href="#transcription-graphic-controls">Transcription and Graphic Controls</a></li>
            <li><a href="#assemblage-controls">Assemblage Controls</a></li>
            <li><a href="#label-editor">Label Editor</a></li>
            <li><a href="#meter-controls">Meter Controls</a></li>
            <li><a href="#download-data">Download Data</a></li>
            <li><a href="#share-transcription">Share Transcription</a></li>
            <li><a href="#tuning-controls">Tuning Controls</a></li>
            <li><a href="#synthesis-controls">Synthesis Controls</a></li>
          </ol>
        </li>
        <li>
          <a href="#working-with-trajectories">Working with Trajectories</a>
          <ol type="a">
            <li><a href="#understanding-trajectories">Understanding Trajectories</a></li>
            <li><a href="#trajectory-types">Trajectory Types</a></li>
            <li><a href="#creating-trajectories">Creating Trajectories</a></li>
            <li><a href="#selecting-and-editing">Selecting and Editing Trajectories</a></li>
            <li><a href="#advanced-trajectory-editing">Advanced Trajectory Editing</a></li>
          </ol>
        </li>
        <li>
          <a href="#structural-elements">Structural Elements</a>
          <ol type="a">
            <li><a href="#phrase-divisions">Phrase and Section Divisions</a></li>
            <li><a href="#chikari-strokes">Chikari Strokes (Sitar)</a></li>
            <li><a href="#region-selection">Region Selection</a></li>
          </ol>
        </li>
        <li><a href="#keyboard-shortcuts">Complete Keyboard Shortcuts Reference</a></li>
        <li><a href="#support">Support and Feedback</a></li>
      </ol>

      <hr>

      <h2 id="getting-started">1. Getting Started</h2>

      <h3 id="editor-overview">1.1 Editor Overview</h3>
      <p>
        The IDTAP Editor is a sophisticated tool for creating detailed musical transcriptions of Indian classical music.
        The interface consists of several key areas:
      </p>
      <ul>
        <li><strong>Top Row</strong>: Editor modes, instrument track selectors, and string selectors (for Sitar and Sarangi instruments)</li>
        <li><strong>Main Graph</strong>: Visual representation of pitch over time</li>
        <li><strong>Right Panel</strong>: Trajectory selection and transformation options, articulation editing, interface settings, and save functionality</li>
        <li><strong>Control Panels Area</strong>: Swappable control panels accessible via bottom row icons</li>
        <li><strong>Bottom Row</strong>: Playback controls and icons for opening different control panels</li>
      </ul>
      <p>
        <strong>Control Panels</strong> (accessed via bottom row icons):
      </p>
      <ul>
        <li><strong>Transcription and Graphic Controls</strong>: Visual display settings and spectrogram options</li>
        <li><strong>Assemblage Controls</strong>: Advanced phrase organization tools</li>
        <li><strong>Label Editor</strong>: Section and phrase categorization tools</li>
        <li><strong>Meter Controls</strong>: Rhythmic structure and tempo settings</li>
        <li><strong>Download Data</strong>: Export options for transcription data</li>
        <li><strong>Share Transcription</strong>: Collaboration and sharing features</li>
        <li><strong>Tuning Controls</strong>: Pitch system customization</li>
        <li><strong>Synthesis Controls</strong>: Audio mixer and synthesis parameters</li>
      </ul>
      <p>
        <strong>Key Concept</strong>: Melodic contour is represented as a stream of <em>trajectories</em> - continuous lines showing
        pitch changes over time. These trajectories can represent various musical ornaments, slides, and techniques
        specific to Indian classical music.
      </p>

      <h3 id="basic-navigation">1.2 Basic Navigation</h3>
      <p><strong>Essential Navigation Controls:</strong></p>
      <ul>
        <li><strong>Horizontal Movement</strong>:
          <ul>
            <li><strong>Arrow Keys</strong>: Left/Right arrows for precise movement</li>
            <li><strong>Jump Navigation</strong>: <kbd>[</kbd> and <kbd>]</kbd> to jump left/right by half screen</li>
            <li><strong>Phrase Navigation</strong>: <kbd>Tab</kbd> (next phrase) / <kbd>Shift+Tab</kbd> (previous phrase)</li>
            <li><strong>Mouse Wheel</strong>: Scroll horizontally through time</li>
          </ul>
        </li>
        <li><strong>Vertical Movement</strong>:
          <ul>
            <li><strong>Up/Down Arrows</strong>: Navigate pitch range</li>
            <li><strong>Mouse Wheel</strong>: Scroll vertically</li>
          </ul>
        </li>
        <li><strong>Zoom Controls</strong>:
          <ul>
            <li><strong>Horizontal Zoom</strong>: "+" and "-" buttons (bottom-left)</li>
            <li><strong>Vertical Zoom</strong>: "+" and "-" buttons (top-right)</li>
          </ul>
        </li>
        <li><strong>Playhead Control</strong>:
          <ul>
            <li><strong>Double-click</strong>: Move playhead to clicked position</li>
            <li><strong>Spacebar</strong>: Play/pause audio</li>
          </ul>
        </li>
      </ul>

      <hr>

      <h2 id="interface-elements">2. Interface Elements</h2>

      <h3 id="editor-modes">2.1 Editor Modes</h3>
      <p>
        Editor modes determine what type of editing operation you can perform. Mode selector squares appear
        at the top-left of the screen, each marked with a letter:
      </p>
      <ul>
        <li><strong>T - Trajectory Mode</strong>: Create individual musical trajectories</li>
        <li><strong>S - Series Mode</strong>: Create sequences of connected fixed trajectories efficiently</li>
        <li><strong>P - Phrase Division Mode</strong>: Add phrase and section boundaries</li>
        <li><strong>M - Meter Mode</strong>: Create and edit rhythmic meter structures</li>
        <li><strong>C - Chikari Mode</strong>: Add rhythmic drone string strokes (Sitar only)</li>
        <li><strong>R - Region Selection Mode</strong>: Select time regions for looping and focus</li>
      </ul>

      <p><strong>Mode Selection:</strong></p>
      <ul>
        <li><strong>Click</strong>: Click on any mode square to activate it</li>
        <li><strong>Keyboard</strong>: Press the corresponding letter key (<kbd>T</kbd>, <kbd>S</kbd>, <kbd>P</kbd>, <kbd>M</kbd>, <kbd>C</kbd>, <kbd>R</kbd>)</li>
        <li><strong>Tooltips</strong>: Hover over mode squares for detailed descriptions</li>
        <li><strong>Exit Mode</strong>: Press <kbd>Escape</kbd> to exit current mode</li>
      </ul>

      <p><strong>Important</strong>: The active mode affects how mouse clicks and keyboard inputs are interpreted.
      Always check which mode is selected before beginning an editing operation.</p>

      <h3 id="instrument-tracks">2.2 Instrument Tracks</h3>
      <p>
        Instrument track selectors appear as numbered green boxes next to the editor modes.
        Each transcription can contain multiple instrument tracks for ensemble recordings.
      </p>

      <p><strong>Track Management:</strong></p>
      <ul>
        <li><strong>Select Track</strong>: Click on a numbered box to switch to that instrument track</li>
        <li><strong>Track Information</strong>: Hover over a track box to see "Track X: Instrument Name"</li>
        <li><strong>Edit Instrumentation</strong>: Right-click on any track box → "Edit Instrumentation" to modify instruments</li>
        <li><strong>Multiple Tracks</strong>: Use different tracks for different performers or instruments</li>
      </ul>

      <p><strong>Available Instruments:</strong></p>
      <ul>
        <li><strong>Sitar</strong>: Polyphonic plucked string instrument with dual-string support</li>
        <li><strong>Sarangi</strong>: Polyphonic bowed string instrument with dual-string support</li>
        <li><strong>Vocal (M)</strong>: Male vocal with phoneme support</li>
        <li><strong>Vocal (F)</strong>: Female vocal with phoneme support</li>
      </ul>

      <p><strong>Note</strong>: Sitar and Sarangi instruments support polyphonic transcription.
      When these instruments are selected, additional string selection controls become available.</p>

      <h3 id="polyphonic-instruments">2.3 Polyphonic Instruments (Sitar & Sarangi)</h3>
      <p>
        Sitar and Sarangi instruments support <strong>polyphonic transcription</strong> with two independent strings.
        This allows you to transcribe a melodic line and a secondary simultaneous fixed-pitch line within a single instrument track.
      </p>

      <p><strong>String System:</strong></p>
      <ul>
        <li><strong>String 1 (Main String)</strong>: Primary melodic line, supports all trajectory types</li>
        <li><strong>String 2 (Secondary String)</strong>: Secondary melodic line, limited to fixed pitch trajectories</li>
      </ul>

      <p><strong>String Selection:</strong></p>
      <ul>
        <li><strong>String Selector</strong>: When editing Sitar or Sarangi, a "String" selector appears showing "1" or "2"</li>
        <li><strong>Switch Strings</strong>: Click the string selector to toggle between strings</li>
        <li><strong>Visual Indication</strong>: The currently active string is highlighted in the interface</li>
      </ul>

      <p><strong>String-Specific Editing:</strong></p>
      <ul>
        <li><strong>Independent Trajectories</strong>: Each string maintains its own set of trajectories</li>
        <li><strong>String 1</strong>: Supports all trajectory types (fixed, bends, ornaments, etc.)</li>
        <li><strong>String 2</strong>: Limited to fixed pitch trajectories only</li>
      </ul>

      <p><strong>Important</strong>: When working with polyphonic instruments, always check which string is
      currently selected before creating or editing trajectories. The string selector shows which string
      will be affected by your edits.</p>

      <h3 id="editor-graph">2.4 Editor Graph</h3>
      <p>
        The main visualization area displays musical content as a graph with time and pitch axes:
      </p>
      <ul>
        <li><strong>X-Axis (Time)</strong>: Horizontal axis showing time in seconds</li>
        <li><strong>Y-Axis (Pitch)</strong>: Vertical axis using logarithmic scale with sargam notation</li>
        <li><strong>Trajectories</strong>: Continuous lines representing musical phrases and ornaments</li>
        <li><strong>Spectrogram</strong>: Background visualization showing frequency spectrum over time with color-coded intensity (optional)</li>
        <li><strong>Melograph</strong>: Automated pitch trace overlay (optional)</li>
      </ul>

      <p><strong>Sargam Pitch System:</strong></p>
      <ul>
        <li><strong>Natural Pitches</strong>: Sa, Re, Ga, Ma, Pa, Dha, Ni (S, R, G, M, P, D, N)</li>
        <li><strong>Altered Pitches</strong>: Lowercase for lowered, uppercase for raised</li>
        <li><strong>Octaves</strong>: Dots above/below letters indicate higher/lower octaves (center octave has no dots)</li>
      </ul>

      <h3 id="editor-control-box">2.5 Editor Control Box (Upper Right Side)</h3>
      <p>
        The control box in the upper right contains editing modes and playback options:
      </p>
      <ul>
        <li><strong>Loop</strong>: Enable region looping during playback</li>
        <li><strong>Playhead Return</strong>: Return playhead to start when stopping</li>
        <li><strong>Meter Magnet</strong>: Snap trajectory points to meter grid</li>
        <li><strong>Sargam Magnet</strong>: Snap trajectory points to sargam pitches</li>
        <li><strong>Save Button</strong>: Save transcription progress</li>
        <li><strong>Phoneme Script</strong>: Choose text script for vocal tracks (Devanagari/IPA/Latin)</li>
        <li><strong>Reset Audio</strong>: Reset audio synthesis engine</li>
      </ul>

      <h3 id="trajectory-editing-panel">2.6 Trajectory Editing Panel (Lower Right Side)</h3>
      <p>
        The lower right panel contains trajectory editing controls and parameter adjustments.
        <strong>Note</strong>: Many controls only appear when relevant trajectories are selected.
      </p>
      <ul>
        <li><strong>Octave Shift</strong>: Up/down arrows to transpose selected trajectories</li>
        <li><strong>Trajectory Type Icons</strong>: Visual thumbnails for selecting trajectory types</li>
        <li><strong>Instrument-Specific Controls</strong>:
          <ul>
            <li><strong>Sitar</strong>: Pluck and Dampen checkboxes (appear when sitar trajectories selected)</li>
            <li><strong>Vocal</strong>: Start consonant, Vowel, End consonant selectors (appear when vocal trajectories selected)</li>
          </ul>
        </li>
        <li><strong>Trajectory Parameters</strong> (appear based on trajectory type):
          <ul>
            <li><strong>Slope</strong>: Controls for bend trajectories</li>
            <li><strong>Vibrato Settings</strong>: Periods, extent, offset, phase (appear for vibrato trajectories)</li>
          </ul>
        </li>
        <li><strong>Grouped Trajectory Toggle</strong>: Controls for grouped trajectory editing (when multiple trajectories selected)</li>
      </ul>


      <hr>

      <h2 id="control-panels">3. Control Panels</h2>

      <h3 id="control-panels-overview">3.1 Control Panels Overview</h3>
      <p>
        The bottom row of the editor contains icons that open specialized control panels.
        These panels provide advanced functionality for different aspects of transcription and analysis:
      </p>
      <ul>
        <li><strong>Transcription and Graphic Controls</strong>: Visual display settings and spectrogram options</li>
        <li><strong>Assemblage Controls</strong>: Advanced phrase organization tools</li>
        <li><strong>Label Editor</strong>: Section and phrase categorization tools</li>
        <li><strong>Meter Controls</strong>: Rhythmic structure and tempo settings</li>
        <li><strong>Download Data</strong>: Export options for transcription data</li>
        <li><strong>Share Transcription</strong>: Collaboration and sharing features</li>
        <li><strong>Tuning Controls</strong>: Pitch system customization</li>
        <li><strong>Synthesis Controls</strong>: Audio mixer and synthesis parameters</li>
      </ul>

      <h3 id="transcription-graphic-controls">3.2 Transcription and Graphic Controls</h3>
      <p>
        Access via the spectrogram icon. This comprehensive panel controls visual display and analysis settings:
      </p>

      <p><strong>Spectrogram Settings:</strong></p>
      <ul>
        <li><strong>Colormap Selection</strong>: Choose from 50+ scientific colormaps</li>
        <li><strong>Intensity Power</strong>: Adjust contrast (1-5 range)</li>
        <li><strong>Update Buttons</strong>: Apply colormap and intensity changes</li>
      </ul>

      <p><strong>Sa Frequency Control:</strong></p>
      <ul>
        <li><strong>Frequency Input</strong>: Set tonic pitch (100-400 Hz)</li>
        <li><strong>Fine Adjustment</strong>: Logarithmic slider for precise tuning</li>
        <li><strong>Audition</strong>: Gain slider to hear the Sa reference tone</li>
      </ul>

      <p><strong>Display Customization:</strong></p>
      <ul>
        <li><strong>Pitch Range</strong>: Set maximum and minimum visible pitches</li>
        <li><strong>Color Scheme</strong>: Customize colors for background, axes, melograph, sargam lines, meter, and playhead</li>
        <li><strong>Track Colors</strong>: Individual trajectory colors per instrument track</li>
        <li><strong>Animation Style</strong>: Choose playhead animation (Animated, Block, DottedLine, None)</li>
      </ul>

      <p><strong>Display Presets:</strong></p>
      <ul>
        <li>Save custom display configurations</li>
        <li>Load saved presets</li>
        <li>Set default settings</li>
      </ul>

      <h3 id="assemblage-controls">3.3 Assemblage Controls</h3>
      <p>
        Access via the assemblage icon. Organize phrases into thematic groups.
        This assemblage system is linked to a panel in the analysis suite for advanced research workflows.
      </p>

      <p><strong>Assemblage Management:</strong></p>
      <ul>
        <li><strong>Create Assemblages</strong>: Name and organize phrase collections</li>
        <li><strong>Select Existing</strong>: Choose from dropdown list</li>
        <li><strong>Delete Assemblages</strong>: Remove unwanted collections</li>
      </ul>

      <p><strong>Strand Organization:</strong></p>
      <ul>
        <li><strong>Create Strands</strong>: Named sub-groups within assemblages</li>
        <li><strong>Edit Names</strong>: Click to rename strands</li>
        <li><strong>Move Phrases</strong>: Drag phrases between strands</li>
        <li><strong>Loose Phrases</strong>: Unorganized phrase storage</li>
      </ul>

      <p><strong>Interactive Features:</strong></p>
      <ul>
        <li><strong>Visual Selection</strong>: Highlighting for active phrases</li>
        <li><strong>Keyboard Shortcuts</strong>: Escape to deselect, Delete to remove</li>
        <li><strong>Phrase Picking Mode</strong>: Integration with assemblage editor functionality</li>
      </ul>

      <h3 id="label-editor">3.4 Label Editor</h3>
      <p>
        Access via the tags icon. Organize and categorize musical sections and phrases:
      </p>

      <p><strong>Hierarchy Selection:</strong></p>
      <ul>
        <li><strong>Section Mode</strong>: Edit labels for major structural divisions</li>
        <li><strong>Phrase Mode</strong>: Edit labels for individual phrases</li>
        <li><strong>Track Indicator</strong>: Shows which instrument track is being labeled</li>
      </ul>

      <p><strong>Navigation:</strong></p>
      <ul>
        <li><strong>Horizontal Scrolling</strong>: Navigate through sections/phrases</li>
        <li><strong>Double-Click</strong>: Jump directly to a section or phrase in the editor</li>
      </ul>

      <p><strong>Labeling Options:</strong></p>
      <ul>
        <li><strong>Structured Labels</strong>: Use predefined categories</li>
        <li><strong>Ad-hoc Labels</strong>: Create custom labels</li>
      </ul>

      <h3 id="meter-controls">3.5 Meter Controls</h3>
      <p>
        Access via the meter icon. Create and edit hierarchical rhythmic structures:
      </p>

      <p><strong>Pulse Selection and Editing (NEW):</strong></p>
      <ul>
        <li><strong>Click on pulse</strong>: Select pulse for editing (shows purple highlight)</li>
        <li><strong>Drag selected pulse</strong>: Move pulse position (must select first to prevent accidental moves)</li>
        <li><strong>Shift + Left/Right</strong>: Navigate between pulses in selected meter</li>
        <li><strong>Left/Right arrows</strong>: Nudge selected pulse position by small increments</li>
        <li><strong>Escape</strong>: Deselect current pulse</li>
        <li><strong>Visual feedback</strong>: Pointer cursor for selection, resize cursor when ready to drag</li>
      </ul>

      <p><strong>Hierarchy Configuration:</strong></p>
      <ul>
        <li><strong>Depth Selector</strong>: Choose 1-4 hierarchical layers</li>
        <li><strong>Layer Controls</strong>: Configure subdivisions for each layer</li>
        <li><strong>Compound Patterns</strong>: Create complex rhythmic cycles</li>
      </ul>

      <p><strong>Tempo and Timing:</strong></p>
      <ul>
        <li><strong>Tempo Control</strong>: Set BPM (20-300)</li>
        <li><strong>Cycles</strong>: Number of pattern repetitions</li>
        <li><strong>Duration Display</strong>: Shows calculated meter duration</li>
      </ul>

      <p><strong>Insert Pulse Mode:</strong></p>
      <p>
        When in Meter Mode (M), users can place pulses by clicking on the transcription canvas.
        These pulses serve as timing references for creating or extending meters:
      </p>
      <ul>
        <li><strong>Pulse Placement</strong>: Click to place timing pulses (minimum 2 required for meter creation)</li>
        <li><strong>Layer Selection</strong>: Choose Layer 0 (primary beats) or Layer 1 (subdivisions) via radio buttons</li>
        <li><strong>Insert Meter from Pulses</strong>: Create new meter using placed pulse timing (available when 2+ pulses placed)</li>
        <li><strong>Attach to Previous Meter</strong>: Extend existing meter by adding pulse points to specified layer (checkbox appears when previous meter detected)</li>
        <li><strong>Validation</strong>: System prevents overlapping meters and guides valid pulse placement areas</li>
      </ul>

      <p><strong>Workflow Options:</strong></p>
      <ul>
        <li><strong>New Meter Creation</strong>: Place pulses → select layer → click "Insert Meter from Pulses"</li>
        <li><strong>Meter Extension</strong>: Place pulses after existing meter → check "Attach to Prev Meter" → add time points</li>
        <li><strong>Manual Insertion</strong>: Position playhead → configure parameters → click "Insert Meter at Playhead"</li>
      </ul>

      <h3 id="download-data">3.6 Download Data</h3>
      <p>
        Access via the download icon. Export transcription data in various formats:
      </p>
      <ul>
        <li><strong>JSON Export</strong>: Complete transcription data in IDTAP format</li>
        <li><strong>Excel Export</strong>: Structured spreadsheet with trajectory data</li>
        <li><strong>Staff Tuning Export</strong>: Tuning information for notation software</li>
      </ul>

      <h3 id="share-transcription">3.7 Share Transcription</h3>
      <p>
        Access via the share icon. Generate shareable links:
      </p>
      <ul>
        <li><strong>Link Generation</strong>: Create URL for current transcription</li>
        <li><strong>Time Option</strong>: "Start at current time" checkbox</li>
        <li><strong>Copy Function</strong>: One-click copy to clipboard</li>
      </ul>

      <h3 id="tuning-controls">3.8 Tuning Controls</h3>
      <p>
        Access via the tuning fork icon. Customize the tuning system for accurate transcription.
        This system is designed to be used while audio is playing to enable aural tuning alignment.
      </p>

      <p><strong>Individual Pitch Tuning:</strong></p>
      <ul>
        <li><strong>Per-Sargam Adjustment</strong>: ±50 cents tuning slider for each note in the transcription's raga</li>
        <li><strong>Visual Feedback</strong>: Sargam lines on the main graph update in real-time as you adjust tuning</li>
        <li><strong>Aural Reference</strong>: Individual gain sliders for each pitch generate reference tones</li>
        <li><strong>Cent Display</strong>: See exact deviation from equal temperament (+50¢, 0¢, -50¢ labels)</li>
        <li><strong>Reset Function</strong>: Return all pitches to standard equal temperament tuning</li>
      </ul>

      <p><strong>Tuning Workflow:</strong></p>
      <ul>
        <li><strong>Play Audio</strong>: Start recording playback for aural reference</li>
        <li><strong>Adjust Tuning</strong>: Move pitch sliders while observing visual changes to sargam lines</li>
        <li><strong>Aural Verification</strong>: Turn up gain sliders to hear reference tones and compare with recording</li>
        <li><strong>Fine-tune</strong>: Make precise adjustments until visual and aural alignment is achieved</li>
        <li><strong>Apply</strong>: Tuning changes affect both display and transcription pitch synthesis</li>
      </ul>

      <h3 id="synthesis-controls">3.9 Synthesis Controls</h3>
      <p>
        Access via the diagonal ruler icon. Control real-time audio synthesis using sophisticated AudioWorklet engines.
        IDTAP generates audio that matches your transcribed musical content using physical modeling synthesis.
      </p>

      <p><strong>Instrument-Specific Controls:</strong></p>
      <ul>
        <li><strong>Sonify Toggle</strong>: Enable/disable synthesis per instrument (checkbox in upper-right of each instrument panel)</li>
        <li><strong>Sitar (Polyphonic)</strong>:
          <ul>
            <li><strong>Volume</strong>: Overall instrument output level</li>
            <li><strong>String</strong>: Combined level for main sitar string + jor string (polyphonic mode)</li>
            <li><strong>Chikari</strong>: Rhythmic drone strings volume (strummed for rhythmic accompaniment)</li>
            <li><strong>Dampen</strong>: Synthesis algorithm damping parameter</li>
          </ul>
        </li>
        <li><strong>Sarangi (Polyphonic)</strong>:
          <ul>
            <li><strong>Volume</strong>: Combined level for main string + second string (polyphonic mode)</li>
          </ul>
        </li>
        <li><strong>Vocal</strong>:
          <ul>
            <li><strong>Volume</strong>: Klatt synthesizer output level with phoneme synthesis</li>
          </ul>
        </li>
      </ul>

      <p><strong>Global Controls:</strong></p>
      <ul>
        <li><strong>Mixed Synth Gain</strong>: Overall synthesis volume balance (appears when multiple instrument tracks present)</li>
        <li><strong>Recording Gain</strong>: Original audio recording playback level (appears when audio recording present)</li>
        <li><strong>Pitch Shift</strong>: ±200 cents transposition using RubberBand processing
          <ul>
            <li><strong>Prerequisites</strong>: Must enable checkbox first, disabled during playback</li>
            <li><strong>Range</strong>: -200¢ to +200¢ in real-time</li>
          </ul>
        </li>
        <li><strong>Region Speed</strong>: 0.5x to 2.0x time-stretching of selected regions
          <ul>
            <li><strong>Prerequisites</strong>: Must select a time region first (Region Mode R then click on a phrase to add a region; otherwise add a region by clicking and dragging on the graph with alt/option held down, or clicking and dragging on the x axis), must enable checkbox</li>
            <li><strong>Behavior</strong>: Only affects selected region, loops within region if Loop enabled</li>
            <li><strong>Escape</strong>: Press <kbd>Escape</kbd> key to return to normal playback speed</li>
            <li><strong>Range</strong>: Logarithmic scale from 0.5x (slower) to 2.0x (faster)</li>
          </ul>
        </li>
      </ul>




      <hr>

      <h2 id="working-with-trajectories">4. Working with Trajectories</h2>

      <h3 id="understanding-trajectories">4.1 Understanding Trajectories</h3>
      <p>
        Trajectories are the fundamental elements of musical transcription in IDTAP. They represent
        continuous musical phrases, ornaments, and melodic movements over time.
      </p>


      <h3 id="trajectory-types">4.2 Trajectory Types</h3>
      <p>
        IDTAP supports multiple trajectory types representing different musical techniques.
        Each type has specific characteristics and control points:
      </p>

      <p><strong>Basic Trajectory Types:</strong></p>
      <ul>
        <li><strong>Fixed <kbd>0</kbd></strong>: Constant pitch throughout duration (2 points)</li>
        <li><strong>Bend: Simple <kbd>1</kbd></strong>: Smooth transition between two pitches (2 points)</li>
        <li><strong>Bend: Sloped Start <kbd>2</kbd></strong>: Quick start, smooth approach to end (3 points)</li>
        <li><strong>Bend: Sloped End <kbd>3</kbd></strong>: Smooth start, quick approach to end (3 points)</li>
        <li><strong>Bend: Ladle <kbd>4</kbd></strong>: Combination of sloped start and simple bend (4 points)</li>
        <li><strong>Bend: Reverse Ladle <kbd>5</kbd></strong>: Combination of simple and sloped end (4 points)</li>
        <li><strong>Bend: Simple Multiple <kbd>6</kbd></strong>: Series of connected simple bends (unlimited points)</li>
        <li><strong>Vibrato <kbd>E</kbd></strong>: Oscillating pitch with adjustable parameters (2 points)</li>
      </ul>

      <p><strong>Sitar-Specific Trajectory Types:</strong></p>
      <ul>
        <li><strong>Krintin <kbd>7</kbd></strong>: "Hammer-off" technique to lower pitch (3 points)</li>
        <li><strong>Krintin Slide <kbd>8</kbd></strong>: Hammer-off followed by downward slide (4 points)</li>
        <li><strong>Krintin Slide Hammer <kbd>9</kbd></strong>: Extended sequence with multiple techniques (5 points)</li>
        <li><strong>Dense Krintin Slide Hammer <kbd>A</kbd></strong>: Complex multi-pitch sequence (7 points)</li>
        <li><strong>Slide <kbd>B</kbd></strong>: Continuous slide between pitches (2 points)</li>
      </ul>

      <p><strong>Polyphonic Instrument Restrictions:</strong></p>
      <ul>
        <li><strong>String 1 (Main)</strong>: Supports all trajectory types listed above</li>
        <li><strong>String 2 (Secondary)</strong>: Limited to Fixed (0) trajectories only</li>
        <li><strong>Automatic Validation</strong>: System prevents invalid trajectory types on string 2</li>
      </ul>

      <h3 id="creating-trajectories">4.3 Creating Trajectories</h3>

      <h4>Trajectory Mode (T)</h4>
      <p><strong>Creating Individual Trajectories:</strong></p>
      <ol>
        <li><strong>Activate Trajectory Mode</strong>: Press <kbd>T</kbd> or click the T mode square</li>
        <li><strong>Place Start Point</strong>: Click in a silent area (no existing trajectories)</li>
        <li><strong>Place Control Points</strong>: Click to add required control dots for your trajectory type</li>
        <li><strong>Select Trajectory Type</strong>: Press number/letter key (<kbd>0</kbd>-<kbd>9</kbd>, <kbd>A</kbd>, <kbd>B</kbd>, <kbd>E</kbd>) or click trajectory icon</li>
        <li><strong>Adjust Parameters</strong>: Use sliders for trajectory-specific parameters (if available)</li>
      </ol>

      <h4>Series Mode (S)</h4>
      <p><strong>Creating Connected Trajectory Sequences:</strong></p>
      <ol>
        <li><strong>Activate Series Mode</strong>: Press <kbd>S</kbd> or click the S mode square</li>
        <li><strong>Place First Point</strong>: Click to start the series</li>
        <li><strong>Add Sequential Points</strong>: Each subsequent click creates a new connected trajectory</li>
        <li><strong>Change Trajectory Types</strong>: Select different types for each trajectory as needed</li>
        <li><strong>Exit Series Mode</strong>: Press <kbd>Escape</kbd> or select different mode</li>
      </ol>

      <p><strong>Series Mode Benefits:</strong></p>
      <ul>
        <li><strong>Efficiency</strong>: Quickly create multiple connected trajectories</li>
        <li><strong>Automatic Connection</strong>: End of one trajectory becomes start of next</li>
      </ul>

      <h3 id="selecting-and-editing">4.4 Selecting and Editing Trajectories</h3>

      <p><strong>Selection Methods:</strong></p>
      <ul>
        <li><strong>Single Selection</strong>: Click on a trajectory to select it</li>
        <li><strong>Multiple Selection</strong>: <kbd>Shift + Click</kbd> to add trajectories to selection</li>
        <li><strong>Box Selection</strong>: <kbd>Shift + Drag</kbd> to draw selection rectangle</li>
        <li><strong>String-Aware Selection</strong>: On polyphonic instruments, selection respects active string</li>
        <li><strong>Deselect All</strong>: Press <kbd>Escape</kbd> or click in empty area</li>
      </ul>

      <p><strong>Editing Trajectory Shape:</strong></p>
      <ul>
        <li><strong>Drag Orientation Dots</strong>: Click and drag the orientation dots to adjust pitch and timing</li>
        <li><strong>Fine Adjustment</strong>: Click on a dot, then use arrow keys for precision adjustment</li>
        <li><strong>Parameter Sliders</strong>: Use right panel sliders for trajectory-specific parameters:
          <ul>
            <li><strong>Slope</strong>: For sloped trajectories (types 2, 3, 4, 5)</li>
            <li><strong>Vibrato</strong>: Periods, Extent, Offset, Phase (for vibrato trajectories)</li>
          </ul>
        </li>
      </ul>

      <p><strong>Trajectory Operations:</strong></p>
      <ul>
        <li><strong>Change Type</strong>: Select trajectory, then press type key or click type icon</li>
        <li><strong>Copy</strong>: <kbd>Cmd/Ctrl + C</kbd> to copy selected trajectories</li>
        <li><strong>Paste</strong>: <kbd>Cmd/Ctrl + V</kbd> to paste at current time position</li>
        <li><strong>Delete</strong>: <kbd>Delete</kbd> or <kbd>Backspace</kbd> to remove selected trajectories</li>
      </ul>

      <h3 id="advanced-trajectory-editing">4.5 Advanced Trajectory Editing</h3>

      <p><strong>Trajectory Navigation:</strong></p>
      <ul>
        <li><strong>Tab</strong>: Move to next trajectory when trajectory is selected</li>
        <li><strong>Shift + Tab</strong>: Move to previous trajectory when trajectory is selected</li>
      </ul>

      <p><strong>Context Menu Options:</strong></p>
      <ul>
        <li><strong>Right-Click on Trajectory</strong>: Access advanced editing options</li>
        <li><strong>Insert Silence Left/Right</strong>: Add silent trajectory before/after current trajectory</li>
        <li><strong>Insert Fixed Pitch Left/Right</strong>: Add fixed-pitch trajectory before/after current trajectory</li>
        <li><strong>Attach Trajectory Left/Right</strong>: Start creating new trajectory attached to current trajectory</li>
        <li><strong>Connect to next/last Traj</strong>: Connect current trajectory to adjacent trajectory</li>
        <li><strong>Add to Selected Group</strong>: Add trajectory to existing selected group (when available)</li>
        <li><strong>Adjust Volume</strong>: Open volume adjustment (Sarangi and Vocal only)</li>
        <li><strong>Stroke Options</strong>: Set stroke annotations (da, di, d, ra, ri, r) for pluck articulations</li>
        <li><strong>Annotate Trajectory</strong>: Open trajectory annotation window</li>
        <li><strong>Adjust Orientation Dots</strong>: Switch to trajectory mode for editing control points</li>
      </ul>

      <p><strong>Orientation Dot Navigation (when trajectory is selected):</strong></p>
      <ul>
        <li><strong>Click on Dot</strong>: Select an orientation dot directly</li>
        <li><strong>Shift + Left</strong>: Select different orientation dot (leftmost if none selected, or move to previous dot)</li>
        <li><strong>Shift + Right</strong>: Select different orientation dot (rightmost if none selected, or move to next dot)</li>
        <li><strong>Arrow Keys</strong>: Move selected orientation dot in small increments</li>
        <li><strong>Option/Alt + Arrow Keys (NEW)</strong>: Move selected orientation dot 5x faster for rapid adjustments</li>
        <li><strong>Shift + Up/Down</strong>: Move selected orientation dot in larger increments</li>
      </ul>

      <p><strong>Articulation Editing (when trajectory is selected):</strong></p>
      <ul>
        <li><strong>Sitar Articulations</strong>:
          <ul>
            <li><strong>Pluck</strong>: Checkbox in right panel or press <kbd>P</kbd> (appears at trajectory start)</li>
            <li><strong>Dampen</strong>: Checkbox in right panel or press <kbd>D</kbd> (appears at trajectory end)</li>
          </ul>
        </li>
        <li><strong>Vocal Articulations</strong>: Controlled via right panel when vocal trajectory selected
          <ul>
            <li><strong>Start Consonant</strong>: Consonant at beginning of trajectory</li>
            <li><strong>Vowel</strong>: Vowel sound during trajectory</li>
            <li><strong>End Consonant</strong>: Consonant at end of trajectory</li>
          </ul>
        </li>
      </ul>

      <hr>

      <h2 id="structural-elements">5. Structural Elements</h2>

      <h3 id="phrase-divisions">5.1 Phrase and Section Divisions</h3>
      <p>
        Phrase and section divisions help organize musical content into meaningful structural units.
        These divisions are essential for analysis and navigation.
      </p>

      <p><strong>Division Types:</strong></p>
      <ul>
        <li><strong>Phrase Divisions</strong>: Mark smaller musical units within sections (thin vertical lines)</li>
        <li><strong>Section Divisions</strong>: Mark major structural boundaries (thick vertical lines)</li>
      </ul>

      <p><strong>Creating Divisions (Phrase Division Mode - P):</strong></p>
      <ol>
        <li><strong>Activate Mode</strong>: Press <kbd>P</kbd> or click the P mode square</li>
        <li><strong>Place Division</strong>: Click at the desired time position on the graph. If clicking overlaps with a trajectory, the division will be placed at the nearest trajectory boundary to where you clicked (based on main string of currently selected instrument)</li>
        <li><strong>Set Division Type</strong>: With a division selected, use right panel to choose "Phrase" or "Section"</li>
        <li><strong>Adjust Position</strong>: Select division and use <kbd>Left/Right arrows</kbd> to nudge</li>
      </ol>

      <p><strong>Division Management:</strong></p>
      <ul>
        <li><strong>Select Division</strong>: Click on the vertical division line</li>
        <li><strong>Nudge Position</strong>: <kbd>Left/Right arrows</kbd> to move division to next trajectory boundary in the selected direction</li>
        <li><strong>Change Type</strong>: Use right panel radio button selection to switch between phrase/section</li>
        <li><strong>Delete Division</strong>: Select and press <kbd>Delete</kbd> or <kbd>Backspace</kbd></li>
      </ul>

      <h3 id="chikari-strokes">5.2 Chikari Strokes (Sitar)</h3>
      <p>
        Chikari strokes represent rhythmic drone string strums on the sitar, adding rhythmic
        and harmonic accompaniment to the main melodic line. Strokes are displayed as "X" symbols on the graph.
      </p>

      <p><strong>Creating Chikari Strokes (Chikari Mode - C):</strong></p>
      <ol>
        <li><strong>Activate Mode</strong>: Press <kbd>C</kbd> or click the C mode square (Sitar only)</li>
        <li><strong>Place Stroke</strong>: Click at desired time position</li>
        <li><strong>Pitch Alignment</strong>: Stroke aligns to trajectory pitch or tonic if in silence</li>
        <li><strong>Edit Stroke</strong>: Select and use arrow keys to adjust timing</li>
        <li><strong>Delete Stroke</strong>: Select chikari and press <kbd>Delete</kbd> or <kbd>Backspace</kbd></li>
      </ol>

      <h3 id="region-selection">5.3 Region Selection</h3>
      <p>
        Region selection allows you to focus on specific time ranges for detailed editing,
        analysis, or looped playback.
      </p>

      <p><strong>Creating Regions (Region Mode - R):</strong></p>
      <ul>
        <li><strong>Activate Mode</strong>: Press <kbd>R</kbd> or click the R mode square</li>
        <li><strong>Phrase-Based Selection</strong>: Click on phrase division to select entire phrase</li>
        <li><strong>Manual Selection</strong>: <kbd>Option + Drag</kbd> to draw custom region</li>
        <li><strong>Time Axis Selection</strong>: Click and drag along time axis for precise timing</li>
      </ul>

      <p><strong>Region Features:</strong></p>
      <ul>
        <li><strong>Loop Playback</strong>: Enable "Loop" in visibility controls for region looping</li>
      </ul>

      <hr>

      <h2 id="keyboard-shortcuts">6. Complete Keyboard Shortcuts Reference</h2>

      <h3>6.1 Mode Selection</h3>
      <ul>
        <li><kbd>T</kbd> - Trajectory Mode</li>
        <li><kbd>S</kbd> - Series Mode</li>
        <li><kbd>P</kbd> - Phrase Division Mode</li>
        <li><kbd>M</kbd> - Meter Mode</li>
        <li><kbd>C</kbd> - Chikari Mode (Sitar only)</li>
        <li><kbd>R</kbd> - Region Selection Mode</li>
        <li><kbd>Escape</kbd> - Exit current mode</li>
      </ul>

      <h3>6.2 Navigation</h3>
      <ul>
        <li><kbd>Left/Right Arrows</kbd> - Move horizontally (fine)</li>
        <li><kbd>Up/Down Arrows</kbd> - Move vertically (fine)</li>
        <li><kbd>[</kbd> - Jump left by half screen</li>
        <li><kbd>]</kbd> - Jump right by half screen</li>
        <li><kbd>Tab</kbd> - Next phrase division</li>
        <li><kbd>Shift + Tab</kbd> - Previous phrase division</li>
        <li><kbd>Double-click</kbd> - Move playhead to position</li>
      </ul>

      <h3>6.3 Playback</h3>
      <ul>
        <li><kbd>Spacebar</kbd> - Play/Pause audio</li>
        <li><kbd>Rewind button</kbd> - Jump back 15 seconds</li>
        <li><kbd>Fast Forward button</kbd> - Jump forward 15 seconds</li>
      </ul>

      <h3>6.4 Trajectory Types</h3>
      <ul>
        <li><kbd>0</kbd> - Fixed pitch trajectory</li>
        <li><kbd>1</kbd> - Bend: Simple</li>
        <li><kbd>2</kbd> - Bend: Sloped Start</li>
        <li><kbd>3</kbd> - Bend: Sloped End</li>
        <li><kbd>4</kbd> - Bend: Ladle</li>
        <li><kbd>5</kbd> - Bend: Reverse Ladle</li>
        <li><kbd>6</kbd> - Bend: Simple Multiple</li>
        <li><kbd>7</kbd> - Krintin (Sitar)</li>
        <li><kbd>8</kbd> - Krintin Slide (Sitar)</li>
        <li><kbd>9</kbd> - Krintin Slide Hammer (Sitar)</li>
        <li><kbd>A</kbd> - Dense Krintin Slide Hammer (Sitar)</li>
        <li><kbd>B</kbd> - Slide (Sitar)</li>
        <li><kbd>E</kbd> - Vibrato</li>
      </ul>

      <h3>6.5 Selection and Editing</h3>
      <ul>
        <li><kbd>Click</kbd> - Select single trajectory</li>
        <li><kbd>Shift + Click</kbd> - Add to selection</li>
        <li><kbd>Shift + Drag</kbd> - Box selection</li>
        <li><kbd>Cmd/Ctrl + C</kbd> - Copy selected trajectories</li>
        <li><kbd>Cmd/Ctrl + V</kbd> - Paste trajectories</li>
        <li><kbd>Delete/Backspace</kbd> - Delete selected elements</li>
      </ul>

      <h3>6.6 Polyphonic Instruments</h3>
      <ul>
        <li><kbd>Click string selector</kbd> - Switch strings</li>
        <li><kbd>Automatic string switching</kbd> - Click trajectory switches to its string</li>
      </ul>

      <h3>6.7 Advanced Editing (While Trajectory Selected)</h3>
      <ul>
        <li><kbd>Tab</kbd> - Navigate to next trajectory</li>
        <li><kbd>Shift + Tab</kbd> - Navigate to previous trajectory</li>
        <li><kbd>Shift + Left/Right</kbd> - Navigate between orientation dots within trajectory</li>
        <li><kbd>Arrow keys</kbd> - Adjust selected orientation dot position</li>
        <li><kbd>Option/Alt + Arrow keys</kbd> - Adjust orientation dot position 5x faster</li>
        <li><kbd>P</kbd> - Toggle pluck (Sitar only)</li>
        <li><kbd>D</kbd> - Toggle dampen (Sitar only)</li>
        <li><kbd>Right-click</kbd> - Context menu options</li>
      </ul>

      <h3>6.8 Meter Mode Controls</h3>
      <ul>
        <li><kbd>Click pulse</kbd> - Select pulse for editing</li>
        <li><kbd>Drag selected pulse</kbd> - Move pulse position (must select first)</li>
        <li><kbd>Shift + Left/Right</kbd> - Navigate between pulses</li>
        <li><kbd>Arrow keys</kbd> - Nudge selected pulse position</li>
        <li><kbd>Escape</kbd> - Deselect pulse</li>
      </ul>

      <hr>

      <h2 id="support">7. Support and Feedback</h2>
      <p>
        If you have questions, need assistance, or wish to provide feedback about the IDTAP:
      </p>
      <ul>
        <li><strong>Email</strong>: JBMYERS [at] UCSC [dot] EDU</li>
        <li><strong>GitHub Issues</strong>: <a href="https://github.com/UCSC-IDTAP/IDTAP/issues">Report bugs and feature requests</a></li>
        <li><strong>Documentation</strong>: <a href="https://github.com/UCSC-IDTAP/IDTAP">Visit the project repository</a> for additional resources</li>
        <li><strong>ISMIR Paper</strong>: <a href="/papers/ismir-paper.pdf" target="_blank">Read our research paper</a></li>
        <li><strong>NEH Whitepaper</strong>: <a href="/papers/neh-whitepaper.pdf" target="_blank">Read our NEH whitepaper</a></li>
      </ul>

      <p>
        <strong>When reporting issues, please include:</strong>
      </p>
      <ul>
        <li>Browser type and version</li>
        <li>Operating system</li>
        <li>Steps to reproduce the issue</li>
        <li>Instrument type and polyphonic mode (if applicable)</li>
        <li>Any error messages or unexpected behavior</li>
      </ul>

      <p><em>
        This user guide covers the complete IDTAP Editor functionality as of September 2025.
        The editor continues to evolve with new features for advanced musical transcription and analysis.
      </em></p>

    </div>
</template>
<script lang='ts'>
import { defineComponent, PropType, computed } from 'vue';
export default defineComponent({
  name: 'EditorInstructions',
  props: {
    navHeight: {
      type: Number as PropType<number>,
      required: true
    }
  },
  setup(props) {
    // pass navheight as cssvar so can be used in styles
    const mainStyle = computed(() => {
      return {
        '--nav-height': `${props.navHeight}px`
      }
    })
    return {
      mainStyle
    }
  }
})
</script>
<style>
#idtap-editor-instructions {
  background-color: #202621; /* Dark green background */
  color: #ffffff; /* White text */
  max-width: 800px;
  margin: 0 auto; /* Center the content horizontally */
  padding: 20px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
  line-height: 1.6;
  height: calc(100vh - var(--nav-height)); /* Set height to viewport height minus 40px */
  overflow-y: auto; /* Add vertical scroll if content exceeds the div height */
}

#idtap-editor-instructions h1,
#idtap-editor-instructions h2,
#idtap-editor-instructions h3,
#idtap-editor-instructions h4 {
  color: #ffebcd; /* Lighter color for headings */
  margin-top: 1.5em;
  text-align: left; /* Ensure headings are left-aligned */
}

#idtap-editor-instructions h1 {
  font-size: 2em;
}

#idtap-editor-instructions h2 {
  font-size: 1.75em;
}

#idtap-editor-instructions h3 {
  font-size: 1.5em;
}

#idtap-editor-instructions h4 {
  font-size: 1.25em;
}

#idtap-editor-instructions p {
  margin-bottom: 1em;
  text-align: left; /* Ensure paragraphs are left-aligned */
}

#idtap-editor-instructions ul,
#idtap-editor-instructions ol {
  margin-left: 1.5em;
  margin-bottom: 1em;
  text-align: left; /* Ensure lists are left-aligned */
}

#idtap-editor-instructions a {
  color: #add8e6; /* Light blue links */
  text-decoration: none;
}

#idtap-editor-instructions a:hover {
  text-decoration: underline;
}

#idtap-editor-instructions hr {
  border: none;
  height: 1px;
  background-color: #ccc;
  margin: 2em 0;
}

#idtap-editor-instructions strong {
  color: #ffebcd;
}

#idtap-editor-instructions em {
  font-style: italic;
}

#idtap-editor-instructions code {
  background-color: #37474f;
  padding: 2px 4px;
  border-radius: 4px;
  color: #e0e0e0;
  font-family: 'Courier New', monospace;
  text-align: left; /* Ensure code blocks are left-aligned */
}

#idtap-editor-instructions pre {
  background-color: #37474f;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  color: #e0e0e0;
  font-family: 'Courier New', monospace;
  text-align: left; /* Ensure preformatted text is left-aligned */
}

#idtap-editor-instructions blockquote {
  border-left: 4px solid #ffebcd;
  margin-left: 0;
  padding-left: 1em;
  color: #dcdcdc;
  text-align: left; /* Ensure blockquotes are left-aligned */
}

@media (max-width: 600px) {
  #idtap-editor-instructions {
    padding: 15px;
  }

  #idtap-editor-instructions h1 {
    font-size: 1.75em;
  }

  #idtap-editor-instructions h2 {
    font-size: 1.5em;
  }

  #idtap-editor-instructions h3 {
    font-size: 1.25em;
  }

  #idtap-editor-instructions h4 {
    font-size: 1.1em;
  }
}
</style>
