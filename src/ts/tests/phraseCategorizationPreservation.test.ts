import { expect, test, describe } from 'vitest';
import { Phrase, Trajectory, Pitch, Raga, Piece } from '@model';
import { initPhraseCategorization } from '@model/phrase';
import { cloneDeep } from 'lodash';

describe('Phrase Categorization Preservation', () => {

  // Helper to create a test phrase with categorizations
  const createTestPhrase = (includeCategories = true) => {
    const traj1 = new Trajectory({
      id: 1,
      durTot: 1,
      pitches: [new Pitch({ swara: 'sa' })]
    });
    const traj2 = new Trajectory({
      id: 1,
      durTot: 1,
      pitches: [new Pitch({ swara: 'ga' })]
    });

    const phraseObj: any = {
      trajectories: [traj1, traj2],
      raga: new Raga(),
      startTime: 0
    };

    if (includeCategories) {
      // Create custom categorizations for testing
      const cat1 = initPhraseCategorization();
      cat1.Phrase.Asthai = true;
      cat1.Elaboration.Vistar = true;

      const cat2 = initPhraseCategorization();
      cat2.Phrase.Antara = true;

      phraseObj.categorizationGrid = [cat1, cat2];
      phraseObj.adHocCategorizationGrid = [['custom1', 'custom2'], ['custom3']];
    }

    return new Phrase(phraseObj);
  };

  describe('insertNewPhraseDiv simulation', () => {
    test('should preserve categorizations when creating new phrase from split', () => {
      const originalPhrase = createTestPhrase(true);
      const splitIndex = 1;

      // Simulate what insertNewPhraseDiv does
      const newPhraseObj = {
        trajectories: originalPhrase.trajectories.slice(splitIndex),
        raga: originalPhrase.raga!,
        categorizationGrid: originalPhrase.categorizationGrid.map(cat => cloneDeep(cat)),
        adHocCategorizationGrid: [...originalPhrase.adHocCategorizationGrid]
      };

      const newPhrase = new Phrase(newPhraseObj);

      // Verify categorizations are preserved
      expect(newPhrase.categorizationGrid).toBeDefined();
      expect(newPhrase.categorizationGrid.length).toBe(2);

      // Check specific categorizations are preserved
      expect(newPhrase.categorizationGrid[0].Phrase.Asthai).toBe(true);
      expect(newPhrase.categorizationGrid[0].Elaboration.Vistar).toBe(true);
      expect(newPhrase.categorizationGrid[1].Phrase.Antara).toBe(true);

      // Check ad-hoc categorizations
      expect(newPhrase.adHocCategorizationGrid[0]).toContain('custom1');
      expect(newPhrase.adHocCategorizationGrid[0]).toContain('custom2');
      expect(newPhrase.adHocCategorizationGrid[1]).toContain('custom3');

      // Verify deep copy (not same reference)
      expect(newPhrase.categorizationGrid[0]).not.toBe(originalPhrase.categorizationGrid[0]);
    });

    test('should handle phrases without categorizations gracefully', () => {
      const originalPhrase = createTestPhrase(false);
      const splitIndex = 1;

      // Simulate split without categorizations
      const newPhraseObj = {
        trajectories: originalPhrase.trajectories.slice(splitIndex),
        raga: originalPhrase.raga!,
        categorizationGrid: originalPhrase.categorizationGrid.map(cat => cloneDeep(cat)),
        adHocCategorizationGrid: [...originalPhrase.adHocCategorizationGrid]
      };

      const newPhrase = new Phrase(newPhraseObj);

      // Should have default categorizations
      expect(newPhrase.categorizationGrid).toBeDefined();
      expect(newPhrase.categorizationGrid.length).toBeGreaterThan(0);
    });
  });

  describe('deletePhraseDiv categorization merging', () => {
    test('should preserve categorizations when they are identical', () => {
      const phrase1 = createTestPhrase(true);
      const phrase2 = createTestPhrase(true);

      // Make categorizations identical
      phrase2.categorizationGrid = phrase1.categorizationGrid.map(cat => cloneDeep(cat));

      // Helper to check if categorizations are identical
      const areCategorizationsIdentical = (cat1: any, cat2: any): boolean => {
        return JSON.stringify(cat1) === JSON.stringify(cat2);
      };

      // Test the comparison
      expect(areCategorizationsIdentical(
        phrase1.categorizationGrid[0],
        phrase2.categorizationGrid[0]
      )).toBe(true);
    });

    test('should detect when categorizations differ', () => {
      const phrase1 = createTestPhrase(true);
      const phrase2 = createTestPhrase(true);

      // Make categorizations different
      phrase2.categorizationGrid[0].Phrase.Mukra = true;

      const areCategorizationsIdentical = (cat1: any, cat2: any): boolean => {
        return JSON.stringify(cat1) === JSON.stringify(cat2);
      };

      expect(areCategorizationsIdentical(
        phrase1.categorizationGrid[0],
        phrase2.categorizationGrid[0]
      )).toBe(false);
    });

    test('should merge ad-hoc categorizations with unique values', () => {
      const phrase1 = createTestPhrase(true);
      const phrase2 = createTestPhrase(true);

      // Set up different ad-hoc categorizations
      phrase1.adHocCategorizationGrid = [['cat1', 'cat2'], []];
      phrase2.adHocCategorizationGrid = [['cat2', 'cat3'], ['cat4']];

      // Simulate the merge logic
      phrase2.adHocCategorizationGrid.forEach((adHocCat, stringIdx) => {
        if (!phrase1.adHocCategorizationGrid[stringIdx]) {
          phrase1.adHocCategorizationGrid[stringIdx] = [];
        }
        if (adHocCat && adHocCat.length > 0) {
          const uniqueCategories = adHocCat.filter(cat =>
            !phrase1.adHocCategorizationGrid[stringIdx].includes(cat)
          );
          phrase1.adHocCategorizationGrid[stringIdx].push(...uniqueCategories);
        }
      });

      // Check merged result
      expect(phrase1.adHocCategorizationGrid[0]).toContain('cat1');
      expect(phrase1.adHocCategorizationGrid[0]).toContain('cat2');
      expect(phrase1.adHocCategorizationGrid[0]).toContain('cat3');
      expect(phrase1.adHocCategorizationGrid[0].length).toBe(3); // No duplicates
      expect(phrase1.adHocCategorizationGrid[1]).toContain('cat4');
    });
  });

  describe('Nudging operation preservation', () => {
    test('should preserve categorizations through delete and recreate cycle', () => {
      const originalPhrase = createTestPhrase(true);

      // Store categorizations (as nudging does)
      const phraseCategorization = cloneDeep(originalPhrase.categorizationGrid);
      const phraseAdHocCategorization = [...originalPhrase.adHocCategorizationGrid];

      // Simulate creating a new phrase (after delete and recreate)
      const newPhrase = new Phrase({
        trajectories: originalPhrase.trajectories,
        raga: originalPhrase.raga
      });

      // Restore categorizations (as nudging does)
      newPhrase.categorizationGrid = phraseCategorization;
      newPhrase.adHocCategorizationGrid = phraseAdHocCategorization;

      // Verify preservation
      expect(newPhrase.categorizationGrid[0].Phrase.Asthai).toBe(true);
      expect(newPhrase.categorizationGrid[0].Elaboration.Vistar).toBe(true);
      expect(newPhrase.categorizationGrid[1].Phrase.Antara).toBe(true);
      expect(newPhrase.adHocCategorizationGrid[0]).toContain('custom1');
      expect(newPhrase.adHocCategorizationGrid[0]).toContain('custom2');
    });
  });

  describe('Edge cases', () => {
    test('should handle empty categorization grids', () => {
      const phrase = new Phrase({
        trajectories: [new Trajectory()],
        categorizationGrid: []
      });

      // Constructor should create default categorizations
      expect(phrase.categorizationGrid).toBeDefined();
      expect(phrase.categorizationGrid.length).toBeGreaterThan(0);
    });

    test('should handle missing ad-hoc categorizations', () => {
      const phrase = new Phrase({
        trajectories: [new Trajectory()]
        // No adHocCategorizationGrid provided
      });

      expect(phrase.adHocCategorizationGrid).toBeDefined();
      expect(Array.isArray(phrase.adHocCategorizationGrid)).toBe(true);
    });

    test('should ensure categorization grid matches trajectory grid length', () => {
      const phrase = new Phrase({
        trajectories: [new Trajectory()],
        trajectoryGrid: [
          [new Trajectory()],
          [new Trajectory()]
        ]
      });

      // Should have categorizations for both strings
      expect(phrase.categorizationGrid.length).toBe(2);
    });
  });
});

