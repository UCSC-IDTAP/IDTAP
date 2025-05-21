<template>
	<div class='outer'>
		<div class='selectionCol'>
			<div class='selectionRow'>
				<div class='selectionLabel'>Pitch Representation</div>
				<select v-model="pitchRepresentation">
					<option v-for="(value, key) in PitchRepresentation" :key="key" :value="value">
						{{ key }}
					</option>
				</select>
			</div>
		</div>
		<div class='selectionCol'>
			<div class='selectionRow'>
				<div class='selectionLabel'>Segmentation</div>
				<select v-model="segmentation">
					<option v-for="(value, key) in Segmentation" :key="key" :value="value">
						{{ key }}
					</option>
				</select>
			</div>
		</div>
		<div class='selectionCol'>
			<div class='selectionRow'>
				<div class='selectionLabel'>End Sequence Length</div>
				<select v-model="endSequenceLength">
					<option v-for="option in endSequenceOptions" :key="option" :value="option">
						{{ option }}
					</option>
				</select>
			</div>
		</div>
		<div class='selectionCol'>
			<button @click='downloadExcel' :disabled='downloading'>Download Dataset</button>
		</div>
	</div>
</template>

<script lang='ts'>

import { defineComponent, ref, PropType } from 'vue';
import { Piece } from '@/js/classes.ts';

import { 
	PitchRepresentation,
	Segmentation,
  PitchInclusionMethod
} from '@shared/enums';
import { DN_ExtractorOptions } from '@shared/types';
import { getDNExtractExcel } from '@/js/serverCalls';

export default defineComponent({
	name: 'ExcelDatasets',
	props: {
		piece: {
			type: Object as PropType<Piece>,
			required: true
		},
		instIdx: {
			type: Number,
			required: true
		},

	},
	setup(props) {
		const pitchRepresentation = ref<PitchRepresentation>(PitchRepresentation.Chroma);
		const segmentation = ref<Segmentation>(Segmentation.UserDefined);
		const endSequenceLength = ref<number>(3);
    const downloading = ref<boolean>(false);
		const endSequenceOptions = [1, 2, 3, 4, 5, 6];

    const downloadExcel = async () => {
      downloading.value = true;
      const options: DN_ExtractorOptions = {
        segmentation: segmentation.value,
        pitchJustification: PitchInclusionMethod.All,
        durThreshold: 0.1,
        track: props.instIdx,
        pitchRepresentation: pitchRepresentation.value,
        endSequenceLength: endSequenceLength.value,
      };

      try {
        const data = await getDNExtractExcel(props.piece._id!, options);
        // Handle the Excel file download
        
        if (!data) {
          console.error('No data received from server');
          return;
        }

        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'DN_Extract.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        downloading.value = false;

      } catch (error) {
        console.error('Error downloading Excel file:', error);
        downloading.value = false;
      }
    }
		return {
			pitchRepresentation,
			PitchRepresentation,
			segmentation,
			Segmentation,
			endSequenceLength,
			endSequenceOptions,
      downloadExcel,
      downloading,
		}
	}
})
</script>

<style scoped>

.outer {
	width: 100%;
	height: 100px;
	background-color: black;
	display: flex;
	flex-direction: row;
	justify-content: left;
	align-items: center;
}
.selectionCol {
	width: 250px;
	height: 100%;
	border-right: 1px solid white;
	display: flex;
	flex-direction: column;
	justify-content: top;
	align-items: center;
}
.selectionLabel {
	box-sizing: border-box;
	padding: 10px;
	/* width: 250px; */
}
button {
  margin: 15px;
}
</style>
