/*
 * timeHandler.js
 *
 * This file handles the passage of time (global year) in LifeSim MVP.
 * When the player presses the "+ Year" button the following happens:
 *   - The global simulation year (state.year) is incremented.
 *   - The player's age (state.age) and every other character's age
 *     in the simulation increases by 1.
 *
 * Additionally, when a character dies and a new life begins,
 * the global year is reset to 0.
 *
 * Note: This script assumes that there is a global 'state' object that contains:
 *   - state.year (the global simulation year)
 *   - state.age (the player's age)
 *   - state.town (an array of town characters)
 *   - state.relationships (an array of relationship objects, where each object has a "person" property)
 *   - state.potentialRelationships (an array of potential relationship person objects)
 */

// Increments the global simulation year and updates the age of every character.
function advanceYearAndAges() {
    // Increment the global simulation year.
    state.year++;
    // Increment the player's age.
    state.age++;

    // Update the age for all characters in the simulation.
    updateAllAges();
}

// Updates the age of every person in the simulation.
function updateAllAges() {
    // Helper function to safely increment a person's age.
    function incrementAge(person) {
        if (person && typeof person.age === 'number') {
            person.age++;
        }
    }

    // Update each town character.
    if (state.town && Array.isArray(state.town)) {
        state.town.forEach(person => incrementAge(person));
    }

    // Update each potential relationship character.
    if (state.potentialRelationships && Array.isArray(state.potentialRelationships)) {
        state.potentialRelationships.forEach(person => incrementAge(person));
    }

    // Update each person in your relationships.
    if (state.relationships && Array.isArray(state.relationships)) {
        state.relationships.forEach(rel => {
            incrementAge(rel.person);
        });
    }
}

// Resets the global simulation year (e.g., on a new life).
function resetGlobalYear() {
    state.year = 0;
} 