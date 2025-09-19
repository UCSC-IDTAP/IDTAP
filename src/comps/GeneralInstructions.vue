<template>
  <div id="general-instructions" :style='mainStyle'>
    <h1>IDTAP General Instructions</h1>
    <p><em>Overview of the main interfaces in the Interactive Digital Transcription and Analysis Platform</em></p>
    <hr>

    <h2>Table of Contents</h2>
    <ol>
      <li><a href="#transcriptions">Transcriptions</a></li>
      <li><a href="#editor">Editor</a></li>
      <li><a href="#recordings">Recordings</a></li>
      <li><a href="#raag-editor">Raag Editor</a></li>
      <li><a href="#analyzer">Analyzer</a></li>
      <li><a href="#collections">Collections</a></li>
    </ol>

    <hr>

    <h2 id="transcriptions">1. Transcriptions</h2>
    <p>The <strong>Transcriptions</strong> interface is your central hub for managing all transcription files.</p>

    <p><strong>What you can do:</strong></p>
    <ul>
      <li>View all transcriptions you have access to</li>
      <li>Search and filter by various criteria</li>
      <li>Create new transcriptions</li>
      <li>Clone existing transcriptions</li>
      <li>Manage permissions and sharing</li>
      <li>Delete unwanted transcriptions</li>
    </ul>

    <p>A <strong>transcription</strong> in the IDTAP is a structured music representation/notation that captures and represents the melodic content of an audio recording using trajectories - an alphabet of possible melodic motions including continuous contours, stepwise movements, and articulations with idiomatic specificity.</p>

    <h2 id="editor">2. Editor</h2>
    <p>The <strong>Editor</strong> is where detailed transcription work happens.</p>

    <p><strong>What you can do:</strong></p>
    <ul>
      <li>Create and edit trajectories</li>
      <li>Work with multiple instrument tracks</li>
      <li>Play recorded audio along with real-time synthesis for aural verification</li>
      <li>View spectrograms and other visualizations</li>
      <li>Add section and phrase labels</li>
      <li>Work with polyphonic instruments like Sitar and Sarangi</li>
      <li>Export transcriptions in various formats</li>
    </ul>

    <p><em>[Detailed instructions available in <a href="/editorInstructions">Editor Instructions</a>]</em></p>

    <h2 id="recordings">3. Recordings</h2>
    <p>The <strong>Recordings</strong> interface manages your audio files.</p>

    <p><strong>What you can do:</strong></p>
    <ul>
      <li>Upload audio files with progress tracking</li>
      <li>Edit metadata (musicians, instruments, raag, etc.)</li>
      <li>Generate spectrograms and visualizations</li>
      <li>Use the Sa (tonic) tuning tool</li>
      <li>Play audio files</li>
      <li>Create new transcriptions from recordings</li>
      <li>Manage permissions for sharing</li>
    </ul>

    <h2 id="raag-editor">4. Raag Editor</h2>
    <p>The <strong>Raag Editor</strong> allows you to define and modify raag specifications.</p>

    <p><strong>What you can do:</strong></p>
    <ul>
      <li>Set scale degrees and pitch relationships</li>
      <li>Define characteristic phrases</li>
      <li>Specify performance rules</li>
      <li>Associate emotional qualities (rasa)</li>
      <li>Create variations and related raags</li>
    </ul>

    <h2 id="analyzer">5. Analyzer</h2>
    <p>The <strong>Analyzer</strong> provides tools for musical analysis of transcriptions.</p>

    <p><strong>What you can do:</strong></p>
    <ul>
      <li>Perform pitch prevalence analysis</li>
      <li>Extract melodic patterns</li>
      <li>Run statistical analysis</li>
      <li>Compare different transcriptions</li>
      <li>Export data for external analysis tools</li>
    </ul>

    <p><em>[Detailed instructions available in <a href="/analysisInstructions">Analysis Instructions</a>]</em></p>

    <h2 id="collections">6. Collections</h2>
    <p>The <strong>Collections</strong> interface helps organize your work.</p>

    <p><strong>What you can do:</strong></p>
    <ul>
      <li>Create themed collections with custom colors and descriptions</li>
      <li>Add recordings, transcriptions, and audio events as links</li>
      <li>Manage collection permissions and generate invite links</li>
      <li>Share curated sets with collaborators</li>
      <li>View all resources in a collection in one place</li>
      <li>Remove items from collections</li>
    </ul>

    <p><strong>Collections</strong> are linkable folders that act as containers for various IDTAP resources. Think of them as folders containing aliases or links to resources rather than the resources themselves. They serve multiple purposes: research, pedagogy, appreciation, collaboration, and organization.</p>

    <hr>
    <p><em>For detailed instructions on each interface, click the links above or access them from the Help menu within each interface.</em></p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'GeneralInstructions',
  props: {
    navHeight: {
      type: Number,
      default: 40
    }
  },
  computed: {
    mainStyle() {
      return {
        '--nav-height': this.navHeight + 'px'
      }
    }
  }
});
</script>

<style>
#general-instructions {
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

#general-instructions h1,
#general-instructions h2,
#general-instructions h3,
#general-instructions h4 {
  color: #ffebcd; /* Lighter color for headings */
  margin-top: 1.5em;
  text-align: left; /* Ensure headings are left-aligned */
}

#general-instructions h1 {
  font-size: 2em;
}

#general-instructions h2 {
  font-size: 1.75em;
}

#general-instructions h3 {
  font-size: 1.5em;
}

#general-instructions h4 {
  font-size: 1.25em;
}

#general-instructions p {
  margin-bottom: 1em;
  text-align: left; /* Ensure paragraphs are left-aligned */
}

#general-instructions ul,
#general-instructions ol {
  margin-left: 1.5em;
  margin-bottom: 1em;
  text-align: left; /* Ensure lists are left-aligned */
}

#general-instructions a {
  color: #add8e6; /* Light blue links */
  text-decoration: none;
}

#general-instructions a:hover {
  text-decoration: underline;
}

#general-instructions hr {
  border: none;
  height: 1px;
  background-color: #ccc;
  margin: 2em 0;
}

#general-instructions strong {
  color: #ffebcd;
}

#general-instructions em {
  font-style: italic;
}

#general-instructions code {
  background-color: #37474f;
  padding: 2px 4px;
  border-radius: 4px;
  color: #e0e0e0;
  font-family: 'Courier New', monospace;
  text-align: left; /* Ensure code blocks are left-aligned */
}

#general-instructions pre {
  background-color: #37474f;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  color: #e0e0e0;
  font-family: 'Courier New', monospace;
  text-align: left; /* Ensure preformatted text is left-aligned */
}

#general-instructions blockquote {
  border-left: 4px solid #ffebcd;
  margin-left: 0;
  padding-left: 1em;
  color: #dcdcdc;
  text-align: left; /* Ensure blockquotes are left-aligned */
}

@media (max-width: 600px) {
  #general-instructions {
    padding: 15px;
  }

  #general-instructions h1 {
    font-size: 1.75em;
  }

  #general-instructions h2 {
    font-size: 1.5em;
  }

  #general-instructions h3 {
    font-size: 1.25em;
  }

  #general-instructions h4 {
    font-size: 1.1em;
  }
}
</style>
