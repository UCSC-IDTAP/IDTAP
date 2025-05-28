const nPVI = (durations: number[]): number => {
// normalized pairwise variability index
  const n = durations.length;
  if (n < 2) return 0;
  let sumDiff = 0;
  for (let i = 0; i < n - 1; i++) {
    sumDiff += Math.abs(durations[i] - durations[i + 1]);
  }
  const mean = durations.reduce((acc, d) => acc + d, 0) / n;
  return (100 * sumDiff) / ((n - 1) * mean);
};

const nCVI = (durations: number[]): number => {
// normalized combinatorial variability index
  const n = durations.length;
  if (n < 2) return 0;
  let sumPVI = 0;
  let count = 0;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = durations[i];
      const b = durations[j];
      sumPVI += (200 * Math.abs(a - b)) / (a + b);
      count++;
    }
  }
  return sumPVI / count;
};


export { nPVI, nCVI };
