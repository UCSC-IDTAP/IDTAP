// Users for whom on-screen motion must be suppressed (non-animated playhead,
// no wheel/touch scrolling) — motion sensitivity.
const motionSensitiveUserIDs = [
  '634d9506a6a3647e543b7641', // jbmyers@ucsc.edu
  '67bcba9496f2cea9ceb736c2', // jon.myers.sound@gmail.com
];

const suppressMotion = (userID?: string) => {
  return userID !== undefined && motionSensitiveUserIDs.includes(userID);
};

export { motionSensitiveUserIDs, suppressMotion };
