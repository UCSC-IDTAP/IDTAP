# IDTAP General Instructions

## Welcome to IDTAP

The **Interactive Digital Transcription and Analysis Platform (IDTAP)** is a comprehensive web application designed for the transcription, analysis, and study of Indian classical music. This guide will help you navigate the platform's various interfaces and understand how to use each component effectively.

## Platform Overview

IDTAP consists of six main interfaces, each serving a specific purpose in the musical transcription and analysis workflow:

1. **Transcriptions** - Manage and organize your musical transcriptions
2. **Editor** - Create and edit detailed musical transcriptions
3. **Recordings** - Upload and manage audio recordings
4. **Raag Editor** - Define and edit raag specifications
5. **Analyzer** - Perform musical analysis on transcriptions
6. **Collections** - Create linkable folders of resources (recordings, transcriptions, audio events) for research, pedagogy, appreciation, and other purposes

## Getting Started

### Authentication

Before accessing most features, you'll need to log in using your Google account:

1. Click the user icon in the top-right corner of the navigation bar
2. Select "Log in" from the dropdown menu
3. Complete the Google authentication process
4. Once logged in, your profile picture will appear in the navigation bar

### Navigation

The main navigation bar at the top of the screen provides access to all major interfaces. The currently active page is highlighted. Click any navigation item to switch between interfaces.

## Core Concepts

### Transcriptions

A **transcription** in IDTAP represents a detailed musical analysis of an audio recording. It includes:

- **Melodic trajectories** - Continuous pitch contours representing the melody
- **Multiple tracks** - Different instruments or voices in the performance
- **Timing information** - Precise temporal alignment with the audio
- **Metadata** - Information about the performance, musicians, and raag
- **Permissions** - Access control for sharing and collaboration

### Audio Recordings

**Audio recordings** are the source material for transcriptions. They can be:

- Uploaded directly to the platform
- Associated with one or more transcriptions
- Processed to generate spectrograms and other visualizations
- Managed with metadata including musicians, instruments, and performance details

### Collections

**Collections** are linkable folders that act as containers for various IDTAP resources. Think of them as folders containing aliases or links to resources rather than the resources themselves. Collections can include:

- Audio recordings
- Transcriptions
- Audio events (concerts, sessions, performances)

Collections serve multiple purposes:
- **Research** - Group materials for academic study
- **Pedagogy** - Organize teaching materials and examples
- **Appreciation** - Curate performances for listening
- **Collaboration** - Share related resources with others
- **Organization** - Keep project materials together without duplicating files

### Raags

**Raags** are melodic frameworks fundamental to Indian classical music. In IDTAP, raag definitions include:

- Scale degrees and microtonal variations
- Characteristic phrases and movements
- Associated emotional qualities (rasa)
- Performance rules and conventions

## Workflow Overview

### Typical Transcription Workflow

1. **Upload Audio** - Start by uploading a recording in the Recordings interface
2. **Create Transcription** - Generate a new transcription from the recording
3. **Edit in Editor** - Use the Editor to create melodic trajectories and annotations
4. **Analyze** - Apply analysis tools to extract insights
5. **Organize** - Add to collections for organization and sharing

### Collaboration Workflow

1. **Set Permissions** - Configure who can view or edit your transcriptions
2. **Share Collections** - Create collections to share groups of materials
3. **Export Data** - Generate Excel or JSON exports for external analysis
4. **Publish Results** - Make transcriptions public for broader access

## Interface Descriptions

### Transcriptions Interface

The **Transcriptions** interface is your central hub for managing all transcription files. Here you can:

- View all transcriptions you have access to
- Search and filter by various criteria
- Create new transcriptions
- Clone existing transcriptions
- Manage permissions and sharing
- Delete unwanted transcriptions

[Detailed instructions available in Transcriptions Instructions]

### Editor Interface

The **Editor** is where detailed transcription work happens. Features include:

- Multi-track transcription support
- Real-time audio playback with synthesis
- Spectrogram visualization
- Trajectory editing tools
- Section and phrase labeling
- Polyphonic support for instruments like Sitar and Sarangi

[Detailed instructions available in Editor Instructions]

### Recordings Interface

The **Recordings** interface manages your audio files. Capabilities include:

- Audio file upload with progress tracking
- Automatic format conversion
- Metadata editing
- Spectrogram generation
- Sa (tonic) tuning tool
- Audio playback with visualization

[Detailed instructions available in Recordings Instructions]

### Raag Editor Interface

The **Raag Editor** allows you to define and modify raag specifications:

- Set scale degrees and pitch relationships
- Define characteristic phrases
- Specify performance rules
- Associate emotional qualities
- Create variations and related raags

### Analyzer Interface

The **Analyzer** provides tools for musical analysis:

- Pitch prevalence analysis
- Melodic pattern extraction
- Statistical analysis
- Comparative studies
- Data export for external tools

