<template>
    <div id="idtap-editor-instructions" :style='mainStyle'>
      <h1>Instructions for the Editor Tab of IDTAP</h1>
      <hr>
      <h2>Table of Contents</h2>
      <ol>
        <li>
          <a href="#navigation-and-interface">Navigation and Interface</a>
          <ol type="a">
            <li><a href="#editor-modes">Editor Modes</a></li>
            <li><a href="#instrument-tracks">Instrument Tracks</a></li>
            <li><a href="#editor-graph">Editor Graph</a></li>
            <li><a href="#visibility-options">Visibility Options</a></li>
            <li><a href="#playback-controls">Playback Controls</a></li>
          </ol>
        </li>
        <li>
          <a href="#working-with-trajectories">Working with Trajectories</a>
          <ol type="a">
            <li><a href="#trajectory-types">Trajectory Types</a></li>
            <li><a href="#entering-trajectories">Entering Trajectories</a></li>
            <li><a href="#selecting-and-editing-trajectories">Selecting and Editing Trajectories</a></li>
          </ol>
        </li>
        <li><a href="#phrase-and-section-divisions">Phrase and Section Divisions</a></li>
        <li><a href="#meter-functionality">Meter Functionality</a></li>
        <li><a href="#chikari-mode">Chikari Mode (Sitar Only)</a></li>
        <li><a href="#region-selection">Region Selection</a></li>
        <li>
          <a href="#additional-controls">Additional Controls</a>
          <ol type="a">
            <li><a href="#synthesis-controls">Synthesis Controls</a></li>
            <li><a href="#tuning-controls">Tuning Controls</a></li>
            <li><a href="#download-data">Download Data</a></li>
            <li><a href="#meter-controls">Meter Controls</a></li>
            <li><a href="#label-editor">Label Editor</a></li>
            <li><a href="#transcription-and-graphic-controls">Transcription and Graphic Controls</a></li>
          </ol>
        </li>
        <li><a href="#keyboard-shortcuts-and-tips">Keyboard Shortcuts and Tips</a></li>
        <li><a href="#support-and-feedback">Support and Feedback</a></li>
      </ol>

      <hr>

      <h2 id="navigation-and-interface">2. Navigation and Interface</h2>

      <h3 id="editor-modes">2.1 Editor Modes</h3>
      <p>
        At the top-left of the screen, beneath the main navigation bar, you'll find the <strong>Editor Modes</strong> represented by squares with letters in their lower-right corners:
      </p>
      <ul>
        <li><strong>T</strong>: <em>Trajectory Mode</em></li>
        <li><strong>S</strong>: <em>Series Mode</em></li>
        <li><strong>P</strong>: <em>Phrase Division Mode</em></li>
        <li><strong>M</strong>: <em>Meter Mode</em></li>
        <li><strong>C</strong>: <em>Chikari Mode</em> (available only if the instrument is Sitar)</li>
        <li><strong>R</strong>: <em>Region Selection Mode</em></li>
      </ul>
      <p><strong>How to Use:</strong></p>
      <ul>
        <li><strong>Select a Mode</strong>: Click on a mode square or press the corresponding keyboard letter.</li>
        <li><strong>Tooltips</strong>: Hover over a mode square to see a tooltip explaining its function.</li>
      </ul>

      <h3 id="instrument-tracks">2.2 Instrument Tracks</h3>
      <p>
        Next to the Editor Modes are the <strong>Instrument Tracks</strong>, displayed as green boxes with numbers in their lower-right corners (starting from 1):
      </p>
      <ul>
        <li><strong>Select a Track</strong>: Click on a box to switch to that instrument's track for editing.</li>
        <li><strong>Instrument Information</strong>: Hover over a box to see "Track X: Instrument Name".</li>
        <li><strong>Edit Instrumentation</strong>: Right-click on any track box and select <em>"Edit Instrumentation"</em> to add, remove, or change instruments.</li>
      </ul>
      <p><strong>Available Instruments:</strong></p>
      <ul>
        <li>Sitar</li>
        <li>Sarangi</li>
        <li>Vocal (M): Male vocal</li>
        <li>Vocal (F): Female vocal</li>
      </ul>

      <h3 id="editor-graph">2.3 Editor Graph</h3>
      <p>
        The main area below the green row is the <strong>Editor Graph</strong>, which displays:
      </p>
      <ul>
        <li><strong>X-Axis (Time)</strong>: Represented in seconds, located at the top of the graph.</li>
        <li><strong>Y-Axis (Pitch/Frequency)</strong>: Uses a logarithmic scale with sargam pitch notation.</li>
      </ul>
      <p><strong>Sargam Notation:</strong></p>
      <ul>
        <li><strong>Pitches</strong>: Sa, Re, Ga, Ma, Pa, Dha, Ni, Sa</li>
        <li><strong>Representation</strong>: First letters (S, R, G, M, P, D, N)
          <ul>
            <li>Lowered pitches: Lowercase letters (e.g., "r" for komal Re)</li>
            <li>Raised pitches: Uppercase letters (e.g., "R" for tivra Re)</li>
            <li>Octaves: Dots above or below the letter indicate higher or lower octaves</li>
          </ul>
        </li>
      </ul>
      <p><strong>Navigating the Graph:</strong></p>
      <ul>
        <li><strong>Scroll</strong>:
          <ul>
            <li><em>Horizontal</em>: Use the mouse wheel, touchpad swipe, or left/right arrow keys.</li>
            <li><em>Vertical</em>: Use the up/down arrow keys.</li>
          </ul>
        </li>
        <li><strong>Zoom</strong>:
          <ul>
            <li><em>Horizontal Zoom</em>: Click the "+" or "-" buttons at the bottom-left corner.</li>
            <li><em>Vertical Zoom</em>: Click the "+" or "-" buttons at the top-right corner.</li>
          </ul>
        </li>
        <li><strong>Move Graph</strong>:
          <ul>
            <li><em>Jump Left</em>: Press "[" to move left by half the current viewing area.</li>
            <li><em>Jump Right</em>: Press "]" to move right by half the current viewing area.</li>
            <li><em>Nudge Left</em>: Press the left arrow key to move left by a small increment.</li>
            <li><em>Nudge Right</em>: Press the right arrow key to move right by a small increment.</li>
            <li><em>Phrase Navigation</em>:
              <ul>
                <li><strong>Next Phrase</strong>: Press "Tab" to move to the next phrase division.</li>
                <li><strong>Previous Phrase</strong>: Press "Shift + Tab" to move to the previous phrase division.</li>
              </ul>
            </li>
          </ul>
        </li>
        <li><strong>Playhead Position</strong>:
          <ul>
            <li><em>Set Position</em>: Double-click anywhere on the graph to move the playhead to that location.</li>
          </ul>
        </li>
      </ul>

      <h3 id="visibility-options">2.4 Visibility Options</h3>
      <p>
        On the right side of the graph, you'll find <strong>Visibility Options</strong>:
      </p>
      <ul>
        <li><strong>Expand/Collapse</strong>: Click the triangle next to "Visibility" to expand or collapse the options.</li>
        <li><strong>Toggle Elements</strong>:
          <ul>
            <li><em>Spectrogram</em>: Displays the constant-Q transform spectrogram of the recording.</li>
            <li><em>Melograph</em>: Shows the pitch trace of the predominant melody.</li>
            <li><em>Sargam</em>: Displays sargam pitch labels at every pitch change in the transcription.</li>
            <li><em>Sargam Lines</em>: Shows horizontal lines corresponding to sargam pitches.</li>
            <li><em>Bols</em>: (Sitar only) Displays bol strokes indicating up or down plucking motions.</li>
            <li><em>Transcription</em>: Shows the transcription.</li>
            <li><em>Meter</em>: Displays meter grids with hierarchical pulse lines.</li>
            <li><em>Phrase Divs</em>: Shows phrase and section divisions.</li>
          </ul>
        </li>
      </ul>
      <p><strong>Additional Options:</strong></p>
      <ul>
        <li><strong>Loop</strong>: Enable to loop playback over a selected region.</li>
        <li><strong>Playhead Return</strong>: Playhead returns to the starting point when playback is stopped.</li>
        <li><strong>Meter Magnet</strong>: Quantizes trajectory points to the nearest pulse in the meter when editing.</li>
        <li><strong>Sargam Magnet</strong>: Quantizes pitch points to the nearest sargam note when editing.</li>
        <li><strong>Save Button</strong>: Click to save your transcription progress.</li>
        <li><strong>Phoneme Script</strong>: (Vocal tracks) Select between Latin, Devanagari, or IPA scripts for phoneme representation.</li>
      </ul>

      <h3 id="playback-controls">2.5 Playback Controls</h3>
      <p>
        At the bottom of the screen is a black row containing the <strong>Playback Controls</strong>:
      </p>
      <ul>
        <li><strong>Rewind</strong>: Click the counter-clockwise half-circle arrow to move the playhead back by 15 seconds.</li>
        <li><strong>Play/Pause</strong>: Click to start or pause playback. The icon toggles between a triangle (play) and two vertical rectangles (pause).</li>
        <li><strong>Fast Forward</strong>: Click the clockwise half-circle arrow to move the playhead forward by 15 seconds.</li>
        <li><strong>Keyboard Shortcut</strong>: Press the <strong>Spacebar</strong> to play or pause playback.</li>
      </ul>

      <hr>

      <h2 id="working-with-trajectories">3. Working with Trajectories</h2>
      <p>
        Trajectories are the fundamental elements representing musical phrases and notes in the transcription. They are visual representations of pitch over time.
      </p>

      <h3 id="trajectory-types">3.1 Trajectory Types</h3>
      <p>
        Depending on the instrument track, different types of trajectories are available:
      </p>
      <p><strong>Common Trajectories (All Instruments):</strong></p>
      <ul>
        <li><strong>Fixed (0)</strong>: A constant pitch throughout its duration.</li>
        <li><strong>Bend: Simple (1)</strong>: Smooth transition between two pitches using a half-cosine interpolation.</li>
        <li><strong>Bend: Sloped Start (2)</strong>: Rapid ascent or descent from the starting pitch, smoothing towards the ending pitch.</li>
        <li><strong>Bend: Sloped End (3)</strong>: Smooth start from the initial pitch, with a rapid approach to the ending pitch.</li>
        <li><strong>Bend: Ladle (4)</strong>: Combines "Sloped Start" and "Simple" bends in series.</li>
        <li><strong>Bend: Reverse Ladle (5)</strong>: Combines "Simple" and "Sloped End" bends in series.</li>
        <li><strong>Bend: Simple Multiple (6)</strong>: Series of "Simple" bends connected in sequence.</li>
        <li><strong>Vibrato (e)</strong>: Oscillating pitch with adjustable parameters (offset, phase, extent).</li>
      </ul>
      <p><strong>Sitar-Specific Trajectories:</strong></p>
      <ul>
        <li><strong>Krintin (7)</strong>: "Hammer-off" technique to a lower pitch.</li>
        <li><strong>Krintin Slide (8)</strong>: Sequence involving a hammer-off and downward slide.</li>
        <li><strong>Krintin Slide Hammer (9)</strong>: Extended sequence with hammer-off, slide, and hammer-on.</li>
        <li><strong>Dense Krintin Slide Hammer (a)</strong>: Complex sequence of six pitches and techniques.</li>
        <li><strong>Slide (b)</strong>: Continuous slide between pitches without hammer techniques.</li>
      </ul>
      <p><em>Note:</em> The availability of trajectory types depends on the selected instrument.</p>

      <h3 id="entering-trajectories">3.2 Entering Trajectories</h3>
      <h4 id="trajectory-mode">3.2.1 Trajectory Mode</h4>
      <p><strong>Activating Trajectory Mode:</strong></p>
      <ul>
        <li><strong>Click</strong>: Select the "T" mode square in the Editor Modes.</li>
        <li><strong>Keyboard Shortcut</strong>: Press <strong>T</strong>.</li>
      </ul>
      <p><strong>Entering a Trajectory:</strong></p>
      <ol>
        <li><strong>Start Point</strong>:
          <ul>
            <li>Click on the graph in a silent area (where no existing trajectory overlaps).</li>
          </ul>
        </li>
        <li><strong>Place Control Dots</strong>:
          <ul>
            <li>Depending on the trajectory type, place the required number of control dots.</li>
            <li><em>Control Dots</em>: Small points that define the trajectory's shape and duration.</li>
          </ul>
        </li>
        <li><strong>Select Trajectory Type</strong>:
          <ul>
            <li><strong>Click on Trajectory Icon</strong>: On the right side of the screen, click the icon representing the desired trajectory.</li>
            <li><strong>Press Label Key</strong>: Press the corresponding label number or letter on your keyboard (e.g., press <strong>1</strong> for "Bend: Simple").</li>
          </ul>
        </li>
        <li><strong>Adjust Parameters</strong>:
          <ul>
            <li>For certain trajectories (e.g., "Sloped Start/End"), additional controls appear to adjust parameters like slope.</li>
          </ul>
        </li>
        <li><strong>Finalize Trajectory</strong>:
          <ul>
            <li>The trajectory is now added to your transcription.</li>
          </ul>
        </li>
      </ol>
      <p><strong>Example:</strong></p>
      <p>To create a "Bend: Simple" trajectory:</p>
      <ol>
        <li>Activate <strong>Trajectory Mode</strong>.</li>
        <li>Click to place the starting point.</li>
        <li>Click to place the ending point.</li>
        <li>Click on the "Bend: Simple" icon (labeled <strong>1</strong>) or press <strong>1</strong> on your keyboard.</li>
      </ol>

      <h4 id="series-mode">3.2.2 Series Mode</h4>
      <p><strong>Activating Series Mode:</strong></p>
      <ul>
        <li><strong>Click</strong>: Select the "S" mode square in the Editor Modes.</li>
        <li><strong>Keyboard Shortcut</strong>: Press <strong>S</strong>.</li>
      </ul>
      <p><strong>Entering a Series of Fixed Trajectories:</strong></p>
      <ol>
        <li><strong>First Point</strong>:
          <ul>
            <li>Click on the graph in a silent area to place the starting point of the first trajectory.</li>
          </ul>
        </li>
        <li><strong>Subsequent Points</strong>:
          <ul>
            <li>Click to the right of the previous point to add more fixed trajectories.</li>
            <li>Each click defines the end of the current trajectory and the start of the next.</li>
          </ul>
        </li>
        <li><strong>Select Trajectory Type</strong>:
          <ul>
            <li>By default, trajectories are set as "Fixed". If you wish to change the trajectory type for the selected points, click on the desired trajectory icon or press its label key.</li>
          </ul>
        </li>
        <li><strong>Finalize Series</strong>:
          <ul>
            <li>Press <strong>Esc</strong> or select a different mode to finish.</li>
          </ul>
        </li>
      </ol>

      <h3 id="selecting-and-editing-trajectories">3.3 Selecting and Editing Trajectories</h3>
      <p><strong>Selecting Trajectories:</strong></p>
      <ul>
        <li><strong>Single Trajectory</strong>: Click on a trajectory to select it.</li>
        <li><strong>Multiple Trajectories</strong>:
          <ul>
            <li><strong>Shift + Click</strong>: Hold <strong>Shift</strong> and click on additional trajectories.</li>
            <li><strong>Box Selection</strong>: Hold <strong>Shift</strong>, click, and drag to draw a selection box around multiple trajectories.</li>
          </ul>
        </li>
      </ul>
      <p><strong>Editing Trajectories:</strong></p>
      <ul>
        <li><strong>Move Alignment Dots</strong>:
          <ul>
            <li><strong>Drag</strong>: Click and drag the dots to adjust timing and pitch.</li>
            <li><strong>Fine Adjustment</strong>: Hold <strong>Option</strong> (Alt) and click on a dot, then use arrow keys to nudge.</li>
          </ul>
        </li>
        <li><strong>Change Trajectory Type</strong>:
          <ul>
            <li>With the trajectory selected, click on a different trajectory icon or press its label key.</li>
            <li>Ensure the selected trajectory has the appropriate number of control dots for the new type.</li>
          </ul>
        </li>
        <li><strong>Adjust Parameters</strong>:
          <ul>
            <li>For certain trajectories (e.g., "Sloped Start"), adjust the slope using the slider in the right panel.</li>
          </ul>
        </li>
        <li><strong>Group Trajectories</strong>:
          <ul>
            <li><strong>Select Contiguous Trajectories</strong>: They must be adjacent and within the same phrase.</li>
            <li><strong>Group</strong>: In the right panel, check the "Grouped" checkbox.</li>
            <li><strong>Effect</strong>: Grouped trajectories are treated as a single unit for selection and editing.</li>
            <li><strong>Ungroup</strong>: Uncheck the "Grouped" checkbox to edit individually.</li>
          </ul>
        </li>
      </ul>
      <p><strong>Context Menu Options:</strong></p>
      <ul>
        <li><strong>Right-Click on a Trajectory</strong>:
          <ul>
            <li><em>Insert Silence Left/Right</em>: Moves the start or end point to create a 0.1-second silence.</li>
            <li><em>Insert Fixed Left/Right</em>: Inserts a short fixed trajectory before or after the selected trajectory.</li>
          </ul>
        </li>
      </ul>
      <p><strong>Deleting Trajectories:</strong></p>
      <ul>
        <li><strong>Select Trajectory</strong>: Click to select.</li>
        <li><strong>Delete</strong>: Press <strong>Delete</strong> or <strong>Backspace</strong>.</li>
      </ul>

      <hr>

      <!-- The rest of the sections would continue similarly, with appropriate HTML tags and formatting. Due to space constraints, the continuation is omitted. -->
      <hr>

