import { instantiatePiece } from './../src/js/analysis'
import { Piece, Phrase } from './../src/js/classes';
import { SitarPhraseAnalyzer } from './phraseAttributes';
import util from 'util';

const vkYaman1960Id = '68002a62e0cac794f4b4a29c';

async function testPhrase() {
  try {
	const piece = await instantiatePiece(vkYaman1960Id);
	const phrase = piece.phrases[0];
	const temporality = {
		startTime: phrase.startTime || 0,
		endTime: phrase.startTime! + phrase.durTot!,
		duration: phrase.durTot!,
	};
	const analyzer = new SitarPhraseAnalyzer(phrase, piece.instrumentation[0], temporality);


	console.log(util.inspect(analyzer.statistics, {
		depth: null,           // traverse nested objects/arrays completely
		maxArrayLength: null,  // don’t limit how many array elements to show
		colors: true
	}));
  } catch (error) {
	console.error('Error instantiating piece:', error);
  }
}

testPhrase();
