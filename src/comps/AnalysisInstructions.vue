<template>
    <div id="idtap-analysis-instructions" :style='mainStyle'>
      <h1>IDTAP Analysis Suite User Guide</h1>
      <p><em>Complete instructions for musical analysis and data visualization in IDTAP</em></p>
      <hr>

      <h2>Table of Contents</h2>
      <ol>
        <li><a href="#analysis-overview">Analysis Suite Overview</a></li>
        <li>
          <a href="#analysis-types">Analysis Types</a>
          <ol type="a">
            <li><a href="#pitch-prevalence">Pitch Prevalence</a></li>
            <li><a href="#pitch-patterns">Pitch Patterns</a></li>
            <li><a href="#query-display">Query Display</a></li>
            <li><a href="#assemblage-display">Assemblage Display</a></li>
            <li><a href="#excel-datasets">Excel Datasets</a></li>
          </ol>
        </li>
        <li><a href="#support">Support and Feedback</a></li>
      </ol>

      <hr>

      <h2 id="analysis-overview">1. Analysis Suite Overview</h2>
      <p>
        The IDTAP Analysis Suite provides tools for examining transcriptions created in the IDTAP Editor or via the Python API client.
        At the top of the interface, a green menu row contains buttons to select between five different analysis types,
        along with an instrument track selector for multi-track transcriptions. The interface below this row changes
        dynamically based on your selected analysis type, providing specialized controls and visualizations for each mode.
      </p>

      <p><strong>Five Analysis Types:</strong></p>
      <ul>
        <li><strong>Pitch Prevalence</strong>: Statistical analysis of pitch usage and occurrence distribution</li>
        <li><strong>Pitch Patterns</strong>: Count and display occurrences of pitch sequences</li>
        <li><strong>Query Display</strong>: Advanced search and pattern matching across transcriptions</li>
        <li><strong>Assemblage Display</strong>: Phrase organization and thematic grouping with audio-visual exploration</li>
        <li><strong>Excel Datasets</strong>: Export structured data for external analysis</li>
      </ul>

      <p>
        <strong>Key Concept</strong>: The Analysis Suite works with transcription data created in the IDTAP Editor,
        analyzing "trajectories" - formally specified archetypal paths between pitches that represent the
        fundamental units of musical structure in IDTAP. These trajectories provide a middle-level representation
        of melodic motion, enabling sophisticated statistical analysis, pattern recognition, and data visualization
        techniques specifically designed for oral melodic traditions and Indian classical music research.
      </p>

      <hr>

      <h2 id="analysis-types">2. Analysis Types</h2>

      <h3 id="pitch-prevalence">2.1 Pitch Prevalence</h3>
      <p>
        Pitch Prevalence analysis shows how much time is spent on each pitch within a transcription.
        Use the controls below the green menu bar to configure the analysis.
      </p>

      <p><strong>Pitch Representation Controls:</strong></p>
      <ul>
        <li><strong>Fixed Pitch</strong>: Counts time spent on sustained pitch values, excluding transitions between pitches</li>
        <li><strong>Pitch Onsets</strong>: Counts all time from when a pitch begins until the next pitch begins as belonging to the first pitch (includes transitions and ornaments)</li>
        <li><strong>Fade Time (when Pitch Onsets selected)</strong>: Duration in seconds of silence after a pitch that still counts as belonging to that pitch (allows for various approaches to the psychological question of how long a pitch "sounds" in the mind in the absence of a new pitch)</li>
      </ul>

      <p><strong>Segmentation Controls:</strong></p>
      <ul>
        <li><strong>Section</strong>: Divide analysis by major structural divisions in the transcription</li>
        <li><strong>Phrase</strong>: Divide analysis by individual phrases</li>
        <li><strong>Duration</strong>: Divide analysis by time intervals</li>
        <li><strong>Duration (s) (when Duration selected)</strong>: Set the length in seconds for each time segment</li>
      </ul>

      <p><strong>Display Options:</strong></p>
      <ul>
        <li><strong>Pitch Chroma</strong>: Group pitches by pitch class (ignoring octave differences)</li>
        <li><strong>Condensed</strong>: Remove empty space for pitches not present in the transcription</li>
        <li><strong>Heatmap</strong>: Show relative prevalence with grayscale gradient instead of binary highlighting</li>
      </ul>

      <p><strong>Section/Phrase Type Filtering (when Section or Phrase segmentation selected):</strong></p>
      <ul>
        <li><strong>Section Type checkboxes</strong>: Select which types of sections to include in analysis</li>
        <li><strong>Phrase Type radio buttons</strong>: Choose to include or exclude specific phrase types</li>
      </ul>

      <p><strong>Generating Results:</strong> After configuring your settings, click the "Generate Visualization" button to create the pitch prevalence chart with your current parameters.</p>

      <h3 id="pitch-patterns">2.2 Pitch Patterns</h3>
      <p>
        Pitch Patterns analysis counts how many times each unique pitch sequence appears in a given segment.
        Use the controls below the green menu bar to configure the analysis.
      </p>

      <p><strong>Segmentation Controls:</strong></p>
      <ul>
        <li><strong>Transcription</strong>: Analyze patterns across the entire transcription as one unit</li>
        <li><strong>Section</strong>: Divide analysis by major structural divisions in the transcription</li>
        <li><strong>Duration</strong>: Divide analysis by time intervals</li>
        <li><strong>Duration (s) (when Duration selected)</strong>: Set the length in seconds for each time segment</li>
      </ul>

      <p><strong>Display Options:</strong></p>
      <ul>
        <li><strong>Pitch Number/Sargam radio buttons</strong>: Choose whether to display pitches as numbers or sargam notation</li>
        <li><strong>Chroma checkbox</strong>: Group pitches by pitch class (ignoring octave differences)</li>
      </ul>

      <p><strong>Target Pitch Selection:</strong></p>
      <ul>
        <li><strong>Target checkbox</strong>: Check this box to enable target pitch filtering</li>
        <li><strong>Target Pitch dropdown</strong>: Once the checkbox is selected, use this dropdown to choose a specific pitch. Patterns will be filtered to show only those that end on the selected target pitch</li>
      </ul>

      <p><strong>Fade Time Controls:</strong></p>
      <ul>
        <li><strong>Fade Time (s)</strong>: Duration in seconds of silence after a pitch that still counts as belonging to that pitch (affects pattern continuity across gaps)</li>
      </ul>

      <p><strong>Pattern Size Controls:</strong></p>
      <ul>
        <li><strong>Pattern Size checkboxes</strong>: Select which lengths of pitch sequences to analyze (2, 3, 4, 5, 6, 7, 8, 9, or 10 notes)</li>
      </ul>

      <p><strong>Minimum Size and Plot Controls:</strong></p>
      <ul>
        <li><strong>Minimum Size</strong>: Set the minimum number of occurrences required to display a pattern</li>
        <li><strong>Plot checkbox</strong>: When checked, displays the contour of every pitch pattern in the visualization</li>
      </ul>

      <p><strong>Generating Results:</strong> After configuring your settings, click the "Generate Visualization" button to create the pitch patterns display with your current parameters.</p>

      <h3 id="query-display">2.3 Query Display</h3>
      <p>
        Query Display enables creation of multi-part queries to filter transcriptions, displaying only
        those segments that match your search criteria. Use the controls below the green menu bar to configure your search.
      </p>

      <p><strong>Segmentation Controls:</strong></p>
      <ul>
        <li><strong>Segmentation dropdown</strong>: Choose how to organize search results:
          <ul>
            <li><strong>Phrase</strong>: Search within individual phrases</li>
            <li><strong>Group</strong>: Search within trajectory groups</li>
            <li><strong>Trajectory Sequence</strong>: Search within sequences of trajectories (skipping over silences)</li>
            <li><strong>Connected Trajectories</strong>: Search within contiguous trajectory sequences (silences marking divisions)</li>
          </ul>
        </li>
        <li><strong>Sequence Size</strong>: When "Trajectory Sequence" is selected, set the number of trajectories to include in each sequence</li>
      </ul>

      <p><strong>Query Configuration:</strong></p>
      <ul>
        <li><strong>Queries number input</strong>: Set how many individual search criteria to use (1 or more)</li>
        <li><strong>Every/Some radio buttons</strong>: Choose whether segments must match all queries ("Every") or just at least one query ("Some")</li>
        <li><strong>Min Dur and Max Dur</strong>: Set minimum and maximum duration limits (in seconds) for matching segments (used primarily to filter out long silent phrases at the ends of unfinished transcriptions)</li>
      </ul>

      <p><strong>Individual Query Controls:</strong></p>
      <p>For each query number you specify, a separate query box appears with these options:</p>
      <ul>
        <li><strong>Category dropdown</strong>: Choose what type of musical element to search for:
          <ul>
            <li><strong>Pitch</strong>: Search for a specific pitch and octave</li>
            <li><strong>Strict Pitch Sequence</strong>: Search for an exact sequence of pitches in order</li>
            <li><strong>Loose Pitch Sequence</strong>: Search for pitches in the specified order, but allowing other pitches to be interspersed between them</li>
            <li><strong>Trajectory</strong>: Search for a specific trajectory by type</li>
            <li><strong>Strict Trajectory Sequence</strong>: Search for an exact sequence of trajectories in order</li>
            <li><strong>Loose Traj Sequence</strong>: Search for trajectories in the specified order, but allowing other trajectories to be interspersed between them</li>
          </ul>
          <p><em>The following options are only available when segmenting by Phrase or Group:</em></p>
          <ul>
            <li><strong>Section Type</strong>: Search for specific section classifications</li>
            <li><strong>Alap Section</strong>: Search for specific alap section types</li>
            <li><strong>Composition Type</strong>: Search for specific composition types</li>
            <li><strong>Comp.-section/Tempo</strong>: Search for specific composition section or tempo markings</li>
            <li><strong>Tala</strong>: Search for specific tala (rhythmic cycle) types</li>
            <li><strong>Phrase Type</strong>: Search for specific phrase classifications</li>
            <li><strong>Elaboration Type</strong>: Search for specific elaboration techniques</li>
            <li><strong>Incidental</strong>: Search for incidental musical elements</li>
            <li><strong>Articulation Type</strong>: Search for specific vocal or instrumental articulation techniques</li>
          </ul>
        </li>
        <li><strong>Pitch and Octave selectors</strong>: When "Pitch" category is selected, choose the specific pitch name and octave number</li>
        <li><strong>Pitch sequence controls</strong>: When pitch sequence categories are selected, specify the number of pitches and then select each pitch and octave in the sequence</li>
        <li><strong>Trajectory sequence controls</strong>: When trajectory sequence categories are selected, specify the number of trajectories and select each trajectory ID</li>
      </ul>

      <p><strong>Display and Export Controls:</strong></p>
      <ul>
        <li><strong>Common Pitch Range checkbox</strong>: When checked, displays all segments using the same pitch range for comparison</li>
        <li><strong>Search button</strong>: Execute the query with current settings</li>
        <li><strong>Save Query and Load Query buttons</strong>: Save your current query configuration or load a previously saved query</li>
        <li><strong>Download Results button</strong>: Export the search results (only available after running a search)</li>
      </ul>


      <h3 id="assemblage-display">2.4 Assemblage Display</h3>
      <p>
        Assemblage Display provides audio-visual exploration of phrase organization and thematic grouping
        created in the Editor's Assemblage Controls system. Use the controls below the green menu bar to explore assemblages.
      </p>

      <p><strong>Assemblage Selection:</strong></p>
      <ul>
        <li><strong>Assemblage dropdown</strong>: Select which assemblage to view from those created in the Editor</li>
        <li><strong>No assemblages message</strong>: If no assemblages exist, displays "There are no assemblages assigned to this transcription"</li>
      </ul>

      <p><strong>Strand Display:</strong></p>
      <p>Each assemblage contains one or more strands (thematic groupings). For each strand:</p>
      <ul>
        <li><strong>Strand label</strong>: Shows the name of each strand within the assemblage</li>
        <li><strong>Play Strand button</strong>: Click to play audio for all phrases in that strand sequentially</li>
        <li><strong>Stop Strand button</strong>: When audio is playing, click to stop playback</li>
      </ul>

      <p><strong>Phrase Visualization:</strong></p>
      <ul>
        <li><strong>Grid layout</strong>: Phrases are arranged in columns by strand, with each phrase displayed as a miniature spectrogram</li>
        <li><strong>Phrase timing</strong>: Phrases are positioned vertically according to their temporal position in the transcription</li>
        <li><strong>Visual continuity</strong>: Empty spaces show where phrases from other strands occur, maintaining temporal alignment</li>
        <li><strong>Pitch range synchronization</strong>: All phrase displays use a common pitch range for easy comparison</li>
        <li><strong>Individual phrase playback</strong>: Click on any phrase to play its audio individually, without playing the entire strand</li>
      </ul>

      <p><strong>Audio Integration:</strong></p>
      <ul>
        <li><strong>Automatic audio loading</strong>: Audio files are loaded automatically when assemblages are available</li>
        <li><strong>Loading indicator</strong>: Shows "Loading audio..." when audio files are being prepared</li>
        <li><strong>Sequential playback</strong>: Strand playback presents phrases in chronological order</li>
      </ul>

      <p><strong>Prerequisites:</strong></p>
      <ul>
        <li><strong>Editor assemblages</strong>: Assemblages must be created in the Editor's Assemblage Controls before they appear in this analysis</li>
        <li><strong>Audio files</strong>: Associated audio must be available for playback features to function</li>
      </ul>

      <h3 id="excel-datasets">2.5 Excel Datasets</h3>
      <p>
        Excel Datasets generates structured spreadsheet exports of transcription data for external analysis and research.
        Use the controls below the green menu bar to configure your data export.
      </p>

      <p><strong>Pitch Representation Options:</strong></p>
      <ul>
        <li><strong>Pitch Representation dropdown</strong>: Choose how pitches are encoded in the dataset:
          <ul>
            <li><strong>Chroma</strong>: Pitch class without octave information (0-11)</li>
            <li><strong>PitchNumber</strong>: Absolute pitch number including octave</li>
            <li><strong>SargamLetter</strong>: Indian sargam notation without octave (Sa, Re, Ga, etc.)</li>
            <li><strong>OctavedSargamLetter</strong>: Sargam notation with octave indicators</li>
            <li><strong>ScaleDegree</strong>: Scale degree numbers without octave (1-7)</li>
            <li><strong>OctavedScaleDegree</strong>: Scale degree numbers with octave information</li>
          </ul>
        </li>
      </ul>

      <p><strong>Segmentation Options:</strong></p>
      <ul>
        <li><strong>Segmentation dropdown</strong>: Choose how to divide the transcription into segments:
          <ul>
            <li><strong>UserDefined</strong>: Use manually created phrase and section boundaries from the Editor</li>
            <li><strong>Silence</strong>: Automatically segment at silence boundaries</li>
            <li><strong>Chikari</strong>: Segment based on chikari (drone) string activity</li>
            <li><strong>MelodicDiscontinuity</strong>: Segment at points of melodic discontinuity</li>
          </ul>
        </li>
      </ul>

      <p><strong>End Sequence Length:</strong></p>
      <ul>
        <li><strong>End Sequence Length dropdown</strong>: Select the number of final pitches to include as a sequence ending pattern (1-6)</li>
        <li>This creates columns showing the last N pitches of each segment, useful for analyzing cadence patterns</li>
      </ul>

      <p><strong>Export Control:</strong></p>
      <ul>
        <li><strong>Download Dataset button</strong>: Click to generate and download the Excel file</li>
        <li>The file will be named "DN_Extract.xlsx" and will download automatically</li>
      </ul>

      <p><strong>Generated Data Structure:</strong></p>
      <ul>
        <li><strong>Segment information</strong>: Start time, end time, and duration for each segment</li>
        <li><strong>Pitch sequences</strong>: Complete pitch content of each segment in your chosen representation</li>
        <li><strong>End sequences</strong>: The final N pitches of each segment (based on your End Sequence Length setting)</li>
        <li><strong>Metadata</strong>: Track information and transcription details</li>
        <li><strong>Timing data</strong>: Precise timestamps for all events</li>
      </ul>

      <p><strong>Usage Notes:</strong></p>
      <ul>
        <li>The export respects your current instrument track selection from the green menu bar</li>
        <li>All pitch data uses a duration threshold of 0.1 seconds (pitches shorter than this are excluded)</li>
      </ul>


      <hr>

      <h2 id="support">3. Support and Feedback</h2>
      <p>
        If you have questions, need assistance, or wish to provide feedback about the IDTAP Analysis Suite:
      </p>
      <ul>
        <li><strong>Email</strong>: JBMYERS [at] UCSC [dot] EDU</li>
        <li><strong>GitHub Issues</strong>: <a href="https://github.com/UCSC-IDTAP/IDTAP/issues">Report bugs and feature requests</a></li>
        <li><strong>Documentation</strong>: <a href="https://github.com/UCSC-IDTAP/IDTAP">Visit the project repository</a> for additional resources</li>
        <li><strong>ISMIR Paper</strong>: <a href="/papers/ismir-paper.pdf" target="_blank">Read our research paper</a></li>
        <li><strong>NEH Whitepaper</strong>: <a href="/papers/neh-whitepaper.pdf" target="_blank">Read our NEH whitepaper</a></li>
      </ul>

      <p>
        <strong>When reporting analysis-related issues, please include:</strong>
      </p>
      <ul>
        <li>Browser type and version</li>
        <li>Operating system</li>
        <li>Analysis type being used</li>
        <li>Transcription details (if relevant)</li>
        <li>Segmentation and filter settings</li>
        <li>Steps to reproduce the issue</li>
        <li>Expected vs. actual behavior</li>
      </ul>

      <p><em>
        This user guide covers the complete IDTAP Analysis Suite functionality as of September 2025.
        The Analysis Suite continues to evolve with new analytical tools and visualization capabilities
        for advanced musical research and computational musicology.
      </em></p>

    </div>
