/*
 * timeHandler.js
 *
 * This file handles the passage of time in RogueLife.
 * It manages three distinct time concepts:
 *
 * 1. Character Age: The age of the current player character
 *    - Increments by 1 each year
 *    - Resets to 0 on death (unless taking over an existing character)
 *
 * 2. Global Year: The current year in the game world
 *    - Increments by 1 each year
 *    - Persists across character deaths
 *    - Stored in localStorage to persist across sessions
 *
 * 3. Total Years Played: Cumulative years across all characters
 *    - Increments by 1 each year
 *    - Never resets
 *    - Stored in localStorage to persist across sessions
 */

// Initialize time tracking on first load
function initializeTimeTracking() {
    // Initialize global year if not already set
    if (!localStorage.getItem('globalYear')) {
        localStorage.setItem('globalYear', '0');
    }
    
    // Initialize total years played if not already set
    if (!localStorage.getItem('totalYearsPlayed')) {
        localStorage.setItem('totalYearsPlayed', '0');
    }
    
    // Log initialization
    console.log('Time tracking initialized:');
    console.log('- Global Year:', getGlobalYear());
    console.log('- Total Years Played:', getTotalYearsPlayed());
}

// Get the current global year
function getGlobalYear() {
    return parseInt(localStorage.getItem('globalYear') || '0');
}

// Set the global year to a specific value
function setGlobalYear(year) {
    if (typeof year !== 'number' || year < 0) {
        console.warn("Invalid year. Please enter a non-negative number.");
        return;
    }
    
    localStorage.setItem('globalYear', year.toString());
    console.log(`Global year set to: ${year}`);
    
    // Update UI if needed
    if (typeof updateUI === 'function') {
        updateUI();
    }
    
    return year;
}

// Get the total years played across all characters
function getTotalYearsPlayed() {
    return parseInt(localStorage.getItem('totalYearsPlayed') || '0');
}

// Increment the total years played
function incrementTotalYearsPlayed() {
    const currentTotal = getTotalYearsPlayed();
    localStorage.setItem('totalYearsPlayed', (currentTotal + 1).toString());
    return currentTotal + 1;
}

// Increments the global simulation year and updates the age of every character.
function advanceYearAndAges() {
    // Increment the global simulation year
    const newGlobalYear = getGlobalYear() + 1;
    setGlobalYear(newGlobalYear);
    
    // Increment the total years played
    incrementTotalYearsPlayed();
    
    // Increment the player's age
    state.age++;
    
    // Update the age for all characters in the simulation
    updateAllAges();
    
    // Log time progression
    console.log(`Advanced time: Year ${newGlobalYear}, Character Age ${state.age}, Total Years Played ${getTotalYearsPlayed()}`);
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

// Resets the global simulation year (e.g., on a new game)
function resetGlobalYear() {
    setGlobalYear(0);
    console.log("Global year reset to 0");
}

// Reset total years played (for debugging or complete game reset)
function resetTotalYearsPlayed() {
    localStorage.setItem('totalYearsPlayed', '0');
    console.log("Total years played reset to 0");
}

// Debug function to display all time-related information
function debugTimeInfo() {
    const timeInfo = {
        characterAge: state.age,
        globalYear: getGlobalYear(),
        totalYearsPlayed: getTotalYearsPlayed(),
        deathCount: parseInt(localStorage.getItem("deathCount") || "0")
    };
    
    console.table(timeInfo);
    return timeInfo;
}

// Call initialization on script load
initializeTimeTracking(); 