// characterGenerator.js

// Arrays for names; you can expand these as needed.
const firstNames = [
    "James", "Emma", "Oliver", "Sophia", "William",
    "Isabella", "Henry", "Charlotte", "Alexander", "Mia",
    "Benjamin", "Amelia", "Lucas", "Harper", "Theodore",
    "Evelyn", "Daniel", "Abigail", "Joseph", "Elizabeth",
    "Samuel", "Sofia", "David", "Victoria", "Andrew"
];

const europeanLastNames = [
    { name: "Smith", origin: "european" },
    { name: "Johnson", origin: "european" },
    { name: "Williams", origin: "european" },
    { name: "Brown", origin: "european" },
    { name: "Jones", origin: "european" },
    { name: "Garcia", origin: "european" },
    { name: "Miller", origin: "european" },
    { name: "Davis", origin: "european" },
    { name: "Rodriguez", origin: "european" },
    { name: "Martinez", origin: "european" },
    { name: "Anderson", origin: "european" },
    { name: "Taylor", origin: "european" },
    { name: "Thomas", origin: "european" },
    { name: "Moore", origin: "european" },
    { name: "Martin", origin: "european" },
    { name: "Jackson", origin: "european" },
    { name: "Thompson", origin: "european" },
    { name: "White", origin: "european" },
    { name: "Lopez", origin: "european" },
    { name: "Lee", origin: "european" },
    { name: "Harris", origin: "european" },
    { name: "Clark", origin: "european" },
    { name: "Lewis", origin: "european" },
    { name: "Robinson", origin: "european" },
    { name: "Walker", origin: "european" }
];

// Helper function to generate a random integer between min and max (inclusive)
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// A very simple unique id generator
function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9);
}

/**
 * Generates a random name
 */
function generateRandomName() {
    const firstName = firstNames[randomInt(0, firstNames.length - 1)];
    const lastName = europeanLastNames[randomInt(0, europeanLastNames.length - 1)].name;
    return `${firstName} ${lastName}`;
}

/**
 * Generates a generic person.
 * This function returns an object with basic traits and stats.
 */
function generatePerson(options = {}) {
    const baseStats = {
        happiness: randomInt(40, 60),
        health: randomInt(40, 60),
        smarts: randomInt(40, 60),
        looks: randomInt(40, 60)
    };

    const personalities = ["Shy", "Outgoing", "Funny", "Serious", "Creative", "Athletic", "Nerdy", "Dramatic"];
    const interests = [
        "Video Games", "Sports", "Art", "Music", 
        "Reading", "Cooking", "Travel", "Science",
        "Photography", "Dancing", "Writing", "Fashion",
        "Technology", "Nature", "Movies", "Theater"
    ];

    // Ensure person has at least one random interest if none provided
    const personInterests = options.interests || [interests[randomInt(0, interests.length - 1)]];

    let person = {
        id: generateUniqueId(),
        name: generateRandomName(),
        age: options.age !== undefined ? options.age : randomInt(5, 25),
        gender: options.gender || (Math.random() < 0.5 ? "Male" : "Female"),
        personality: options.personality || personalities[randomInt(0, personalities.length - 1)],
        interests: personInterests,
        stats: options.stats || baseStats,
        traits: options.traits ? [...options.traits] : [],
        
        // For tracking relationships later on (ids to other characters)
        relationships: {},
        
        // Other properties that you already have.
        job: options.job || null,
        education: options.education || null,
        childhoodMemory: options.childhoodMemory || null,
        favoriteColor: options.favoriteColor || null,
        greatestFear: options.greatestFear || null,
        achievements: [],
        talents: [],
        dreams: null,
        bestFriend: null,
        favoriteSubject: null,
        hobbies: [],
        quirk: options.quirk || null,
        parents: options.parents || null  // a pair of parent ids if applicable
    };

    return person;
}

/**
 * Generates a child using two parents.
 * The child starts at age 0 and may inherit or blend certain traits (customize as needed).
 */
function generateChild(parent1, parent2) {
    // You could later add logic that mixes stats or personality from parent1 & parent2.
    let child = generatePerson({ age: 0 });
    child.parents = [ parent1.id, parent2.id ];
    
    // As an example, inherit a quirk from one of the parents
    child.quirk = Math.random() < 0.5 ? parent1.quirk : parent2.quirk;
    
    return child;
}

/**
 * Generates an enemy with specific traits.
 * Options can be used to tweak personality and stats.
 */
function generateEnemy(options = {}) {
    // Mark enemy with a special trait
    const enemyTraits = options.traits ? [...options.traits] : [];
    enemyTraits.push("Hostile");
    
    // Possibly use a different age range or personality
    return generatePerson({
        personality: options.personality || "Aggressive",
        age: options.age !== undefined ? options.age : randomInt(18, 40),
        traits: enemyTraits,
        interests: options.interests || "Conflict"
    });
}

/**
 * Generates the core pool of characters for the town.
 * Returns an array of characters.
 */
function generateCoreCharacters(count = 40) {
    const characters = [];
    for (let i = 0; i < count; i++) {
        characters.push(generatePerson());
    }
    return characters;
}

// Expose functions globally so that other parts of the game can use them
window.generateRandomName = generateRandomName;
window.generatePerson = generatePerson;
window.generateChild = generateChild;
window.generateEnemy = generateEnemy;
window.generateCoreCharacters = generateCoreCharacters; 