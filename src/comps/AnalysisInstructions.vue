<template>
    <div id="idtap-analysis-instructions" :style='mainStyle'>
      <h1>IDTAP Analysis Suite User Guide</h1>
      <p><em>Complete instructions for musical analysis and data visualization in IDTAP</em></p>
      <hr>

      <h2>Table of Contents</h2>
      <ol>
        <li>
          <a href="#getting-started">Getting Started</a>
          <ol type="a">
            <li><a href="#analysis-overview">Analysis Suite Overview</a></li>
            <li><a href="#basic-navigation">Basic Navigation</a></li>
          </ol>
        </li>
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
        <li>
          <a href="#data-controls">Data and Segmentation Controls</a>
          <ol type="a">
            <li><a href="#transcription-selection">Transcription Selection</a></li>
            <li><a href="#segmentation-options">Segmentation Options</a></li>
            <li><a href="#pitch-representation">Pitch Representation</a></li>
            <li><a href="#filtering-controls">Filtering Controls</a></li>
          </ol>
        </li>
        <li>
          <a href="#analysis-workflows">Analysis Workflows</a>
          <ol type="a">
            <li><a href="#comparative-analysis">Comparative Analysis</a></li>
            <li><a href="#pattern-discovery">Pattern Discovery</a></li>
            <li><a href="#assemblage-organization">Assemblage Organization</a></li>
            <li><a href="#data-export">Data Export</a></li>
          </ol>
        </li>
        <li><a href="#support">Support and Feedback</a></li>
      </ol>

      <hr>

      <h2 id="getting-started">1. Getting Started</h2>

      <h3 id="analysis-overview">1.1 Analysis Suite Overview</h3>
      <p>
        The IDTAP Analysis Suite provides sophisticated tools for examining musical transcriptions created in the IDTAP Editor.
        The analysis interface consists of several key areas:
      </p>
      <ul>
        <li><strong>Analysis Type Selector</strong>: Choose from five analysis modes for different research questions</li>
        <li><strong>Transcription Controls</strong>: Select and filter transcriptions for analysis</li>
        <li><strong>Segmentation Panel</strong>: Control how musical data is divided and represented</li>
        <li><strong>Main Display Area</strong>: Interactive visualizations and data displays</li>
        <li><strong>Filter Controls</strong>: Refine datasets and focus analysis scope</li>
      </ul>

      <p><strong>Five Analysis Types:</strong></p>
      <ul>
        <li><strong>Pitch Prevalence</strong>: Statistical analysis of pitch usage and frequency distribution</li>
        <li><strong>Pitch Patterns</strong>: Visualization of pitch sequences and melodic patterns</li>
        <li><strong>Query Display</strong>: Advanced search and pattern matching across transcriptions</li>
        <li><strong>Assemblage Display</strong>: Phrase organization and thematic grouping visualization</li>
        <li><strong>Excel Datasets</strong>: Export structured data for external analysis</li>
      </ul>

      <p>
        <strong>Key Concept</strong>: The Analysis Suite works with transcription data created in the IDTAP Editor,
        providing multiple perspectives on musical content through statistical analysis, pattern recognition,
        and data visualization techniques specifically designed for Indian classical music research.
      </p>

      <h3 id="basic-navigation">1.2 Basic Navigation</h3>
      <p><strong>Essential Analysis Controls:</strong></p>
      <ul>
        <li><strong>Analysis Type Selection</strong>:
          <ul>
            <li><strong>Dropdown Menu</strong>: Select from available analysis types in the upper panel</li>
            <li><strong>Dynamic Interface</strong>: Controls and displays change based on selected analysis type</li>
          </ul>
        </li>
        <li><strong>Transcription Management</strong>:
          <ul>
            <li><strong>Transcription Selector</strong>: Choose from available transcriptions you have access to</li>
            <li><strong>Permission-based Access</strong>: Only transcriptions you can view will appear in the list</li>
          </ul>
        </li>
        <li><strong>Data Interaction</strong>:
          <ul>
            <li><strong>Interactive Visualizations</strong>: Click, hover, and explore data displays</li>
            <li><strong>Zoom and Pan</strong>: Navigate through large datasets and detailed views</li>
            <li><strong>Selection Tools</strong>: Highlight and focus specific data points or ranges</li>
          </ul>
        </li>
      </ul>

      <hr>

      <h2 id="analysis-types">2. Analysis Types</h2>

      <h3 id="pitch-prevalence">2.1 Pitch Prevalence</h3>
      <p>
        Pitch Prevalence analysis provides statistical insights into pitch usage within transcriptions,
        revealing the frequency distribution and relative importance of different pitches in musical performances.
      </p>

      <p><strong>Core Features:</strong></p>
      <ul>
        <li><strong>Pitch Distribution Charts</strong>: Visual representation of pitch frequency using D3.js visualizations</li>
        <li><strong>Statistical Measures</strong>: Quantitative analysis of pitch usage patterns</li>
        <li><strong>Segmentation-based Analysis</strong>: Break down pitch usage by sections, phrases, or duration</li>
        <li><strong>Comparative Views</strong>: Compare pitch distributions across different segments or transcriptions</li>
      </ul>

      <p><strong>Segmentation Options:</strong></p>
      <ul>
        <li><strong>By Section</strong>: Analyze pitch prevalence within major structural divisions</li>
        <li><strong>By Phrase</strong>: Examine pitch usage patterns at the phrase level</li>
        <li><strong>By Duration</strong>: Time-based segmentation for temporal analysis</li>
      </ul>

      <p><strong>Pitch Representation Modes:</strong></p>
      <ul>
        <li><strong>Fixed Pitch</strong>: Analyze exact pitch frequencies and their distributions</li>
        <li><strong>Pitch Onsets</strong>: Focus on the starting pitches of melodic gestures</li>
      </ul>

      <p><strong>Use Cases:</strong></p>
      <ul>
        <li>Identify the most frequently used pitches in a raga performance</li>
        <li>Compare pitch emphasis between different sections of a composition</li>
        <li>Analyze the relative importance of different sargam notes</li>
        <li>Study pitch distribution patterns across multiple performances</li>
      </ul>

      <h3 id="pitch-patterns">2.2 Pitch Patterns</h3>
      <p>
        Pitch Patterns analysis focuses on melodic sequences and recurring motifs within transcriptions,
        helping identify characteristic musical phrases and ornamental patterns.
      </p>

      <p><strong>Pattern Detection Features:</strong></p>
      <ul>
        <li><strong>Sequence Visualization</strong>: Graphical representation of pitch sequences over time</li>
        <li><strong>Pattern Recognition</strong>: Automated identification of recurring melodic motifs</li>
        <li><strong>Similarity Analysis</strong>: Compare and group similar melodic patterns</li>
        <li><strong>Interactive Exploration</strong>: Click and explore individual patterns in detail</li>
      </ul>

      <p><strong>Analysis Capabilities:</strong></p>
      <ul>
        <li><strong>Motif Discovery</strong>: Identify frequently occurring melodic fragments</li>
        <li><strong>Phrase Analysis</strong>: Examine complete musical phrases and their variations</li>
        <li><strong>Ornament Patterns</strong>: Focus on specific embellishment techniques and their usage</li>
        <li><strong>Temporal Patterns</strong>: Analyze how patterns evolve throughout a performance</li>
      </ul>

      <p><strong>Research Applications:</strong></p>
      <ul>
        <li>Study characteristic phrases of specific ragas or artists</li>
        <li>Identify personal stylistic signatures in performances</li>
        <li>Analyze the development and variation of melodic themes</li>
        <li>Compare ornamental patterns across different performers</li>
      </ul>

      <h3 id="query-display">2.3 Query Display</h3>
      <p>
        Query Display provides advanced search and pattern matching capabilities across transcriptions,
        allowing researchers to find specific musical content and analyze search results.
      </p>

      <p><strong>Query Interface:</strong></p>
      <ul>
        <li><strong>Search Controls</strong>: Define search parameters and criteria</li>
        <li><strong>Pattern Matching</strong>: Find specific pitch sequences or rhythmic patterns</li>
        <li><strong>Filter Options</strong>: Refine search results based on musical characteristics</li>
        <li><strong>Results Display</strong>: Interactive presentation of search matches</li>
      </ul>

      <p><strong>Search Capabilities:</strong></p>
      <ul>
        <li><strong>Pitch Sequence Search</strong>: Find occurrences of specific melodic patterns</li>
        <li><strong>Structural Element Search</strong>: Locate sections, phrases, or divisions</li>
        <li><strong>Temporal Queries</strong>: Search based on timing and duration criteria</li>
        <li><strong>Compound Queries</strong>: Combine multiple search criteria for complex analysis</li>
      </ul>

      <p><strong>Segmentation Integration:</strong></p>
      <ul>
        <li><strong>Section-based Queries</strong>: Search within specific structural divisions</li>
        <li><strong>Phrase-level Search</strong>: Focus queries on individual phrases</li>
        <li><strong>Duration-based Filtering</strong>: Limit searches to specific time ranges</li>
      </ul>

      <p><strong>Research Use Cases:</strong></p>
      <ul>
        <li>Find all occurrences of a specific melodic phrase across multiple transcriptions</li>
        <li>Search for characteristic ornamental patterns within a raga</li>
        <li>Identify structural similarities between different performances</li>
        <li>Locate specific technical elements or articulations</li>
      </ul>

      <h3 id="assemblage-display">2.4 Assemblage Display</h3>
      <p>
        Assemblage Display provides visualization and analysis tools for phrase organization and thematic grouping
        created in the Editor's Assemblage Controls system.
      </p>

      <p><strong>Assemblage Visualization:</strong></p>
      <ul>
        <li><strong>Phrase Organization</strong>: View how phrases are grouped into thematic collections</li>
        <li><strong>Strand Visualization</strong>: Display named sub-groups within assemblages</li>
        <li><strong>Interactive Navigation</strong>: Click to explore individual phrases and their context</li>
        <li><strong>Hierarchical Display</strong>: Show relationships between assemblages, strands, and phrases</li>
      </ul>

      <p><strong>Analysis Features:</strong></p>
      <ul>
        <li><strong>Thematic Analysis</strong>: Study how musical themes are organized and developed</li>
        <li><strong>Structural Overview</strong>: Understand the large-scale organization of musical content</li>
        <li><strong>Comparative Display</strong>: Compare assemblage structures across different transcriptions</li>
        <li><strong>Statistical Summary</strong>: Quantitative analysis of assemblage characteristics</li>
      </ul>

      <p><strong>Integration with Editor:</strong></p>
      <ul>
        <li><strong>Synchronized Data</strong>: Displays assemblages created in the Editor's Assemblage Controls</li>
        <li><strong>Live Updates</strong>: Reflects changes made to assemblage organization in the Editor</li>
        <li><strong>Cross-reference</strong>: Navigate between analysis view and editor for detailed examination</li>
      </ul>

      <p><strong>Research Applications:</strong></p>
      <ul>
        <li>Analyze how performers organize and develop musical themes</li>
        <li>Study the structural approach to raga elaboration</li>
        <li>Compare thematic development strategies across different artists</li>
        <li>Understand the hierarchical organization of complex performances</li>
      </ul>

      <h3 id="excel-datasets">2.5 Excel Datasets</h3>
      <p>
        Excel Datasets provides structured data export capabilities for external analysis,
        creating formatted spreadsheets from transcription data for use in statistical software or further research.
      </p>

      <p><strong>Export Options:</strong></p>
      <ul>
        <li><strong>Trajectory Data</strong>: Complete trajectory information with timing and pitch data</li>
        <li><strong>Structural Data</strong>: Section and phrase division information</li>
        <li><strong>Assemblage Data</strong>: Phrase organization and thematic grouping data</li>
        <li><strong>Summary Statistics</strong>: Calculated metrics and analytical measures</li>
      </ul>

      <p><strong>Format Specifications:</strong></p>
      <ul>
        <li><strong>Structured Columns</strong>: Organized data layout for easy analysis</li>
        <li><strong>Time-coded Data</strong>: Precise timing information for all musical events</li>
        <li><strong>Pitch Representation</strong>: Multiple pitch format options (Hz, cents, sargam)</li>
        <li><strong>Metadata Inclusion</strong>: Performer, raga, and recording information</li>
      </ul>

      <p><strong>Integration Capabilities:</strong></p>
      <ul>
        <li><strong>Statistical Software</strong>: Ready for import into R, SPSS, or other analysis tools</li>
        <li><strong>Database Import</strong>: Formatted for database management systems</li>
        <li><strong>Custom Processing</strong>: Structured for custom analysis scripts</li>
        <li><strong>Archival Storage</strong>: Standardized format for long-term data preservation</li>
      </ul>

      <p><strong>Research Workflow Integration:</strong></p>
      <ul>
        <li>Export transcription data for computational musicology research</li>
        <li>Create datasets for machine learning and pattern recognition studies</li>
        <li>Generate data for cross-corpus comparative analysis</li>
        <li>Prepare structured data for academic publication and data sharing</li>
      </ul>

      <hr>

      <h2 id="data-controls">3. Data and Segmentation Controls</h2>

      <h3 id="transcription-selection">3.1 Transcription Selection</h3>
      <p>
        The transcription selection system provides access to available transcriptions based on your permissions
        and enables filtering for focused analysis.
      </p>

      <p><strong>Selection Interface:</strong></p>
      <ul>
        <li><strong>Transcription Dropdown</strong>: Choose from transcriptions you have view access to</li>
        <li><strong>Permission-based Display</strong>: Only shows transcriptions you're authorized to analyze</li>
        <li><strong>Multi-transcription Support</strong>: Some analysis types support multiple transcription comparison</li>
        <li><strong>Metadata Display</strong>: View transcription details including performer, raga, and date</li>
      </ul>

      <p><strong>Access Control:</strong></p>
      <ul>
        <li><strong>Public Transcriptions</strong>: Available to all users for analysis</li>
        <li><strong>Shared Transcriptions</strong>: Transcriptions explicitly shared with you</li>
        <li><strong>Your Transcriptions</strong>: Transcriptions you have created or own</li>
        <li><strong>Collection Access</strong>: Transcriptions available through collection membership</li>
      </ul>

      <h3 id="segmentation-options">3.2 Segmentation Options</h3>
      <p>
        Segmentation controls determine how musical data is divided and organized for analysis,
        providing different perspectives on the same musical content.
      </p>

      <p><strong>Segmentation Types:</strong></p>
      <ul>
        <li><strong>Section</strong>: Analysis based on major structural divisions in the transcription</li>
        <li><strong>Phrase</strong>: Analysis at the phrase level for detailed melodic examination</li>
        <li><strong>Duration</strong>: Time-based segmentation for temporal analysis patterns</li>
      </ul>

      <p><strong>Section Segmentation:</strong></p>
      <ul>
        <li><strong>Structural Analysis</strong>: Examine large-scale musical organization</li>
        <li><strong>Form Comparison</strong>: Compare different sections within a performance</li>
        <li><strong>Development Tracking</strong>: Study how musical material evolves across sections</li>
        <li><strong>Hierarchical View</strong>: Understand major structural divisions</li>
      </ul>

      <p><strong>Phrase Segmentation:</strong></p>
      <ul>
        <li><strong>Melodic Detail</strong>: Focus on individual musical gestures and phrases</li>
        <li><strong>Micro-analysis</strong>: Examine small-scale musical patterns and ornaments</li>
        <li><strong>Phrase Comparison</strong>: Compare individual phrases across different contexts</li>
        <li><strong>Repetition Analysis</strong>: Study how phrases repeat and vary</li>
      </ul>

      <p><strong>Duration Segmentation:</strong></p>
      <ul>
        <li><strong>Temporal Patterns</strong>: Analyze music based on time intervals</li>
        <li><strong>Performance Pacing</strong>: Study the temporal development of performances</li>
        <li><strong>Rhythmic Analysis</strong>: Examine timing and duration patterns</li>
        <li><strong>Temporal Density</strong>: Analyze the distribution of musical events over time</li>
      </ul>

      <h3 id="pitch-representation">3.3 Pitch Representation</h3>
      <p>
        Pitch representation options control how pitch data is analyzed and displayed,
        providing different analytical perspectives on the same musical content.
      </p>

      <p><strong>Representation Types:</strong></p>
      <ul>
        <li><strong>Fixed Pitch</strong>: Analysis based on sustained pitch values throughout trajectory duration</li>
        <li><strong>Pitch Onsets</strong>: Analysis focused on the initial pitch of each trajectory or musical gesture</li>
      </ul>

      <p><strong>Fixed Pitch Analysis:</strong></p>
      <ul>
        <li><strong>Duration-weighted</strong>: Considers how long each pitch is sustained</li>
        <li><strong>Melodic Contour</strong>: Analyzes complete pitch trajectories and their shapes</li>
        <li><strong>Ornament Inclusion</strong>: Includes all pitch movements within ornamental gestures</li>
        <li><strong>Sustained Tone Analysis</strong>: Emphasizes longer-held pitches in the analysis</li>
      </ul>

      <p><strong>Pitch Onset Analysis:</strong></p>
      <ul>
        <li><strong>Structural Emphasis</strong>: Focuses on the starting points of musical gestures</li>
        <li><strong>Melodic Skeleton</strong>: Reveals the underlying pitch structure without ornamental detail</li>
        <li><strong>Phrase Beginning Analysis</strong>: Emphasizes how phrases and gestures begin</li>
        <li><strong>Reduced Complexity</strong>: Simplifies complex ornamental passages to their essential pitches</li>
      </ul>

      <h3 id="filtering-controls">3.4 Filtering Controls</h3>
      <p>
        Filtering controls allow you to refine your analysis focus by selecting specific aspects
        of the musical data for examination.
      </p>

      <p><strong>Track Filtering:</strong></p>
      <ul>
        <li><strong>Instrument Selection</strong>: Choose specific instrument tracks for analysis</li>
        <li><strong>Multi-track Analysis</strong>: Include or exclude different instruments in ensemble transcriptions</li>
        <li><strong>Polyphonic String Selection</strong>: For Sitar and Sarangi, choose main string, secondary string, or both</li>
      </ul>

      <p><strong>Temporal Filtering:</strong></p>
      <ul>
        <li><strong>Time Range Selection</strong>: Focus analysis on specific time periods within a transcription</li>
        <li><strong>Section Filtering</strong>: Include or exclude specific structural sections</li>
        <li><strong>Phrase Selection</strong>: Choose individual phrases or phrase ranges for focused analysis</li>
      </ul>

      <p><strong>Musical Content Filtering:</strong></p>
      <ul>
        <li><strong>Pitch Range Filtering</strong>: Limit analysis to specific pitch ranges or octaves</li>
        <li><strong>Trajectory Type Filtering</strong>: Include only specific trajectory types (fixed, bends, ornaments)</li>
        <li><strong>Articulation Filtering</strong>: Focus on trajectories with specific articulations or techniques</li>
      </ul>

      <hr>

      <h2 id="analysis-workflows">4. Analysis Workflows</h2>

      <h3 id="comparative-analysis">4.1 Comparative Analysis</h3>
      <p>
        Comparative analysis workflows enable systematic comparison of musical content across different
        dimensions, supporting research into stylistic differences and performance practices.
      </p>

      <p><strong>Cross-transcription Comparison:</strong></p>
      <ol>
        <li><strong>Select Multiple Transcriptions</strong>: Choose transcriptions for comparison (where supported)</li>
        <li><strong>Choose Analysis Type</strong>: Select appropriate analysis method for comparison goals</li>
        <li><strong>Configure Segmentation</strong>: Use consistent segmentation across all transcriptions</li>
        <li><strong>Apply Filters</strong>: Ensure comparable data scope across all selected transcriptions</li>
        <li><strong>Examine Results</strong>: Use visualization tools to identify similarities and differences</li>
      </ol>

      <p><strong>Within-transcription Comparison:</strong></p>
      <ol>
        <li><strong>Select Single Transcription</strong>: Choose transcription for internal comparison</li>
        <li><strong>Use Segmentation</strong>: Divide transcription into comparable units (sections, phrases)</li>
        <li><strong>Apply Analysis</strong>: Examine different segments using the same analytical approach</li>
        <li><strong>Compare Segments</strong>: Identify variations and developments within the performance</li>
      </ol>

      <p><strong>Instrument Comparison:</strong></p>
      <ul>
        <li><strong>Multi-track Analysis</strong>: Compare different instruments in ensemble transcriptions</li>
        <li><strong>Polyphonic String Comparison</strong>: Compare main and secondary strings in Sitar/Sarangi</li>
        <li><strong>Technique Comparison</strong>: Analyze how different instruments approach similar musical content</li>
      </ul>

      <h3 id="pattern-discovery">4.2 Pattern Discovery</h3>
      <p>
        Pattern discovery workflows help identify recurring musical elements and characteristic features
        within transcriptions using systematic analytical approaches.
      </p>

      <p><strong>Motif Discovery Workflow:</strong></p>
      <ol>
        <li><strong>Choose Pitch Patterns Analysis</strong>: Select appropriate analysis type for pattern detection</li>
        <li><strong>Set Segmentation Level</strong>: Use phrase-level segmentation for detailed pattern analysis</li>
        <li><strong>Configure Pitch Representation</strong>: Choose Fixed Pitch or Pitch Onsets based on research focus</li>
        <li><strong>Apply Filtering</strong>: Narrow focus to specific musical characteristics</li>
        <li><strong>Examine Pattern Results</strong>: Identify recurring motifs and their variations</li>
        <li><strong>Cross-reference with Editor</strong>: Return to Editor to examine patterns in musical context</li>
      </ol>

      <p><strong>Statistical Pattern Analysis:</strong></p>
      <ol>
        <li><strong>Use Pitch Prevalence Analysis</strong>: Identify statistically significant patterns</li>
        <li><strong>Compare Different Segmentations</strong>: Examine patterns at section, phrase, and duration levels</li>
        <li><strong>Apply Query Display</strong>: Search for specific patterns identified in statistical analysis</li>
        <li><strong>Validate Findings</strong>: Use multiple analysis types to confirm pattern significance</li>
      </ol>

      <h3 id="assemblage-organization">4.3 Assemblage Organization</h3>
      <p>
        Assemblage organization workflows provide systematic approaches to understanding
        the thematic and structural organization of complex musical performances.
      </p>

      <p><strong>Thematic Analysis Workflow:</strong></p>
      <ol>
        <li><strong>Create Assemblages in Editor</strong>: Organize phrases into thematic groups using Editor controls</li>
        <li><strong>Use Assemblage Display</strong>: Visualize and analyze the organization in Analysis Suite</li>
        <li><strong>Compare Thematic Development</strong>: Study how themes evolve across different assemblages</li>
        <li><strong>Cross-reference with Other Analyses</strong>: Use other analysis types to examine assemblage characteristics</li>
      </ol>

      <p><strong>Structural Analysis Workflow:</strong></p>
      <ol>
        <li><strong>Examine Assemblage Hierarchy</strong>: Study the relationship between assemblages, strands, and phrases</li>
        <li><strong>Analyze Distribution</strong>: Use statistical analysis to understand assemblage characteristics</li>
        <li><strong>Compare Across Transcriptions</strong>: Study different approaches to musical organization</li>
        <li><strong>Document Findings</strong>: Export assemblage data for detailed analysis</li>
      </ol>

      <h3 id="data-export">4.4 Data Export</h3>
      <p>
        Data export workflows enable researchers to use IDTAP analysis results in external tools
        and integrate findings into broader research projects.
      </p>

      <p><strong>Excel Dataset Export Workflow:</strong></p>
      <ol>
        <li><strong>Complete Analysis</strong>: Finish analysis using appropriate Analysis Suite tools</li>
        <li><strong>Select Excel Datasets</strong>: Choose Excel export option</li>
        <li><strong>Configure Export Parameters</strong>: Select data types and format options</li>
        <li><strong>Generate Dataset</strong>: Create structured spreadsheet for external analysis</li>
        <li><strong>Verify Data Integrity</strong>: Check exported data for completeness and accuracy</li>
      </ol>

      <p><strong>Research Integration Workflow:</strong></p>
      <ol>
        <li><strong>Export Multiple Formats</strong>: Use different export options for comprehensive data capture</li>
        <li><strong>Import to Analysis Software</strong>: Load data into R, SPSS, or other statistical tools</li>
        <li><strong>Validate Analysis Results</strong>: Cross-check IDTAP findings with external analysis</li>
        <li><strong>Document Methodology</strong>: Record analytical parameters and procedures</li>
        <li><strong>Integrate with Publications</strong>: Use findings in academic research and publications</li>
      </ol>

      <hr>

      <h2 id="support">5. Support and Feedback</h2>
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