<h2 id="phrase-and-section-divisions">4. Phrase and Section Divisions</h2>
<p>
  Dividing your transcription into phrases and sections helps in organizing and analyzing the musical structure.
</p>

<h3 id="phrase-division-mode">4.1 Phrase Division Mode</h3>
<p><strong>Activating Phrase Division Mode:</strong></p>
<ul>
  <li><strong>Click</strong>: Select the "P" mode square in the Editor Modes.</li>
  <li><strong>Keyboard Shortcut</strong>: Press <strong>P</strong>.</li>
</ul>
<p><strong>Adding Phrase Divisions:</strong></p>
<ol>
  <li><strong>Insert Division</strong>:
  </li>
      </ol>

      <p><strong>Adjust Division:</strong></p>
      <ul>
        <li><strong>Select Division</strong>: Click on the division line (vertical line).</li>
        <li><strong>Move Division</strong>: Use the left/right arrow keys to nudge the division.</li>
      </ul>
      <p><strong>Set Division Type:</strong></p>
      <ul>
        <li>In the right panel, choose between:
          <ul>
            <li><strong>Phrase Division</strong>: Thinner line.</li>
            <li><strong>Section Division</strong>: Thicker line.</li>
          </ul>
        </li>
      </ul>
      <p><strong>Deleting Divisions:</strong></p>
      <ul>
        <li><strong>Select Division</strong>: Click to select.</li>
        <li><strong>Delete</strong>: Press <strong>Delete</strong> or <strong>Backspace</strong>.</li>
      </ul>

      <hr>

      <h2 id="meter-functionality">5. Meter Functionality</h2>
      <p>
        Meters define rhythmic structures and can be hierarchical, representing pulses at different levels.
      </p>

      <h3 id="meter-mode">5.1 Meter Mode</h3>
      <p><strong>Activating Meter Mode:</strong></p>
      <ul>
        <li><strong>Click</strong>: Select the "M" mode square in the Editor Modes.</li>
        <li><strong>Keyboard Shortcut</strong>: Press <strong>M</strong>.</li>
      </ul>
      <p><strong>Adding Meter Pulses:</strong></p>
      <ol>
        <li><strong>Place Pulses</strong>:
          <ul>
            <li>The cursor changes to a downward-pointing arrow.</li>
            <li>Click on the graph to place pulses where you want beats or rhythmic divisions.</li>
          </ul>
        </li>
        <li><strong>Open Meter Controls</strong>:
          <ul>
            <li>Click on the <strong>Meter Controls</strong> icon at the bottom-right (comb-like icon).</li>
          </ul>
        </li>
        <li><strong>Define Hierarchy</strong>:
          <ul>
            <li><strong>Hierarchy Depth</strong>: Choose the number of hierarchical layers (e.g., 2 for simple meters).</li>
            <li><strong>Layer Assignment</strong>: Assign the pulses you placed to the desired layer.</li>
            <li><strong>Compound or Simple</strong>: Select if the hierarchy is simple (single integer) or compound (sequence of integers).
              <ul>
                <li><strong>Simple</strong>: Even subdivisions (e.g., 4).</li>
                <li><strong>Compound</strong>: Uneven subdivisions (e.g., 3 + 4 for a 7-beat cycle).</li>
              </ul>
            </li>
          </ul>
        </li>
        <li><strong>Insert Meter</strong>:
          <ul>
            <li>Click <strong>"Insert Meter from Pulses"</strong> to create the meter grid.</li>
          </ul>
        </li>
        <li><strong>Adjust Meter Settings</strong>:
          <ul>
            <li><strong>Cycles</strong>: Set the number of times the meter pattern repeats.</li>
            <li><strong>Tempo</strong>: Adjust the tempo using the slider or input box.</li>
            <li><strong>Layer Visibility</strong>: Use the range slider to hide or show lower layers.</li>
          </ul>
        </li>
      </ol>
      <p><strong>Editing Meter Pulses:</strong></p>
      <ul>
        <li><strong>Select Pulse</strong>:
          <ul>
            <li>Click on a pulse line within the meter grid.</li>
          </ul>
        </li>
        <li><strong>Move Pulse</strong>:
          <ul>
            <li><strong>Drag</strong>: Click and drag the pulse to a new position.</li>
            <li><strong>Nudge</strong>: Hold <strong>Option</strong> (Alt) and use left/right arrow keys for fine adjustments.</li>
          </ul>
        </li>
        <li><strong>Delete Meter</strong>:
          <ul>
            <li><strong>Select Meter</strong>: Click on any part of the meter grid.</li>
            <li><strong>Delete</strong>: Press <strong>Delete</strong> or <strong>Backspace</strong>.</li>
          </ul>
        </li>
      </ul>

      <hr>

      <h2 id="chikari-mode">6. Chikari Mode (Sitar Only)</h2>
      <p>
        Chikari strokes represent strumming of the sympathetic strings on a sitar.
      </p>
      <p><strong>Activating Chikari Mode:</strong></p>
      <ul>
        <li><strong>Click</strong>: Select the "C" mode square in the Editor Modes.</li>
        <li><strong>Keyboard Shortcut</strong>: Press <strong>C</strong>.</li>
      </ul>
      <p><strong>Adding Chikari Strokes:</strong></p>
      <ol>
        <li><strong>Place Stroke</strong>:
          <ul>
            <li>Click on the graph where you want the chikari stroke.</li>
            <li><em>In Silence</em>: Stroke appears at the tonic "Sa" in octave 0.</li>
            <li><em>During Trajectory</em>: Stroke aligns with the trajectory's pitch at that moment.</li>
          </ul>
        </li>
      </ol>
      <p><strong>Editing Strokes:</strong></p>
      <ul>
        <li><strong>Select Stroke</strong>: Click on the "x" symbol representing the chikari stroke.</li>
        <li><strong>Move Stroke</strong>:
          <ul>
            <li>Use left/right arrow keys to nudge its position.</li>
          </ul>
        </li>
        <li><strong>Delete Stroke</strong>:
          <ul>
            <li>Press <strong>Delete</strong> or <strong>Backspace</strong>.</li>
          </ul>
        </li>
      </ul>

      <hr>

      <h2 id="region-selection">7. Region Selection</h2>
      <p>
        Regions allow you to loop and focus on specific parts of the transcription during playback.
      </p>

      <h3 id="region-mode">7.1 Region Mode</h3>
      <p><strong>Activating Region Mode:</strong></p>
      <ul>
        <li><strong>Click</strong>: Select the "R" mode square in the Editor Modes.</li>
        <li><strong>Keyboard Shortcut</strong>: Press <strong>R</strong>.</li>
      </ul>
      <p><strong>Selecting a Region:</strong></p>
      <ul>
        <li><strong>By Phrase</strong>:
          <ul>
            <li>Click on a phrase division to set the region to that phrase.</li>
          </ul>
        </li>
        <li><strong>Manual Selection</strong>:
          <ul>
            <li><em>Option 1</em>: Hold <strong>Option</strong> (Alt), click and drag over the desired area in the graph.</li>
            <li><em>Option 2</em>: Click and drag along the x-axis (time axis) to select the region.</li>
          </ul>
        </li>
      </ul>
      <p><strong>Looping Playback:</strong></p>
      <ul>
        <li><strong>Enable Loop</strong>:
          <ul>
            <li>In the Visibility Options, check the <strong>"Loop"</strong> box.</li>
          </ul>
        </li>
        <li><strong>Playback</strong>:
          <ul>
            <li>The playback will loop over the selected region.</li>
          </ul>
        </li>
      </ul>

      <hr>

      <h2 id="additional-controls">8. Additional Controls</h2>
      <p>
        Accessible via icons on the bottom-right black row, these controls allow for deeper customization and functionality.
      </p>

      <h3 id="synthesis-controls">8.1 Synthesis Controls</h3>
      <p><strong>Icon</strong>: Diagonal ruler.</p>
      <p><strong>Accessing Synthesis Controls:</strong></p>
      <ul>
        <li>Click on the <strong>Synthesis Controls</strong> icon.</li>
      </ul>
      <p><strong>Controls for Each Instrument Track:</strong></p>
      <ul>
        <li><strong>Volume Sliders:</strong>
          <ul>
            <li><strong>Sitar:</strong>
              <ul>
                <li><strong>Volume</strong>: Overall volume of the sitar synthesis.</li>
                <li><strong>String</strong>: Volume of the string component.</li>
                <li><strong>Chikari</strong>: Volume of the chikari component.</li>
                <li><strong>Dampen</strong>: Adjusts sound dampening in the synthesis algorithm.</li>
              </ul>
            </li>
            <li><strong>Other Instruments (Sarangi, Vocal):</strong>
              <ul>
                <li><strong>Volume</strong>: Overall volume of the instrument synthesis.</li>
              </ul>
            </li>
          </ul>
        </li>
        <li><strong>Sonify Checkbox:</strong> Enable or mute the instrument's synthesis.</li>
      </ul>
      <p><strong>Global Controls:</strong></p>
      <ul>
        <li><strong>Mixed Synth Gain:</strong>
          <ul>
            <li>Appears if multiple instruments are present.</li>
            <li>Adjusts the combined volume of all instrument synths.</li>
          </ul>
        </li>
        <li><strong>Recording Gain:</strong>
          <ul>
            <li>Adjusts the playback volume of the associated recording.</li>
          </ul>
        </li>
        <li><strong>Pitch Shift</strong> (macOS only):
          <ul>
            <li>Enable the <strong>"Pitch Shift"</strong> checkbox.</li>
            <li>Use the slider to shift pitch from -200 to +200 cents.</li>
          </ul>
        </li>
      </ul>

      <h3 id="tuning-controls">8.2 Tuning Controls</h3>
      <p><strong>Icon</strong>: Tuning fork.</p>
      <p><strong>Accessing Tuning Controls:</strong></p>
      <ul>
        <li>Click on the <strong>Tuning Controls</strong> icon.</li>
      </ul>
      <p><strong>Adjusting Tuning Settings:</strong></p>
      <ul>
        <li><strong>"Sa" Frequency:</strong>
          <ul>
            <li>Set the tonic pitch frequency in Hz using the number box or slider.</li>
            <li><strong>Gain Slider:</strong> Turn up to hear a sine wave of the pitch for tuning.</li>
          </ul>
        </li>
        <li><strong>Other Sargam Pitches:</strong>
          <ul>
            <li>For each pitch, adjust:
              <ul>
                <li><strong>Gain:</strong> Increase volume to compare with the recording.</li>
                <li><strong>Tune:</strong> Shift tuning up or down by up to ±50 cents.</li>
              </ul>
            </li>
          </ul>
        </li>
        <li><strong>Reset Button:</strong>
          <ul>
            <li>Click <strong>"Reset"</strong> to return all pitches to equal temperament (0 cents).</li>
          </ul>
        </li>
      </ul>

      <h3 id="download-data">8.3 Download Data</h3>
      <p><strong>Icon</strong>: Downward arrow pointing to a tray.</p>
      <p><strong>Downloading Transcription Data:</strong></p>
      <ul>
        <li>Click on the <strong>Download Data</strong> icon.</li>
        <li><strong>Options:</strong>
          <ul>
            <li><strong>JSON File:</strong> Download the transcription in IDTAP's native format.</li>
            <li><strong>XLSX File:</strong> Download as an Excel spreadsheet.</li>
          </ul>
        </li>
      </ul>

      <h3 id="meter-controls">8.4 Meter Controls</h3>
      <p><strong>Icon</strong>: Comb-like vertical lines.</p>
      <p><strong>Accessing Meter Controls:</strong></p>
      <ul>
        <li>Click on the <strong>Meter Controls</strong> icon.</li>
      </ul>
      <p><strong>Functionality:</strong></p>
      <ul>
        <li>Same as described in the <a href="#meter-functionality">Meter Functionality</a> section.</li>
      </ul>

      <h3 id="label-editor">8.5 Label Editor</h3>
      <p><strong>Icon</strong>: Set of tags.</p>
      <p><strong>Accessing the Label Editor:</strong></p>
      <ul>
        <li>Click on the <strong>Label Editor</strong> icon.</li>
      </ul>
      <p><strong>Labeling Sections and Phrases:</strong></p>
      <ul>
        <li><strong>Select Track:</strong>
          <ul>
            <li>Ensure you're editing the correct instrument track (displayed at the top of the panel).</li>
          </ul>
        </li>
        <li><strong>Section Labels:</strong>
          <ul>
            <li><strong>Options:</strong>
              <ul>
                <li><em>Pre-Chiz Alap</em></li>
                <li><em>Alap</em></li>
                <li><em>Composition</em></li>
                <li><em>Improvisation</em></li>
                <li><em>Other</em></li>
                <li><em>None</em></li>
              </ul>
            </li>
            <li><strong>Additional Details:</strong>
              <ul>
                <li>Depending on the selection, further options may appear (e.g., specific "Alap Section" or "Tala").</li>
              </ul>
            </li>
          </ul>
        </li>
        <li><strong>Phrase Labels:</strong>
          <ul>
            <li>For each phrase, select applicable descriptors under:
              <ul>
                <li><strong>Phrase Type</strong></li>
                <li><strong>Elaboration Type</strong></li>
                <li><strong>Articulation Type</strong></li>
                <li><strong>Incidental</strong></li>
              </ul>
            </li>
            <li>Multiple checkboxes can be selected for each category.</li>
          </ul>
        </li>
      </ul>
      <p><strong>Navigating with Labels:</strong></p>
      <ul>
        <li><strong>Double-Click:</strong>
          <ul>
            <li>On a phrase or section box to jump to that part of the transcription.</li>
          </ul>
        </li>
        <li><strong>Right-Click on Graph:</strong>
          <ul>
            <li>Options to <em>"Edit Section X labels"</em> or <em>"Edit Phrase Y labels"</em> appear for quick access.</li>
          </ul>
        </li>
      </ul>

      <h3 id="transcription-and-graphic-controls">8.6 Transcription and Graphic Controls</h3>
      <p><strong>Icon</strong>: Bar graph with control knobs.</p>
      <p><strong>Accessing Transcription and Graphic Controls:</strong></p>
      <ul>
        <li>Click on the <strong>Transcription and Graphic Controls</strong> icon.</li>
      </ul>
      <p><strong>Adjusting Visual Settings:</strong></p>
      <h4>Spectrogram</h4>
      <ul>
        <li><strong>Colormap Selection:</strong>
          <ul>
            <li>Click to choose a color scheme for the spectrogram.</li>
          </ul>
        </li>
        <li><strong>Intensity Power:</strong>
          <ul>
            <li>Adjust the contrast between strong and weak areas using the number box.</li>
            <li>Click <strong>"Update"</strong> to apply changes.</li>
          </ul>
        </li>
      </ul>
      <h4>"Sa" Frequency</h4>
      <ul>
        <li><strong>Frequency Slider:</strong>
          <ul>
            <li>Set the "Sa" frequency in Hz.</li>
          </ul>
        </li>
        <li><strong>Gain Slider:</strong>
          <ul>
            <li>Turn up to hear a sine wave for tuning purposes.</li>
          </ul>
        </li>
        <li><strong>Max/Min Pitch:</strong>
          <ul>
            <li>Adjust the upper and lower pitch display limits.</li>
          </ul>
        </li>
      </ul>
      <h4>Colors</h4>
      <ul>
        <li><strong>Customize Colors</strong> for various elements:
          <ul>
            <li>Background</li>
            <li>Axes</li>
            <li>Melograph</li>
            <li>Sargam Lines</li>
            <li>Meter</li>
            <li>Selected Meter</li>
            <li>Playhead</li>
          </ul>
        </li>
      </ul>
      <h4>Tracks</h4>
      <ul>
        <li><strong>Display and Sonify:</strong>
          <ul>
            <li>Toggle visibility and sound for each track.</li>
          </ul>
        </li>
        <li><strong>Color Selection:</strong>
          <ul>
            <li><strong>Traj:</strong> Color for trajectories.</li>
            <li><strong>Sel Traj:</strong> Color when trajectories are selected.</li>
          </ul>
        </li>
      </ul>
      <h4>Playback Animation</h4>
      <ul>
        <li><strong>Playhead Style:</strong>
          <ul>
            <li><em>Animated:</em> Smooth movement (may cause eye strain for sensitive users).</li>
            <li><em>Block:</em> Playhead moves in blocks to reduce motion.</li>
            <li><em>None:</em> No playhead motion during playback.</li>
          </ul>
        </li>
        <li><strong>Highlight Trajectories:</strong>
          <ul>
            <li>Enable to highlight currently playing trajectories with the "Sel Traj" color.</li>
          </ul>
        </li>
      </ul>
      <h4>Display Settings</h4>
      <ul>
        <li><strong>Load Settings:</strong>
          <ul>
            <li>Choose from saved display settings using the dropdown menu.</li>
          </ul>
        </li>
        <li><strong>Save Settings:</strong>
          <ul>
            <li><strong>Update Current:</strong> Save changes to the current setting.</li>
            <li><strong>New Save:</strong> Save current settings under a new name.</li>
            <li><strong>Set Default:</strong> Make a setting the default when loading the editor.</li>
            <li><strong>Delete:</strong> Remove a saved setting.</li>
          </ul>
        </li>
      </ul>

      <hr>

      <h2 id="keyboard-shortcuts-and-tips">9. Keyboard Shortcuts and Tips</h2>
      <ul>
        <li><strong>Mode Selection:</strong>
          <ul>
            <li><strong>T</strong>: Trajectory Mode</li>
            <li><strong>S</strong>: Series Mode</li>
            <li><strong>P</strong>: Phrase Division Mode</li>
            <li><strong>M</strong>: Meter Mode</li>
            <li><strong>C</strong>: Chikari Mode (Sitar only)</li>
            <li><strong>R</strong>: Region Mode</li>
          </ul>
        </li>
        <li><strong>Graph Navigation:</strong>
          <ul>
            <li><strong>Left/Right Arrow Keys:</strong> Scroll horizontally.</li>
            <li><strong>Up/Down Arrow Keys:</strong> Scroll vertically.</li>
            <li><strong>[ and ]:</strong> Jump left or right by half the viewing area.</li>
            <li><strong>Tab:</strong> Move to the next phrase division.</li>
            <li><strong>Shift + Tab:</strong> Move to the previous phrase division.</li>
          </ul>
        </li>
        <li><strong>Playback Controls:</strong>
          <ul>
            <li><strong>Spacebar:</strong> Play/Pause.</li>
            <li><strong>Double-Click on Graph:</strong> Move playhead to clicked position.</li>
          </ul>
        </li>
        <li><strong>Selection and Editing:</strong>
          <ul>
            <li><strong>Shift + Click:</strong> Select multiple trajectories.</li>
            <li><strong>Shift + Click and Drag:</strong> Draw a selection box.</li>
            <li><strong>Option + Click on Dot + Arrow Keys:</strong> Nudge alignment dots.</li>
            <li><strong>Escape:</strong> Exit current mode or deselect elements.</li>
          </ul>
        </li>
        <li><strong>Deleting Elements:</strong>
          <ul>
            <li><strong>Delete or Backspace:</strong> Remove selected trajectories, divisions, meters, or chikari strokes.</li>
          </ul>
        </li>
        <li><strong>Trajectory Type Shortcuts:</strong>
          <ul>
            <li><strong>0:</strong> Fixed</li>
            <li><strong>1:</strong> Bend: Simple</li>
            <li><strong>2:</strong> Bend: Sloped Start</li>
            <li><strong>3:</strong> Bend: Sloped End</li>
            <li><strong>4:</strong> Bend: Ladle</li>
            <li><strong>5:</strong> Bend: Reverse Ladle</li>
            <li><strong>6:</strong> Bend: Simple Multiple</li>
            <li><strong>7:</strong> Krintin (Sitar only)</li>
            <li><strong>8:</strong> Krintin Slide (Sitar only)</li>
            <li><strong>9:</strong> Krintin Slide Hammer (Sitar only)</li>
            <li><strong>a:</strong> Dense Krintin Slide Hammer (Sitar only)</li>
            <li><strong>b:</strong> Slide (Sitar only)</li>
            <li><strong>e:</strong> Vibrato</li>
          </ul>
        </li>
      </ul>

      <hr>

      <h2 id="support-and-feedback">10. Support and Feedback</h2>
      <p>
        If you have any questions, need further
        assistance, or wish to provide feedback, please write to JBMYERS [at]
        UCSC [dot] EDU, or add an issue to our 
        <a href='https://github.com/jon-myers/idtp'>GitHub repository</a>. 
      </p>




    </div>

<!-- End of IDTAP Editor Instructions -->
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
