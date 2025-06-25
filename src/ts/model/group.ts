import { Pitch } from './pitch'
import { Trajectory } from './trajectory'
import { v4 as uuidv4 } from 'uuid';

class Group { 
  trajectories: Trajectory[];
  id: string;
  //  a group of adjacent trajectories, cloneable for copy and paste
  // takes the trajectories as input (they should have already been tested for 
  // adjacency, but testing again just in case).
  // this will sit in in the phrase object, within a `groupsGrid` nested array. 
  // A reference to this group, via ID, is held in each relevent trajectory.
  // (if we held the group itself in the traj, we would get circularity ...)

  // when reconstructing this upon loading the piece from JSON, need to make 
  // sure that the trajectories involved are the same real ones.


  constructor({
	trajectories = [],
	id = undefined,
  }: {
	trajectories?: Trajectory[],
	id?: string,
  } = {}) {
	this.trajectories = trajectories;

	this.trajectories.sort((a, b) => {
	  if (a.num === undefined || b.num === undefined) {
		throw new Error('Trajectory must have a num')
	  }
	  return a.num - b.num
	});
	if (this.trajectories.length < 2) {
	  throw new Error('Group must have at least 2 trajectories')
	}
	if (!this.testForAdjacency()) {
	  throw new Error('Trajectories are not adjacent')
	}
	
	if (id === undefined) {
	  id = uuidv4();
	}
	this.id = id;
	this.trajectories.forEach(traj => {
	  traj.groupId = this.id;
	})
  }

  get minFreq() {
	const out = Math.min(...this.trajectories.map(t => t.minFreq));
	return out
  }

  get maxFreq() {
	const out = Math.max(...this.trajectories.map(t => t.maxFreq));
	return out
  }

  allPitches(repetition: boolean = true) {
	let allPitches: Pitch[] = [];
	this.trajectories.forEach(traj => {
	  if (traj.id !== 12) {
		allPitches.push(...traj.pitches)
	  }
	});
	if (!repetition) {
	  allPitches = allPitches.filter((pitch, i) => {
		const c1 = i === 0;
		const c2 = pitch.swara === allPitches[i-1]?.swara;
		const c3 = pitch.oct === allPitches[i-1]?.oct;
		const c4 = pitch.raised === allPitches[i-1]?.raised;
		return c1 || !(c2 && c3 && c4)
	  })
	}
	return allPitches
  }

  testForAdjacency() {
	const uniquePIdxs = [...new Set(this.trajectories.map(t => t.phraseIdx))];
	if (uniquePIdxs.length === 1) {
	  this.trajectories.sort((a, b) => {
		if (a.num === undefined || b.num === undefined) {
		  throw new Error('Trajectory must have a num')
		}
		return a.num - b.num
	  });
	  const nums = this.trajectories.map(t => {
		if (t.num === undefined) {
		  throw new Error('Trajectory must have a num')
		}
		return t.num
	  });
	  const diffs = nums.slice(1).map((num, nIdx) => {
		  return num - nums[nIdx];
	  })
	  return diffs.every(diff => diff === 1)
	} else {
	  return false
	}
  }

  addTraj(traj: Trajectory) {
	this.trajectories.push(traj);
	this.trajectories.sort((a, b) => {
	  if (a.num === undefined || b.num === undefined) {
		throw new Error('Trajectory must have a num')
	  }
	  return a.num - b.num
	});
	if (!this.testForAdjacency()) {
	  throw new Error('Trajectories are not adjacent')
	}
	traj.groupId = this.id;
  }

  toJSON() {
        return {
          trajectories: this.trajectories,
          id: this.id
        }
  }

  static fromJSON(obj: any): Group {
        return new Group({
          trajectories: obj.trajectories as Trajectory[],
          id: obj.id,
        });
  }
}

export { Group };