</template>
<script lang='ts'>
import { defineComponent, PropType, computed } from 'vue';
export default defineComponent({
  name: 'AnalysisInstructions',
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
#idtap-analysis-instructions {
  background-color: #202621; /* Dark green background */
  color: #ffffff; /* White text */
  max-width: 800px;
  margin: 0 auto; /* Center the content horizontally */
  padding: 20px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
  line-height: 1.6;
  height: calc(100vh - var(--nav-height)); /* Set height to viewport height minus nav height */
  overflow-y: auto; /* Add vertical scroll if content exceeds the div height */
}

#idtap-analysis-instructions h1,
#idtap-analysis-instructions h2,
#idtap-analysis-instructions h3,
#idtap-analysis-instructions h4 {
  color: #ffebcd; /* Lighter color for headings */
  margin-top: 1.5em;
  text-align: left; /* Ensure headings are left-aligned */
}

#idtap-analysis-instructions h1 {
  font-size: 2em;
}

#idtap-analysis-instructions h2 {
  font-size: 1.75em;
}

#idtap-analysis-instructions h3 {
  font-size: 1.5em;
}

#idtap-analysis-instructions h4 {
  font-size: 1.25em;
}

#idtap-analysis-instructions p {
  margin-bottom: 1em;
  text-align: left; /* Ensure paragraphs are left-aligned */
}

