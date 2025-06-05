import { VexFlow, Renderer, Stave, StaveNote, Formatter, Voice } from 'vexflow';
import { Raga } from '@model';

const tuningData = (raga: Raga) => {

  const pitches = raga.getPitches({ 
    low: raga.fundamental, 
    high: raga.fundamental * 1.999 
  });
  const westernPitches = pitches.map(p => p.westernPitch.toLowerCase() + '/4')
  console.log(westernPitches)
  const container = document.createElement('canvas');
  document.body.appendChild(container);
  const renderer = new Renderer(container, Renderer.Backends.CANVAS);
  const staveWidth = 600
  renderer.resize(staveWidth + 100, 200);
  const context = renderer.getContext();
  context.fillStyle = 'white';
  context.fillRect(0, 0, staveWidth + 100, 200);
  context.fillStyle = '#000000';
  const stave = new Stave(10, 40, staveWidth);
  stave.addClef('treble')
  stave.setContext(context).draw();
  const notes = westernPitches.map((p, pIdx) => {
    const note = new StaveNote({
      keys: [p], 
      duration: 'q'
    });
    if (p.includes('#')) {
      note.addModifier(new VexFlow.Accidental('#'), 0);
    }
    const centsString = pitches[pIdx].centsString;
    if (centsString !== '+0\u00A2') {
      note.addModifier(
        new VexFlow.Annotation(pitches[pIdx].centsString)
          .setVerticalJustification(VexFlow.Annotation.VerticalJustify.TOP)
          .setFont('Arial', 10)
      )
    }

    return note;
  });
  const voice = new Voice( {numBeats: pitches.length,  beatValue: 4});
  voice.addTickables(notes);
  

  // Format and justify the notes to 400 pixels
  new Formatter().joinVoices([voice]).format([voice], staveWidth - 50);
  voice.draw(context, stave);

  const canvasElement = container as HTMLCanvasElement;
  const pngFile = canvasElement.toDataURL('image/png');
  const downloadLink = document.createElement('a');
  downloadLink.href = pngFile;
  downloadLink.download = 'tuning.png';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  document.body.removeChild(container);
};

export {
	  tuningData
};
