import { DN_Extractor } from './extract';
import { Segmentation, PitchRepresentation } from '@shared/enums';

const multaniID = '6417585554a0bfbd8de2d3ff';
const options = {
  segmentation: Segmentation.UserDefined,
  endSequenceLength: 3,
  pitchRepresentation: PitchRepresentation.ScaleDegree,
};
(async () => {
  const e = await DN_Extractor.create(multaniID, options);
  await e.writeToExcel('extracts/excel/multani_test_octaved.xlsx');
})();