#idtap-analysis-instructions ul,
#idtap-analysis-instructions ol {
  margin-left: 1.5em;
  margin-bottom: 1em;
  text-align: left; /* Ensure lists are left-aligned */
}

#idtap-analysis-instructions a {
  color: #add8e6; /* Light blue links */
  text-decoration: none;
}

#idtap-analysis-instructions a:hover {
  text-decoration: underline;
}

#idtap-analysis-instructions hr {
  border: none;
  height: 1px;
  background-color: #ccc;
  margin: 2em 0;
}

#idtap-analysis-instructions strong {
  color: #ffebcd;
}

#idtap-analysis-instructions em {
  font-style: italic;
}

#idtap-analysis-instructions code {
  background-color: #37474f;
  padding: 2px 4px;
  border-radius: 4px;
  color: #e0e0e0;
  font-family: 'Courier New', monospace;
  text-align: left; /* Ensure code blocks are left-aligned */
}

#idtap-analysis-instructions pre {
  background-color: #37474f;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  color: #e0e0e0;
  font-family: 'Courier New', monospace;
  text-align: left; /* Ensure preformatted text is left-aligned */
}

#idtap-analysis-instructions blockquote {
  border-left: 4px solid #ffebcd;
  margin-left: 0;
  padding-left: 1em;
  color: #dcdcdc;
  text-align: left; /* Ensure blockquotes are left-aligned */
}

@media (max-width: 600px) {
  #idtap-analysis-instructions {
    padding: 15px;
  }

  #idtap-analysis-instructions h1 {
    font-size: 1.75em;
  }

  #idtap-analysis-instructions h2 {
    font-size: 1.5em;
  }

  #idtap-analysis-instructions h3 {
    font-size: 1.25em;
  }

  #idtap-analysis-instructions h4 {
    font-size: 1.1em;
  }
}
</style>
