export async function gatherDatabaseInfo(db) {
	try {
		const audioRecordings = db.collection('audioRecordings');
		const transcriptions = db.collection('transcriptions');
		const audioStats = await audioRecordings.aggregate([
			{
				$group: {
          _id: null,
          totalRecordings: { $sum: 1 },
          totalDuration: { $sum: "$duration" },
        }
			}
		]).toArray();

    const transcriptionStats = await transcriptions.aggregate([
      { $unwind: "$phraseGrid" },         // unwind outer array of phraseGrid
      { $unwind: "$phraseGrid" },         // unwind inner array of phraseGrid
      { $unwind: "$phraseGrid.trajectoryGrid" }, // unwind outer array of trajectoryGrid
      { $unwind: "$phraseGrid.trajectoryGrid" }, // unwind inner array of trajectoryGrid
      { $group: { _id: null, totalTokens: { $sum: 1 } } }
    ]).toArray();

    const transcribedDurationStats = await transcriptions.aggregate([
      // First, flatten the phraseGrid (array of arrays) to get each phrase
      { $unwind: "$phraseGrid" },
      { $unwind: "$phraseGrid" },
      // Then, flatten the trajectoryGrid field within each phrase
      { $unwind: "$phraseGrid.trajectoryGrid" },
      { $unwind: "$phraseGrid.trajectoryGrid" },
      // Now, filter out trajectories that are long silences (id == 12 and durTot > 10)
      {
        $match: {
          $nor: [
            {
              $and: [
                { "phraseGrid.trajectoryGrid.id": { $in: [12, "12"] } },
                { "phraseGrid.trajectoryGrid.durTot": { $gt: 10 } }
              ]
            }
          ]
        }
      },
      // Sum the durations of the remaining trajectories
      {
        $group: {
          _id: null,
          totalTranscribedDurationExcludingLongSilence: { $sum: "$phraseGrid.trajectoryGrid.durTot" }
        }
      }
    ]).toArray();

    const totalTranscriptions = await transcriptions.countDocuments();

    const totalRecordings = audioStats.length? audioStats[0].totalRecordings : 0;
    const totalRecordingsDuration = audioStats.length? audioStats[0].totalDuration : 0;
    const totalTokens = transcriptionStats.length? transcriptionStats[0].totalTokens : 0;
    const totalTranscribedDurationExcludingLongSilence = transcribedDurationStats.length
			? transcribedDurationStats[0].totalTranscribedDurationExcludingLongSilence
			: 0;
    return { 
      totalRecordings, 
      totalRecordingsDuration, 
      totalTokens, 
      totalTranscribedDurationExcludingLongSilence,
      totalTranscriptions
    };
	} catch (error) {
    console.error(error);
    throw new Error('Error while gathering database information');
  }
}

export async function gatherTranscriptionDurations(db) {
  try {
    const transcriptions = db.collection('transcriptions');
 
    const durationInfo = await transcriptions.aggregate([
      { $project: { title: 1, phraseGrid: 1 } },
      { $unwind: "$phraseGrid" },
      { $unwind: "$phraseGrid" },
      { $unwind: "$phraseGrid.trajectoryGrid" },
      { $unwind: "$phraseGrid.trajectoryGrid" },
      { $group: {
          _id: "$_id",
          title: { $first: "$title" },
          totalDuration: { $sum: "$phraseGrid.trajectoryGrid.durTot" },
          totalTranscribedDurationExcludingLongSilence: { $sum: {
            $cond: [
              { $and: [
                { $or: [ { $eq: ["$phraseGrid.trajectoryGrid.id", 12] }, { $eq: ["$phraseGrid.trajectoryGrid.id", "12"] } ] },
                { $gt: ["$phraseGrid.trajectoryGrid.durTot", 10] }
              ]},
              0,
              "$phraseGrid.trajectoryGrid.durTot"
            ]
          } }
      }},
      { $sort: { totalTranscribedDurationExcludingLongSilence: -1 } }
    ]).toArray();
 
    return durationInfo;
  } catch (error) {
    console.error(error);
    throw new Error('Error while gathering per-transcription duration information');
  }
}