[Detailed instructions available in Analysis Instructions]

### Collections Interface

The **Collections** interface helps organize your work:

- Create themed collections with custom colors and descriptions
- Add recordings, transcriptions, and audio events as links
- Resources remain in their original locations (not copied or moved)
- Manage collection permissions and generate invite links
- Share curated sets with collaborators
- View all resources in a collection in one place
- Export collection data for analysis

[Detailed instructions available in Collections Instructions]

## Data Management

### File Types

IDTAP works with several file types:

- **Audio Files** - MP3, WAV, M4A, and other common formats
- **Transcription Data** - Stored in IDTAP's internal format
- **Exports** - Excel (.xlsx) and JSON for external analysis
- **Visualizations** - PNG images of spectrograms and melographs

### Storage and Backup

- All data is stored securely in the cloud
- Automatic backups ensure data safety
- Export important transcriptions for local backup
- Version history is maintained for transcriptions

### Permissions System

IDTAP uses a flexible permissions system:

- **Private** - Only you can access
- **Public** - Anyone can view
- **Shared** - Specific users have access
- **Edit** vs **View** permissions
- **Collection-based** permission inheritance

## Tips for Effective Use

### Organization Best Practices

1. Use descriptive names for transcriptions
2. Create collections for different projects
3. Maintain consistent metadata
4. Regular exports for backup

### Performance Optimization

1. Close unused browser tabs when working with large files
2. Use Chrome or Firefox for best compatibility
3. Ensure stable internet connection for audio uploads
4. Clear browser cache if experiencing issues

### Collaboration Tips

1. Set clear permissions before sharing
2. Use collections to share related materials
3. Document your transcription decisions
4. Export data in standard formats for compatibility

## Keyboard Shortcuts

Many interfaces support keyboard shortcuts for efficiency:

- **Space** - Play/pause audio
- **Arrow keys** - Navigate in time or pitch
- **Ctrl/Cmd + S** - Save current work
- **Escape** - Cancel current operation

(Specific shortcuts vary by interface - see individual instruction pages)

## Getting Help

### Documentation

- This General Instructions guide
- Interface-specific instruction pages (accessible via Help menu)
- Video tutorials (coming soon)
- API documentation for programmatic access

### Support

- Report issues via the Help menu
- Contact support for technical problems
- Join the user community forum
- Consult the FAQ section

## Advanced Features

### Python API Integration

IDTAP provides a Python package (`idtap-api`) for programmatic access:

- Install via pip: `pip install idtap-api`
- OAuth authentication for secure access
- Full access to transcription data
- Batch processing capabilities
- Integration with scientific Python tools

### Research Features

For academic researchers:

- Research waiver system for data access
- Batch export tools
- Statistical analysis integration
- Citation-ready data formats
- Collaboration tools for research teams

## System Requirements

### Recommended Browsers

- Google Chrome (latest version)
- Mozilla Firefox (latest version)
- Microsoft Edge (Chromium-based)
- Safari (with limitations)

### Hardware Requirements

- **Minimum**: 4GB RAM, dual-core processor
- **Recommended**: 8GB RAM, quad-core processor
- **For large files**: 16GB RAM or more
- Stable internet connection (minimum 10 Mbps for uploads)

### Audio Requirements

- Speakers or headphones for playback
- Microphone (optional, for recording)
- Audio interface (optional, for high-quality recording)

## Troubleshooting

### Common Issues

**Login Problems**
- Clear browser cookies
- Ensure pop-ups are enabled for Google login
- Try a different browser

**Audio Playback Issues**
- Check browser audio permissions
- Ensure audio device is connected
- Refresh the page

**Upload Failures**
- Check file size limits (1GB maximum)
- Ensure stable internet connection
- Try smaller files or different formats

**Performance Issues**
- Close unnecessary browser tabs
- Clear browser cache
- Reduce visualization quality if needed

### Error Messages

When encountering errors:
1. Note the exact error message
2. Check your internet connection
3. Try refreshing the page
4. If persistent, contact support with error details

## Privacy and Security

### Data Protection

- All data transmission is encrypted
- Secure cloud storage with regular backups
- Google OAuth for authentication
- No storage of Google credentials

### Privacy Controls

- Full control over transcription visibility
- Granular permission management
- Option to delete all personal data
- Export capabilities for data portability

## Updates and Changelog

IDTAP is regularly updated with new features and improvements:

- Check the Changelog (accessible from navigation menu)
- Important updates announced via email
- New features documented in release notes
- Backward compatibility maintained

## Conclusion

IDTAP provides a comprehensive platform for musical transcription and analysis. Start with basic transcription tasks and gradually explore advanced features as you become familiar with the interface. The platform is designed to grow with your needs, from simple transcriptions to complex analytical research.

For detailed instructions on specific interfaces, please refer to the individual instruction guides accessible from each interface's help menu.

---

*Last updated: [Current Date]*
*Version: 2.0*