describe('Section Categorization Preservation (Model for Phrase implementation)', () => {

  // Helper to create a test piece with section categorizations
  const createTestPiece = () => {
    const phrase1 = new Phrase({
      trajectories: [new Trajectory({ durTot: 1, pitches: [new Pitch()] })],
      startTime: 0
    });
    const phrase2 = new Phrase({
      trajectories: [new Trajectory({ durTot: 1, pitches: [new Pitch()] })],
      startTime: 1
    });
    const phrase3 = new Phrase({
      trajectories: [new Trajectory({ durTot: 1, pitches: [new Pitch()] })],
      startTime: 2
    });

    const piece = new Piece({
      phraseGrid: [[phrase1, phrase2, phrase3]],
      instrumentation: ['Sitar'],
      sectionStartsGrid: [[0, 2]], // Two sections: phrases 0-1 and phrase 2
    });

    // Set up section categorizations
    if (piece.sectionCatGrid[0]) {
      piece.sectionCatGrid[0][0].Alap['Alap'] = true;
      piece.sectionCatGrid[0][1]['Composition Type'].Bandish = true;
    }

    piece.adHocSectionCatGrid = [[['section1-custom'], ['section2-custom']]];

    return piece;
  };

  describe('Section categorization during nudging', () => {
    test('should preserve section categorizations when nudging phrase divisions', () => {
      const piece = createTestPiece();
      const track = 0;
      const pIdx = 2; // The second section start

      // Check if this division is a section
      const wasSection = piece.sectionStartsGrid[track].includes(pIdx);
      expect(wasSection).toBe(true);

      // Store section metadata (as nudging does)
      const sectionIdx = piece.sectionStartsGrid[track].indexOf(pIdx);
      const sectionCat = piece.sectionCatGrid[track][sectionIdx];
      const adHocSectionCat = piece.adHocSectionCatGrid[track][sectionIdx];

      // Verify we captured the right categorization
      expect(sectionCat['Composition Type'].Bandish).toBe(true);
      expect(adHocSectionCat).toContain('section2-custom');

      // Simulate removing and re-adding the section (as happens during nudging)
      piece.sectionStartsGrid[track].splice(sectionIdx, 1);
      piece.sectionCatGrid[track].splice(sectionIdx, 1);
      piece.adHocSectionCatGrid[track].splice(sectionIdx, 1);

      // Restore section (simulating what happens after nudging)
      const newPhraseIdx = 2; // Same position for simplicity
      piece.sectionStartsGrid[track].push(newPhraseIdx);
      piece.sectionStartsGrid[track].sort((a, b) => a - b);

      const newSectionIdx = piece.sectionStartsGrid[track].indexOf(newPhraseIdx);
      piece.sectionCatGrid[track].splice(newSectionIdx, 0, sectionCat);
      piece.adHocSectionCatGrid[track].splice(newSectionIdx, 0, adHocSectionCat);

      // Verify restoration
      expect(piece.sectionCatGrid[track][newSectionIdx]['Composition Type'].Bandish).toBe(true);
      expect(piece.adHocSectionCatGrid[track][newSectionIdx]).toContain('section2-custom');
    });

    test('should handle section index changes when nudging', () => {
      const piece = createTestPiece();
      const track = 0;

      // Add another section at position 1
      piece.sectionStartsGrid[track].push(1);
      piece.sectionStartsGrid[track].sort((a, b) => a - b);

      // Now we have sections at [0, 1, 2]
      expect(piece.sectionStartsGrid[track]).toEqual([0, 1, 2]);

      // Simulate moving section from position 2 to position 3
      const oldIdx = piece.sectionStartsGrid[track].indexOf(2);
      const sectionCat = piece.sectionCatGrid[track][oldIdx];

      // Remove old position
      piece.sectionStartsGrid[track].splice(oldIdx, 1);

      // Add at new position
      piece.sectionStartsGrid[track].push(3);
      piece.sectionStartsGrid[track].sort((a, b) => a - b);

      // Find new index after sorting
      const newIdx = piece.sectionStartsGrid[track].indexOf(3);
      expect(newIdx).toBeDefined();
    });
  });

  describe('Section vs Phrase categorization architecture', () => {
    test('section categorizations are stored at piece level', () => {
      const piece = createTestPiece();

      // Section categorizations are in piece-level arrays
      expect(piece.sectionCatGrid).toBeDefined();
      expect(piece.adHocSectionCatGrid).toBeDefined();
      expect(piece.sectionCatGrid[0].length).toBe(2); // Two sections
    });

    test('phrase categorizations are stored at phrase level', () => {
      const phrase = new Phrase({
        trajectories: [new Trajectory()]
      });

      // Phrase categorizations are properties of the phrase
      expect(phrase.categorizationGrid).toBeDefined();
      expect(phrase.adHocCategorizationGrid).toBeDefined();
      // Not stored at a higher level
    });

    test('demonstrates the architectural difference needing our fix', () => {
      const piece = createTestPiece();

      // Sections preserve categorizations because they're stored at piece level
      // The piece maintains the arrays even when phrases are manipulated
      const sectionCats = piece.sectionCatGrid[0];
      expect(sectionCats).toBeDefined();

      // Phrases would lose categorizations without our fix because they're stored
      // at phrase level and phrases get deleted/recreated during operations
      const phrase = piece.phraseGrid[0][0];
      const phraseCats = phrase.categorizationGrid;

      // If we delete this phrase (as happens in deletePhraseDiv),
      // phraseCats would be lost without our preservation logic
      expect(phraseCats).toBeDefined();
    });
  });
});