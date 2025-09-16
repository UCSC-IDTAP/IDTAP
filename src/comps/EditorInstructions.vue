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
            <li><a href="#visibility-controls">Visibility Controls</a></li>
            <li><a href="#playback-controls">Playback Controls</a></li>
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
            <li><a href="#meter-system">Meter System</a></li>
            <li><a href="#chikari-strokes">Chikari Strokes (Sitar)</a></li>
            <li><a href="#region-selection">Region Selection</a></li>
          </ol>
        </li>
        <li>
          <a href="#advanced-features">Advanced Features</a>
          <ol type="a">
            <li><a href="#synthesis-audio">Synthesis and Audio</a></li>
            <li><a href="#tuning-system">Tuning System</a></li>
            <li><a href="#labeling-categorization">Labeling and Categorization</a></li>
            <li><a href="#visual-customization">Visual Customization</a></li>
            <li><a href="#data-export">Data Export</a></li>
          </ol>
        </li>
        <li><a href="#keyboard-shortcuts">Complete Keyboard Shortcuts Reference</a></li>
        <li><a href="#workflows-examples">Common Workflows and Examples</a></li>
        <li><a href="#troubleshooting">Troubleshooting and Tips</a></li>
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
        <li><strong>Top Row</strong>: Editor modes and instrument track selectors</li>
        <li><strong>Main Graph</strong>: Visual representation of pitch over time</li>
        <li><strong>Right Panel</strong>: Visibility controls and editing options</li>
        <li><strong>Bottom Row</strong>: Playback controls and advanced features</li>
      </ul>
      <p>
        <strong>Key Concept</strong>: Musical phrases are represented as <em>trajectories</em> - continuous lines showing
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
            <li><strong>Shift + Mouse Wheel</strong>: Scroll vertically through pitch</li>
          </ul>
        </li>
        <li><strong>Zoom Controls</strong>:
          <ul>
            <li><strong>Time Zoom</strong>: "+" and "-" buttons (bottom-left)</li>
            <li><strong>Pitch Zoom</strong>: "+" and "-" buttons (top-right)</li>
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
        <li><strong>T - Trajectory Mode</strong>: Create and edit individual musical trajectories</li>
        <li><strong>S - Series Mode</strong>: Create sequences of connected trajectories efficiently</li>
        <li><strong>P - Phrase Division Mode</strong>: Add and edit phrase and section boundaries</li>
        <li><strong>M - Meter Mode</strong>: Create and edit rhythmic meter structures</li>
        <li><strong>C - Chikari Mode</strong>: Add sympathetic string strokes (Sitar only)</li>
        <li><strong>R - Region Selection Mode</strong>: Select time regions for looping and focus</li>
        <li><strong>A - Assemblage Phrase Pick Mode</strong>: Advanced phrase selection and organization</li>
      </ul>

      <p><strong>Mode Selection:</strong></p>
      <ul>
        <li><strong>Click</strong>: Click on any mode square to activate it</li>
        <li><strong>Keyboard</strong>: Press the corresponding letter key (<kbd>T</kbd>, <kbd>S</kbd>, <kbd>P</kbd>, <kbd>M</kbd>, <kbd>C</kbd>, <kbd>R</kbd>, <kbd>A</kbd>)</li>
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
        This allows you to transcribe multiple melodic lines simultaneously within a single instrument track.
      </p>

      <p><strong>String System:</strong></p>
      <ul>
        <li><strong>String 1 (Main String)</strong>: Primary melodic line, supports all trajectory types</li>
        <li><strong>String 2 (Secondary String)</strong>: Secondary melodic line, limited to fixed pitch trajectories</li>
      </ul>

      <p><strong>String Selection:</strong></p>
      <ul>
        <li><strong>String Selector</strong>: When editing Sitar or Sarangi, a "String" selector appears showing "1" or "2"</li>
        <li><strong>Switch Strings</strong>: Click the string selector or press <kbd>X</kbd> to toggle between strings</li>
        <li><strong>Visual Indication</strong>: The currently active string is highlighted in the interface</li>
      </ul>

      <p><strong>String-Specific Editing:</strong></p>
      <ul>
        <li><strong>Independent Trajectories</strong>: Each string maintains its own set of trajectories</li>
        <li><strong>String 1</strong>: Supports all trajectory types (fixed, bends, ornaments, etc.)</li>
        <li><strong>String 2</strong>: Limited to fixed pitch trajectories only</li>
        <li><strong>Synchronized Structure</strong>: Phrase divisions automatically affect both strings</li>
        <li><strong>String-Aware Selection</strong>: Selection operations respect string boundaries</li>
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
        <li><strong>Spectrogram</strong>: Background visualization showing frequency content (optional)</li>
        <li><strong>Melograph</strong>: Automatic pitch tracking overlay (optional)</li>
      </ul>

      <p><strong>Sargam Pitch System:</strong></p>
      <ul>
        <li><strong>Natural Pitches</strong>: Sa, Re, Ga, Ma, Pa, Dha, Ni (S, R, G, M, P, D, N)</li>
        <li><strong>Altered Pitches</strong>: Lowercase for komal (flat), uppercase for shuddha/tivra</li>
        <li><strong>Octaves</strong>: Dots above/below letters indicate higher/lower octaves</li>
        <li><strong>Reference</strong>: Sa (tonic) serves as the pitch reference point</li>
      </ul>

      <h3 id="visibility-controls">2.5 Visibility Controls</h3>
      <p>
        The right panel contains visibility toggles and editing options:
      </p>
      <ul>
        <li><strong>Spectrogram</strong>: Display frequency analysis background</li>
        <li><strong>Melograph</strong>: Show automatic pitch tracking</li>
        <li><strong>Sargam</strong>: Display pitch labels on trajectories</li>
        <li><strong>Sargam Lines</strong>: Show horizontal pitch reference lines</li>
        <li><strong>Bols</strong>: Show plucking stroke indicators (Sitar only)</li>
        <li><strong>Transcription</strong>: Display trajectory transcription</li>
        <li><strong>Meter</strong>: Show rhythmic meter grids</li>
        <li><strong>Phrase Divs</strong>: Display phrase and section boundaries</li>
      </ul>

      <p><strong>Additional Options:</strong></p>
      <ul>
        <li><strong>Loop</strong>: Enable region looping during playback</li>
        <li><strong>Playhead Return</strong>: Return playhead to start when stopping</li>
        <li><strong>Meter Magnet</strong>: Snap trajectory points to meter grid</li>
        <li><strong>Sargam Magnet</strong>: Snap trajectory points to sargam pitches</li>
        <li><strong>Save Button</strong>: Save transcription progress</li>
        <li><strong>Phoneme Script</strong>: Choose text script for vocal tracks (Latin/Devanagari/IPA)</li>
      </ul>

      <h3 id="playback-controls">2.6 Playback Controls</h3>
      <p>
        Playback controls are located in the bottom black row:
      </p>
      <ul>
        <li><strong>Rewind</strong>: Jump back 15 seconds</li>
        <li><strong>Play/Pause</strong>: Start or stop audio playback</li>
        <li><strong>Fast Forward</strong>: Jump forward 15 seconds</li>
        <li><strong>Spacebar Shortcut</strong>: Press <kbd>Spacebar</kbd> for play/pause</li>
      </ul>

      <hr>

      <h2 id="working-with-trajectories">3. Working with Trajectories</h2>

      <h3 id="understanding-trajectories">3.1 Understanding Trajectories</h3>
      <p>
        Trajectories are the fundamental elements of musical transcription in IDTAP. They represent
        continuous musical phrases, ornaments, and melodic movements over time.
      </p>

      <p><strong>Trajectory Characteristics:</strong></p>
      <ul>
        <li><strong>Pitch Contour</strong>: Represents how pitch changes over time</li>
        <li><strong>Duration</strong>: Each trajectory has a specific time duration</li>
        <li><strong>Type</strong>: Different trajectory types represent various musical techniques</li>
        <li><strong>Articulations</strong>: Specific techniques at trajectory boundaries (plucks, slides, etc.)</li>
        <li><strong>Control Points</strong>: Drag dots that define trajectory shape and timing</li>
      </ul>

      <p><strong>Visual Elements:</strong></p>
      <ul>
        <li><strong>Trajectory Line</strong>: Colored curve showing pitch over time</li>
        <li><strong>Drag Dots</strong>: Small circles at control points for editing</li>
        <li><strong>Start/End Points</strong>: Larger dots marking trajectory boundaries</li>
        <li><strong>Selection Highlight</strong>: Highlighted appearance when selected</li>
      </ul>

      <h3 id="trajectory-types">3.2 Trajectory Types</h3>
      <p>
        IDTAP supports multiple trajectory types representing different musical techniques.
        Each type has specific characteristics and control points:
      </p>

      <p><strong>Basic Trajectory Types:</strong></p>
      <ul>
        <li><strong>Fixed (0)</strong>: Constant pitch throughout duration - <kbd>0</kbd></li>
        <li><strong>Bend: Simple (1)</strong>: Smooth transition between two pitches - <kbd>1</kbd></li>
        <li><strong>Bend: Sloped Start (2)</strong>: Quick start, smooth approach to end - <kbd>2</kbd></li>
        <li><strong>Bend: Sloped End (3)</strong>: Smooth start, quick approach to end - <kbd>3</kbd></li>
        <li><strong>Bend: Ladle (4)</strong>: Combination of sloped start and simple bend - <kbd>4</kbd></li>
        <li><strong>Bend: Reverse Ladle (5)</strong>: Combination of simple and sloped end - <kbd>5</kbd></li>
        <li><strong>Bend: Simple Multiple (6)</strong>: Series of connected simple bends - <kbd>6</kbd></li>
        <li><strong>Vibrato (e)</strong>: Oscillating pitch with adjustable parameters - <kbd>E</kbd></li>
      </ul>

      <p><strong>Sitar-Specific Trajectory Types:</strong></p>
      <ul>
        <li><strong>Krintin (7)</strong>: "Hammer-off" technique to lower pitch - <kbd>7</kbd></li>
        <li><strong>Krintin Slide (8)</strong>: Hammer-off followed by downward slide - <kbd>8</kbd></li>
        <li><strong>Krintin Slide Hammer (9)</strong>: Extended sequence with multiple techniques - <kbd>9</kbd></li>
        <li><strong>Dense Krintin Slide Hammer (a)</strong>: Complex multi-pitch sequence - <kbd>A</kbd></li>
        <li><strong>Slide (b)</strong>: Continuous slide between pitches - <kbd>B</kbd></li>
      </ul>

      <p><strong>Polyphonic Instrument Restrictions:</strong></p>
      <ul>
        <li><strong>String 1 (Main)</strong>: Supports all trajectory types listed above</li>
        <li><strong>String 2 (Secondary)</strong>: Limited to Fixed (0) trajectories only</li>
        <li><strong>Automatic Validation</strong>: System prevents invalid trajectory types on string 2</li>
      </ul>

      <h3 id="creating-trajectories">3.3 Creating Trajectories</h3>

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
        <li><strong>Add Sequential Points</strong>: Each click creates a new connected trajectory</li>
        <li><strong>Change Trajectory Types</strong>: Select different types for each trajectory as needed</li>
        <li><strong>Exit Series Mode</strong>: Press <kbd>Escape</kbd> or select different mode</li>
      </ol>

      <p><strong>Series Mode Benefits:</strong></p>
      <ul>
        <li><strong>Efficiency</strong>: Quickly create multiple connected trajectories</li>
        <li><strong>Automatic Connection</strong>: End of one trajectory becomes start of next</li>
        <li><strong>Consistent Timing</strong>: Maintains proper temporal relationships</li>
      </ul>

      <h3 id="selecting-and-editing">3.4 Selecting and Editing Trajectories</h3>

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
        <li><strong>Drag Control Points</strong>: Click and drag the small dots to adjust pitch and timing</li>
        <li><strong>Fine Adjustment</strong>: <kbd>Option + Click</kbd> on a dot, then use arrow keys for precision</li>
        <li><strong>Boundary Points</strong>: Drag start/end points to adjust trajectory duration and pitch</li>
        <li><strong>Parameter Sliders</strong>: Use right panel sliders for trajectory-specific parameters</li>
      </ul>

      <p><strong>Trajectory Operations:</strong></p>
      <ul>
        <li><strong>Change Type</strong>: Select trajectory, then press type key or click type icon</li>
        <li><strong>Copy</strong>: <kbd>Cmd/Ctrl + C</kbd> to copy selected trajectories</li>
        <li><strong>Paste</strong>: <kbd>Cmd/Ctrl + V</kbd> to paste at current time position</li>
        <li><strong>Delete</strong>: <kbd>Delete</kbd> or <kbd>Backspace</kbd> to remove selected trajectories</li>
        <li><strong>Group/Ungroup</strong>: <kbd>G</kbd> to group adjacent trajectories for unified editing</li>
      </ul>

      <h3 id="advanced-trajectory-editing">3.5 Advanced Trajectory Editing</h3>

      <p><strong>Context Menu Options:</strong></p>
      <ul>
        <li><strong>Right-Click on Trajectory</strong>: Access advanced editing options</li>
        <li><strong>Insert Silence Left/Right</strong>: Add 0.1-second silence before/after trajectory</li>
        <li><strong>Insert Fixed Left/Right</strong>: Add short fixed trajectory before/after</li>
        <li><strong>Split Trajectory</strong>: Divide trajectory at specific time point</li>
        <li><strong>Merge Trajectories</strong>: Combine adjacent trajectories (when compatible)</li>
      </ul>

      <p><strong>Drag Dot Navigation:</strong></p>
      <ul>
        <li><strong>Tab Between Dots</strong>: <kbd>Tab</kbd> to move to next control point</li>
        <li><strong>Shift+Tab</strong>: Move to previous control point</li>
        <li><strong>Arrow Keys</strong>: Move selected control point in small increments</li>
        <li><strong>Shift + Arrow Keys</strong>: Move in larger increments</li>
      </ul>

      <p><strong>Articulation Editing:</strong></p>
      <ul>
        <li><strong>Start Articulations</strong>: Techniques at trajectory beginning (plucks, slides)</li>
        <li><strong>End Articulations</strong>: Techniques at trajectory end</li>
        <li><strong>Stroke Selection</strong>: Choose appropriate stroke type for instrument</li>
        <li><strong>Phoneme Entry</strong>: For vocal tracks, enter consonants and vowels</li>
      </ul>

      <hr>

      <h2 id="structural-elements">4. Structural Elements</h2>

      <h3 id="phrase-divisions">4.1 Phrase and Section Divisions</h3>
      <p>
        Phrase and section divisions help organize musical content into meaningful structural units.
        These divisions are essential for analysis and navigation.
      </p>

      <p><strong>Division Types:</strong></p>
      <ul>
        <li><strong>Phrase Divisions</strong>: Mark smaller musical units within sections (thin vertical lines)</li>
        <li><strong>Section Divisions</strong>: Mark major structural boundaries (thick vertical lines)</li>
        <li><strong>Polyphonic Behavior</strong>: Divisions automatically affect both strings on polyphonic instruments</li>
      </ul>

      <p><strong>Creating Divisions (Phrase Division Mode - P):</strong></p>
      <ol>
        <li><strong>Activate Mode</strong>: Press <kbd>P</kbd> or click the P mode square</li>
        <li><strong>Place Division</strong>: Click at the desired time position on the graph</li>
        <li><strong>Set Division Type</strong>: Use right panel to choose "Phrase" or "Section"</li>
        <li><strong>Adjust Position</strong>: Select division and use <kbd>Left/Right arrows</kbd> to nudge</li>
      </ol>

      <p><strong>Division Management:</strong></p>
      <ul>
        <li><strong>Select Division</strong>: Click on the vertical division line</li>
        <li><strong>Nudge Position</strong>: <kbd>Left/Right arrows</kbd> for fine adjustment</li>
        <li><strong>Change Type</strong>: Use right panel dropdown to switch between phrase/section</li>
        <li><strong>Delete Division</strong>: Select and press <kbd>Delete</kbd> or <kbd>Backspace</kbd></li>
        <li><strong>Automatic Synchronization</strong>: Changes affect all strings simultaneously</li>
      </ul>

      <h3 id="meter-system">4.2 Meter System</h3>
      <p>
        The meter system allows you to create hierarchical rhythmic structures that represent
        the tala (rhythmic cycle) and its subdivisions.
      </p>

      <p><strong>Creating Meters (Meter Mode - M):</strong></p>
      <ol>
        <li><strong>Activate Mode</strong>: Press <kbd>M</kbd> or click the M mode square</li>
        <li><strong>Place Pulses</strong>: Click to place beats at desired time positions</li>
        <li><strong>Open Meter Controls</strong>: Click the meter controls icon (comb-like) in bottom row</li>
        <li><strong>Define Hierarchy</strong>: Set hierarchy depth and layer assignments</li>
        <li><strong>Set Pattern Type</strong>: Choose simple (even) or compound (uneven) subdivisions</li>
        <li><strong>Insert Meter</strong>: Click "Insert Meter from Pulses" to create the grid</li>
      </ol>

      <p><strong>Meter Configuration:</strong></p>
      <ul>
        <li><strong>Hierarchy Layers</strong>: Multiple levels (e.g., beat, subdivision, accent patterns)</li>
        <li><strong>Simple Meters</strong>: Even subdivisions (e.g., 4, 8, 16)</li>
        <li><strong>Compound Meters</strong>: Uneven patterns (e.g., 3+4 for 7-beat cycles)</li>
        <li><strong>Cycles</strong>: Number of pattern repetitions</li>
        <li><strong>Tempo Control</strong>: Adjust playback tempo</li>
        <li><strong>Layer Visibility</strong>: Show/hide different hierarchical levels</li>
      </ul>

      <h3 id="chikari-strokes">4.3 Chikari Strokes (Sitar)</h3>
      <p>
        Chikari strokes represent sympathetic string strums on the sitar, adding rhythmic
        and harmonic accompaniment to the main melodic line.
      </p>

      <p><strong>Creating Chikari Strokes (Chikari Mode - C):</strong></p>
      <ol>
        <li><strong>Activate Mode</strong>: Press <kbd>C</kbd> or click the C mode square (Sitar only)</li>
        <li><strong>Place Stroke</strong>: Click at desired time position</li>
        <li><strong>Pitch Alignment</strong>: Stroke aligns to trajectory pitch or tonic if in silence</li>
        <li><strong>Edit Stroke</strong>: Select and use arrow keys to adjust timing</li>
      </ol>

      <p><strong>Chikari Stroke Behavior:</strong></p>
      <ul>
        <li><strong>During Trajectory</strong>: Stroke aligns with current trajectory pitch</li>
        <li><strong>In Silence</strong>: Stroke appears at tonic (Sa) in octave 0</li>
        <li><strong>Visual Indicator</strong>: Displayed as "X" symbol on the graph</li>
        <li><strong>Polyphonic Awareness</strong>: Works with both strings on polyphonic sitar</li>
      </ul>

      <h3 id="region-selection">4.4 Region Selection</h3>
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
        <li><strong>Visual Highlight</strong>: Selected region appears highlighted on graph</li>
        <li><strong>Zoom to Region</strong>: Automatically focuses view on selected area</li>
        <li><strong>Analysis Focus</strong>: Restrict analysis operations to selected region</li>
      </ul>

      <hr>

      <h2 id="advanced-features">5. Advanced Features</h2>

      <h3 id="synthesis-audio">5.1 Synthesis and Audio</h3>
      <p>
        IDTAP includes sophisticated audio synthesis engines that can generate audio playback
        of your transcriptions using physical modeling synthesis.
      </p>

      <p><strong>Accessing Synthesis Controls:</strong></p>
      <ul>
        <li><strong>Icon</strong>: Diagonal ruler in bottom row</li>
        <li><strong>Per-Instrument Controls</strong>: Volume, damping, and instrument-specific parameters</li>
        <li><strong>Global Controls</strong>: Mixed synth gain, recording gain, pitch shift (macOS)</li>
      </ul>

      <p><strong>Sitar Synthesis (Polyphonic):</strong></p>
      <ul>
        <li><strong>Main String Volume</strong>: Control primary melodic line</li>
        <li><strong>Jor String Volume</strong>: Control secondary string (polyphonic mode)</li>
        <li><strong>Chikari Volume</strong>: Control sympathetic string level</li>
        <li><strong>Dampen</strong>: Adjust string damping characteristics</li>
        <li><strong>Sonify Toggle</strong>: Enable/disable synthesis for this instrument</li>
      </ul>

      <p><strong>Sarangi Synthesis (Polyphonic):</strong></p>
      <ul>
        <li><strong>Main String Volume</strong>: Control primary bowed string</li>
        <li><strong>Second String Volume</strong>: Control secondary string (polyphonic mode)</li>
        <li><strong>Bow Pressure</strong>: Adjust bowing dynamics</li>
        <li><strong>Resonance</strong>: Control sympathetic string resonance</li>
      </ul>

      <h3 id="tuning-system">5.2 Tuning System</h3>
      <p>
        Customize the pitch system and tuning for accurate transcription of different ragas
        and performance contexts.
      </p>

      <p><strong>Accessing Tuning Controls:</strong></p>
      <ul>
        <li><strong>Icon</strong>: Tuning fork in bottom row</li>
        <li><strong>Sa Frequency</strong>: Set tonic pitch in Hz</li>
        <li><strong>Individual Pitch Adjustment</strong>: Fine-tune each sargam note</li>
        <li><strong>Reference Sine Wave</strong>: Gain sliders to hear reference pitches</li>
      </ul>

      <p><strong>Tuning Features:</strong></p>
      <ul>
        <li><strong>Cents Adjustment</strong>: ±50 cents tuning range for each pitch</li>
        <li><strong>Reset Function</strong>: Return to equal temperament</li>
        <li><strong>Real-time Playback</strong>: Hear tuning changes immediately</li>
        <li><strong>Raga-Specific Tuning</strong>: Save custom tuning systems</li>
      </ul>

      <h3 id="labeling-categorization">5.3 Labeling and Categorization</h3>
      <p>
        Comprehensive labeling system for musical analysis and research documentation.
      </p>

      <p><strong>Accessing Label Editor:</strong></p>
      <ul>
        <li><strong>Icon</strong>: Set of tags in bottom row</li>
        <li><strong>Track Selection</strong>: Choose which instrument track to label</li>
        <li><strong>Navigation</strong>: Double-click to jump to labeled sections</li>
      </ul>

      <p><strong>Section Labels:</strong></p>
      <ul>
        <li><strong>Pre-Chiz Alap</strong>: Opening improvisational section</li>
        <li><strong>Alap</strong>: Free-rhythm melodic development</li>
        <li><strong>Composition</strong>: Fixed compositional material</li>
        <li><strong>Improvisation</strong>: Structured improvisational sections</li>
        <li><strong>Other</strong>: Custom section types</li>
      </ul>

      <p><strong>Phrase Labels:</strong></p>
      <ul>
        <li><strong>Phrase Type</strong>: Categorize melodic phrase types</li>
        <li><strong>Elaboration Type</strong>: Identify ornamental patterns</li>
        <li><strong>Articulation Type</strong>: Document performance techniques</li>
        <li><strong>Incidental</strong>: Mark special events or anomalies</li>
      </ul>

      <h3 id="visual-customization">5.4 Visual Customization</h3>
      <p>
        Customize the visual appearance and display settings for optimal transcription workflow.
      </p>

      <p><strong>Accessing Visual Controls:</strong></p>
      <ul>
        <li><strong>Icon</strong>: Bar graph with control knobs in bottom row</li>
        <li><strong>Spectrogram Settings</strong>: Colormap and intensity adjustments</li>
        <li><strong>Color Customization</strong>: Modify element colors for accessibility</li>
        <li><strong>Display Presets</strong>: Save and load visual configurations</li>
      </ul>

      <p><strong>Customizable Elements:</strong></p>
      <ul>
        <li><strong>Background Color</strong>: Adjust for eye strain reduction</li>
        <li><strong>Trajectory Colors</strong>: Different colors per instrument/string</li>
        <li><strong>Selection Colors</strong>: Highlight colors for selected elements</li>
        <li><strong>Meter Display</strong>: Rhythm grid appearance and visibility</li>
        <li><strong>Playhead Animation</strong>: Smooth, block, or no animation options</li>
      </ul>

      <h3 id="data-export">5.5 Data Export</h3>
      <p>
        Export transcription data in multiple formats for analysis and documentation.
      </p>

      <p><strong>Accessing Export Options:</strong></p>
      <ul>
        <li><strong>Icon</strong>: Downward arrow to tray in bottom row</li>
        <li><strong>Format Selection</strong>: Choose export format</li>
        <li><strong>Data Filtering</strong>: Select specific elements to export</li>
      </ul>

      <p><strong>Available Export Formats:</strong></p>
      <ul>
        <li><strong>JSON</strong>: Complete transcription data in IDTAP native format</li>
        <li><strong>XLSX (Excel)</strong>: Spreadsheet format for analysis</li>
        <li><strong>CSV</strong>: Comma-separated values for data processing</li>
        <li><strong>MIDI</strong>: Musical data for external software (where applicable)</li>
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
        <li><kbd>A</kbd> - Assemblage Phrase Pick Mode</li>
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
        <li><kbd>Shift + Left/Right</kbd> - Move in larger increments</li>
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
        <li><kbd>G</kbd> - Group/ungroup trajectories</li>
        <li><kbd>Option + Click</kbd> - Fine adjustment mode</li>
      </ul>

      <h3>6.6 Polyphonic Instruments</h3>
      <ul>
        <li><kbd>X</kbd> - Toggle between String 1 and String 2</li>
        <li><kbd>Click string selector</kbd> - Switch strings</li>
        <li><kbd>Automatic string switching</kbd> - Click trajectory switches to its string</li>
      </ul>

      <h3>6.7 Advanced Editing</h3>
      <ul>
        <li><kbd>Tab</kbd> - Navigate between control points</li>
        <li><kbd>Shift + Tab</kbd> - Navigate to previous control point</li>
        <li><kbd>Arrow keys</kbd> - Move selected control point</li>
        <li><kbd>Right-click</kbd> - Context menu options</li>
        <li><kbd>D</kbd> - Toggle dampen (Sitar synthesis)</li>
      </ul>

      <hr>

      <h2 id="workflows-examples">7. Common Workflows and Examples</h2>

      <h3>7.1 Creating a Basic Monophonic Transcription</h3>
      <ol>
        <li>Select appropriate instrument track</li>
        <li>Activate Trajectory Mode (<kbd>T</kbd>)</li>
        <li>Create trajectories by clicking start/end points</li>
        <li>Select trajectory types using number keys</li>
        <li>Add phrase divisions (<kbd>P</kbd> mode) for structure</li>
        <li>Fine-tune with drag dots and arrow keys</li>
        <li>Save transcription regularly</li>
      </ol>

      <h3>7.2 Working with Polyphonic Sitar</h3>
      <ol>
        <li>Ensure Sitar is selected as instrument</li>
        <li>Note string selector appearance</li>
        <li>Transcribe main melody on String 1 (all trajectory types available)</li>
        <li>Switch to String 2 (<kbd>X</kbd> key) for secondary line</li>
        <li>Use only Fixed (0) trajectories on String 2</li>
        <li>Add chikari strokes (<kbd>C</kbd> mode) for rhythmic accompaniment</li>
        <li>Phrase divisions automatically affect both strings</li>
      </ol>

      <h3>7.3 Series Mode for Rapid Transcription</h3>
      <ol>
        <li>Activate Series Mode (<kbd>S</kbd>)</li>
        <li>Click to place connected trajectory sequence</li>
        <li>Use number keys to set trajectory types as you go</li>
        <li>Press <kbd>Escape</kbd> to exit series mode</li>
        <li>Fine-tune individual trajectories as needed</li>
      </ol>

      <h3>7.4 Adding Rhythmic Structure</h3>
      <ol>
        <li>Activate Meter Mode (<kbd>M</kbd>)</li>
        <li>Click to place pulse points</li>
        <li>Open Meter Controls (comb icon)</li>
        <li>Define hierarchy and pattern type</li>
        <li>Insert meter grid</li>
        <li>Enable Meter Magnet for trajectory quantization</li>
      </ol>

      <hr>

      <h2 id="troubleshooting">8. Troubleshooting and Tips</h2>

      <h3>8.1 Common Issues</h3>
      <ul>
        <li><strong>Can't create trajectory on String 2</strong>: Only Fixed (0) trajectories allowed</li>
        <li><strong>Trajectory won't select</strong>: Check if correct string is active (polyphonic instruments)</li>
        <li><strong>Keyboard shortcuts not working</strong>: Ensure correct mode is selected</li>
        <li><strong>Audio synthesis not playing</strong>: Check Sonify toggle in synthesis controls</li>
        <li><strong>String selector missing</strong>: Only appears for Sitar and Sarangi instruments</li>
      </ul>

      <h3>8.2 Performance Tips</h3>
      <ul>
        <li><strong>Use Series Mode</strong>: For rapid creation of connected trajectories</li>
        <li><strong>Enable Magnets</strong>: Meter and Sargam magnets for precise alignment</li>
        <li><strong>Regular Saving</strong>: Use Save button frequently during work</li>
        <li><strong>Region Selection</strong>: Focus on specific sections for detailed editing</li>
        <li><strong>Keyboard Navigation</strong>: Learn keyboard shortcuts for efficient workflow</li>
      </ul>

      <h3>8.3 Best Practices</h3>
      <ul>
        <li><strong>Plan Structure First</strong>: Add phrase divisions before detailed trajectory work</li>
        <li><strong>Work in Layers</strong>: Basic trajectories first, then refinement</li>
        <li><strong>Use Appropriate String</strong>: String 1 for complex ornaments, String 2 for simple lines</li>
        <li><strong>Label Early</strong>: Add section labels for better organization</li>
        <li><strong>Visual Clarity</strong>: Adjust colors and visibility for eye strain reduction</li>
      </ul>

      <hr>

      <h2 id="support">9. Support and Feedback</h2>
      <p>
        If you have questions, need assistance, or wish to provide feedback about IDTAP:
      </p>
      <ul>
        <li><strong>Email</strong>: JBMYERS [at] UCSC [dot] EDU</li>
        <li><strong>GitHub Issues</strong>: <a href="https://github.com/UCSC-IDTAP/IDTAP/issues">Report bugs and feature requests</a></li>
        <li><strong>Documentation</strong>: Visit the project repository for additional resources</li>
        <li><strong>Research Collaboration</strong>: Contact for academic research partnerships</li>
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
        This user guide covers the complete IDTAP Editor functionality as of January 2025.
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
