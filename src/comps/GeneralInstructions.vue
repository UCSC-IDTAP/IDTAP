<template>
  <div id="general-instructions" :style='mainStyle'>
    <h1>IDTAP General Instructions</h1>

    <h2>Welcome to IDTAP</h2>
    <p>
      The <strong>Interactive Digital Transcription and Analysis Platform (IDTAP)</strong> is a comprehensive web application
      designed for the transcription, analysis, and study of Indian classical music. This guide will help you navigate
      the platform's various interfaces and understand how to use each component effectively.
    </p>

    <h2>Platform Overview</h2>
    <p>
      IDTAP consists of six main interfaces, each serving a specific purpose in the musical transcription and analysis workflow:
    </p>
    <ol>
      <li><strong>Transcriptions</strong> - Manage and organize your musical transcriptions</li>
      <li><strong>Editor</strong> - Create and edit detailed musical transcriptions</li>
      <li><strong>Recordings</strong> - Upload and manage audio recordings</li>
      <li><strong>Raag Editor</strong> - Define and edit raag specifications</li>
      <li><strong>Analyzer</strong> - Perform musical analysis on transcriptions</li>
      <li><strong>Collections</strong> - Create linkable folders of resources (recordings, transcriptions, audio events) for research, pedagogy, appreciation, and other purposes</li>
    </ol>

    <h2>Getting Started</h2>

    <h3>Authentication</h3>
    <p>Before accessing most features, you'll need to log in using your Google account:</p>
    <ol>
      <li>Click the user icon in the top-right corner of the navigation bar</li>
      <li>Select "Log in" from the dropdown menu</li>
      <li>Complete the Google authentication process</li>
      <li>First-time users will need to agree to a research waiver before accessing the site</li>
      <li>Once logged in, your profile picture will appear in the navigation bar</li>
    </ol>

    <h3>Navigation</h3>
    <p>
      The main navigation bar at the top of the screen provides access to all major interfaces.
      The currently active page is highlighted. Click any navigation item to switch between interfaces.
    </p>

    <h2>Core Concepts</h2>

    <h3>Transcriptions</h3>
    <p>A <strong>transcription</strong> in IDTAP represents a detailed musical analysis of an audio recording. It includes:</p>
    <ul>
      <li><strong>Melodic trajectories</strong> - Continuous pitch contours representing the melody</li>
      <li><strong>Multiple tracks</strong> - Different instruments or voices in the performance</li>
      <li><strong>Timing information</strong> - Precise temporal alignment with the audio</li>
      <li><strong>Metadata</strong> - Information about the performance, musicians, and raag</li>
      <li><strong>Permissions</strong> - Access control for sharing and collaboration</li>
    </ul>

    <h3>Audio Recordings</h3>
    <p><strong>Audio recordings</strong> are the source material for transcriptions. They can be:</p>
    <ul>
      <li>Uploaded directly to the platform</li>
      <li>Associated with one or more transcriptions</li>
      <li>Processed to generate spectrograms and other visualizations</li>
      <li>Managed with metadata including musicians, instruments, and performance details</li>
    </ul>

    <h3>Collections</h3>
    <p>
      <strong>Collections</strong> are linkable folders that act as containers for various IDTAP resources.
      Think of them as folders containing aliases or links to resources rather than the resources themselves.
      Collections can include:
    </p>
    <ul>
      <li>Audio recordings</li>
      <li>Transcriptions</li>
      <li>Audio events (concerts, sessions, performances)</li>
    </ul>
    <p>Collections serve multiple purposes:</p>
    <ul>
      <li><strong>Research</strong> - Group materials for academic study</li>
      <li><strong>Pedagogy</strong> - Organize teaching materials and examples</li>
      <li><strong>Appreciation</strong> - Curate performances for listening</li>
      <li><strong>Collaboration</strong> - Share related resources with others</li>
      <li><strong>Organization</strong> - Keep project materials together without duplicating files</li>
    </ul>

    <h3>Raags</h3>
    <p><strong>Raags</strong> are melodic frameworks fundamental to Indian classical music. In IDTAP, raag definitions include:</p>
    <ul>
      <li>Scale degrees and microtonal variations</li>
      <li>Characteristic phrases and movements</li>
      <li>Associated emotional qualities (rasa)</li>
      <li>Performance rules and conventions</li>
    </ul>

    <h2>Workflow Overview</h2>

    <h3>Typical Transcription Workflow</h3>
    <ol>
      <li><strong>Upload Audio</strong> - Start by uploading a recording in the Recordings interface</li>
      <li><strong>Create Transcription</strong> - Generate a new transcription from the recording</li>
      <li><strong>Edit in Editor</strong> - Use the Editor to create melodic trajectories and annotations</li>
      <li><strong>Analyze</strong> - Apply analysis tools to extract insights</li>
      <li><strong>Organize</strong> - Add to collections for organization and sharing</li>
    </ol>

    <h3>Collaboration Workflow</h3>
    <ol>
      <li><strong>Set Permissions</strong> - Configure who can view or edit your transcriptions</li>
      <li><strong>Share Collections</strong> - Create collections to share groups of materials</li>
      <li><strong>Export Data</strong> - Generate Excel or JSON exports for external analysis</li>
      <li><strong>Publish Results</strong> - Make transcriptions public for broader access</li>
    </ol>

    <h2>Interface Descriptions</h2>

    <h3>Transcriptions Interface</h3>
    <p>The <strong>Transcriptions</strong> interface is your central hub for managing all transcription files. Here you can:</p>
    <ul>
      <li>View all transcriptions you have access to</li>
      <li>Search and filter by various criteria</li>
      <li>Create new transcriptions</li>
      <li>Clone existing transcriptions</li>
      <li>Manage permissions and sharing</li>
      <li>Delete unwanted transcriptions</li>
    </ul>
    <p><em>[Detailed instructions available in Transcriptions Instructions]</em></p>

    <h3>Editor Interface</h3>
    <p>The <strong>Editor</strong> is where detailed transcription work happens. Features include:</p>
    <ul>
      <li>Multi-track transcription support</li>
      <li>Real-time audio playback with synthesis</li>
      <li>Spectrogram visualization</li>
      <li>Trajectory editing tools</li>
      <li>Section and phrase labeling</li>
      <li>Polyphonic support for instruments like Sitar and Sarangi</li>
    </ul>
    <p><em>[Detailed instructions available in Editor Instructions]</em></p>

    <h3>Recordings Interface</h3>
    <p>The <strong>Recordings</strong> interface manages your audio files. Capabilities include:</p>
    <ul>
      <li>Audio file upload with progress tracking</li>
      <li>Automatic format conversion</li>
      <li>Metadata editing</li>
      <li>Spectrogram generation</li>
      <li>Sa (tonic) tuning tool</li>
      <li>Audio playback with visualization</li>
    </ul>
    <p><em>[Detailed instructions available in Recordings Instructions]</em></p>

    <h3>Raag Editor Interface</h3>
    <p>The <strong>Raag Editor</strong> allows you to define and modify raag specifications:</p>
    <ul>
      <li>Set scale degrees and pitch relationships</li>
      <li>Define characteristic phrases</li>
      <li>Specify performance rules</li>
      <li>Associate emotional qualities</li>
      <li>Create variations and related raags</li>
    </ul>

    <h3>Analyzer Interface</h3>
    <p>The <strong>Analyzer</strong> provides tools for musical analysis:</p>
    <ul>
      <li>Pitch prevalence analysis</li>
      <li>Melodic pattern extraction</li>
      <li>Statistical analysis</li>
      <li>Comparative studies</li>
      <li>Data export for external tools</li>
    </ul>
    <p><em>[Detailed instructions available in Analysis Instructions]</em></p>

    <h3>Collections Interface</h3>
    <p>The <strong>Collections</strong> interface helps organize your work:</p>
    <ul>
      <li>Create themed collections with custom colors and descriptions</li>
      <li>Add recordings, transcriptions, and audio events as links</li>
      <li>Resources remain in their original locations (not copied or moved)</li>
      <li>Manage collection permissions and generate invite links</li>
      <li>Share curated sets with collaborators</li>
      <li>View all resources in a collection in one place</li>
      <li>Export collection data for analysis</li>
    </ul>
    <p><em>[Detailed instructions available in Collections Instructions]</em></p>

    <h2>Data Management</h2>

    <h3>File Types</h3>
    <p>IDTAP works with several file types:</p>
    <ul>
      <li><strong>Audio Files</strong> - MP3, WAV, M4A, and other common formats</li>
      <li><strong>Transcription Data</strong> - Stored in IDTAP's internal format</li>
      <li><strong>Exports</strong> - Excel (.xlsx) and JSON for external analysis</li>
      <li><strong>Visualizations</strong> - PNG images of spectrograms and melographs</li>
    </ul>

    <h3>Storage and Backup</h3>
    <ul>
      <li>All data is stored securely in the cloud</li>
      <li>Automatic backups ensure data safety</li>
      <li>Export important transcriptions for local backup</li>
      <li>Version history is maintained for transcriptions</li>
    </ul>

    <h3>Permissions System</h3>
    <p>IDTAP uses a flexible permissions system:</p>
    <ul>
      <li><strong>Private</strong> - Only you can access</li>
      <li><strong>Public</strong> - Anyone can view</li>
      <li><strong>Shared</strong> - Specific users have access</li>
      <li><strong>Edit</strong> vs <strong>View</strong> permissions</li>
      <li><strong>Collection-based</strong> permission inheritance</li>
    </ul>

    <h2>Tips for Effective Use</h2>

    <h3>Organization Best Practices</h3>
    <ol>
      <li>Use descriptive names for transcriptions</li>
      <li>Create collections for different projects</li>
      <li>Maintain consistent metadata</li>
      <li>Regular exports for backup</li>
    </ol>

    <h3>Performance Optimization</h3>
    <ol>
      <li>Close unused browser tabs when working with large files</li>
      <li>Use Chrome or Firefox for best compatibility</li>
      <li>Ensure stable internet connection for audio uploads</li>
      <li>Clear browser cache if experiencing issues</li>
    </ol>

    <h3>Collaboration Tips</h3>
    <ol>
      <li>Set clear permissions before sharing</li>
      <li>Use collections to share related materials</li>
      <li>Document your transcription decisions</li>
      <li>Export data in standard formats for compatibility</li>
    </ol>

    <h2>Keyboard Shortcuts</h2>
    <p>Many interfaces support keyboard shortcuts for efficiency:</p>
    <ul>
      <li><strong>Space</strong> - Play/pause audio</li>
      <li><strong>Arrow keys</strong> - Navigate in time or pitch</li>
      <li><strong>Ctrl/Cmd + S</strong> - Save current work</li>
      <li><strong>Escape</strong> - Cancel current operation</li>
    </ul>
    <p><em>(Specific shortcuts vary by interface - see individual instruction pages)</em></p>

    <h2>Getting Help</h2>

    <h3>Documentation</h3>
    <ul>
      <li>This General Instructions guide</li>
      <li>Interface-specific instruction pages (accessible via Help menu)</li>
      <li>Video tutorials (coming soon)</li>
      <li>API documentation for programmatic access</li>
    </ul>

    <h3>Support</h3>
    <ul>
      <li>Report issues via the Help menu</li>
      <li>Contact support for technical problems</li>
      <li>Join the user community forum</li>
      <li>Consult the FAQ section</li>
    </ul>

    <h2>Advanced Features</h2>

    <h3>Python API Integration</h3>
    <p>IDTAP provides a Python package (<code>idtap-api</code>) for programmatic access:</p>
    <ul>
      <li>Install via pip: <code>pip install idtap-api</code></li>
      <li>OAuth authentication for secure access</li>
      <li>Full access to transcription data</li>
      <li>Batch processing capabilities</li>
      <li>Integration with scientific Python tools</li>
    </ul>

    <h3>Research Features</h3>
    <p>For academic researchers:</p>
    <ul>
      <li>Research waiver system for data access</li>
      <li>Batch export tools</li>
      <li>Statistical analysis integration</li>
      <li>Citation-ready data formats</li>
      <li>Collaboration tools for research teams</li>
    </ul>

    <h2>System Requirements</h2>

    <h3>Recommended Browsers</h3>
    <ul>
      <li>Google Chrome (latest version)</li>
      <li>Mozilla Firefox (latest version)</li>
      <li>Microsoft Edge (Chromium-based)</li>
      <li>Safari (with limitations)</li>
    </ul>

    <h3>Hardware Requirements</h3>
    <ul>
      <li><strong>Minimum</strong>: 4GB RAM, dual-core processor</li>
      <li><strong>Recommended</strong>: 8GB RAM, quad-core processor</li>
      <li><strong>For large files</strong>: 16GB RAM or more</li>
      <li>Stable internet connection (minimum 10 Mbps for uploads)</li>
    </ul>

    <h3>Audio Requirements</h3>
    <ul>
      <li>Speakers or headphones for playback</li>
      <li>Microphone (optional, for recording)</li>
      <li>Audio interface (optional, for high-quality recording)</li>
    </ul>

    <h2>Troubleshooting</h2>

    <h3>Common Issues</h3>

    <h4>Login Problems</h4>
    <ul>
      <li>Clear browser cookies</li>
      <li>Ensure pop-ups are enabled for Google login</li>
      <li>Try a different browser</li>
    </ul>

    <h4>Audio Playback Issues</h4>
    <ul>
      <li>Check browser audio permissions</li>
      <li>Ensure audio device is connected</li>
      <li>Refresh the page</li>
    </ul>

    <h4>Upload Failures</h4>
    <ul>
      <li>Check file size limits (1GB maximum)</li>
      <li>Ensure stable internet connection</li>
      <li>Try smaller files or different formats</li>
    </ul>

    <h4>Performance Issues</h4>
    <ul>
      <li>Close unnecessary browser tabs</li>
      <li>Clear browser cache</li>
      <li>Reduce visualization quality if needed</li>
    </ul>

    <h3>Error Messages</h3>
    <p>When encountering errors:</p>
    <ol>
      <li>Note the exact error message</li>
      <li>Check your internet connection</li>
      <li>Try refreshing the page</li>
      <li>If persistent, contact support with error details</li>
    </ol>

    <h2>Privacy and Security</h2>

    <h3>Data Protection</h3>
    <ul>
      <li>All data transmission is encrypted</li>
      <li>Secure cloud storage with regular backups</li>
      <li>Google OAuth for authentication</li>
      <li>No storage of Google credentials</li>
    </ul>

    <h3>Privacy Controls</h3>
    <ul>
      <li>Full control over transcription visibility</li>
      <li>Granular permission management</li>
      <li>Option to delete all personal data</li>
      <li>Export capabilities for data portability</li>
    </ul>

    <h2>Updates and Changelog</h2>
    <p>IDTAP is regularly updated with new features and improvements:</p>
    <ul>
      <li>Check the Changelog (accessible from navigation menu)</li>
      <li>Important updates announced via email</li>
      <li>New features documented in release notes</li>
      <li>Backward compatibility maintained</li>
    </ul>

    <h2>Conclusion</h2>
    <p>
      IDTAP provides a comprehensive platform for musical transcription and analysis. Start with basic transcription
      tasks and gradually explore advanced features as you become familiar with the interface. The platform is designed
      to grow with your needs, from simple transcriptions to complex analytical research.
    </p>
    <p>
      For detailed instructions on specific interfaces, please refer to the individual instruction guides accessible
      from each interface's help menu.
    </p>

    <hr>
    <p><em>Last updated: January 2025</em></p>
    <p><em>Version: 2.0</em></p>
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