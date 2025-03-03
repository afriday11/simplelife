// Event type definitions
const EventType = {
    SOCIAL: 'social',
    CAREER: 'career',
    HEALTH: 'health',
    EDUCATION: 'education',
    RANDOM: 'random'
};

// Relationship requirements for receivers
const RelationshipRequirement = {
    SPOUSE: 'spouse',
    FRIEND: 'friend',
    FAMILY: 'family',
    STRANGER: 'stranger',
    ANY: 'any'
};

// Helper functions for finding or creating receivers for events
// These functions will be used at event execution time to ensure different receivers

/**
 * Finds a suitable receiver from the town based on criteria
 * @param {Object} criteria - Requirements for the receiver
 * @returns {Object} A person object that matches the criteria
 */
function findReceiver(criteria = {}) {
    // Default criteria
    const defaults = {
        minAge: 0,
        maxAge: 100,
        gender: null,
        relationshipStatus: null,
        minRelationshipLevel: -100,
        personality: null
    };
    
    // Merge defaults with provided criteria
    const mergedCriteria = { ...defaults, ...criteria };
    
    // Filter town members by criteria
    const eligible = state.town.filter(person => {
        // Basic age check
        if (person.age < mergedCriteria.minAge || person.age > mergedCriteria.maxAge) {
            return false;
        }
        
        // Gender check if specified
        if (mergedCriteria.gender && person.gender !== mergedCriteria.gender) {
            return false;
        }
        
        // Personality check if specified
        if (mergedCriteria.personality && person.personality !== mergedCriteria.personality) {
            return false;
        }
        
        // Relationship status check if needed
        if (mergedCriteria.relationshipStatus) {
            const relationship = state.relationships.find(rel => rel.person.id === person.id);
            if (!relationship || relationship.status !== mergedCriteria.relationshipStatus) {
                return false;
            }
            
            // Check relationship level if specified
            if (relationship && mergedCriteria.minRelationshipLevel !== null) {
                if (relationship.level < mergedCriteria.minRelationshipLevel) {
                    return false;
                }
            }
        }
        
        return true;
    });
    
    // If we found eligible people, return a random one
    if (eligible.length > 0) {
        return eligible[Math.floor(Math.random() * eligible.length)];
    }
    
    // If no eligible person found, return null
    return null;
}

/**
 * Creates a new person and adds them to the town
 * @param {Object} attributes - Attributes for the new person
 * @returns {Object} The newly created person
 */
function createAndAddReceiver(attributes = {}) {
    // Generate a new person with the given attributes
    const newPerson = generatePerson(attributes);
    
    // Add to town
    state.town.push(newPerson);
    
    // Return the new person
    return newPerson;
}

/**
 * Finds or creates a receiver based on event requirements
 * @param {Object} event - The event that needs a receiver
 * @returns {Object} A suitable receiver for the event
 */
function getEventReceiver(event) {
    // If the event has a specific receiver requirement, handle it
    if (event.receiverRequirement) {
        switch (event.receiverRequirement) {
            case RelationshipRequirement.SPOUSE:
                // Try to find a spouse
                const spouse = findReceiver({ 
                    relationshipStatus: "married",
                    minAge: Math.max(16, state.age - 20),
                    maxAge: state.age + 20
                });
                
                if (spouse) return spouse;
                break;
                
            case RelationshipRequirement.FRIEND:
                // Try to find a friend
                const friend = findReceiver({ 
                    relationshipStatus: "friend",
                    minAge: Math.max(5, state.age - 10),
                    maxAge: state.age + 10
                });
                
                if (friend) return friend;
                
                // If no friend found, could create one
                const newFriend = createAndAddReceiver({ 
                    age: state.age + Math.floor(Math.random() * 5) - 2,
                    personality: ["Friendly", "Outgoing", "Cheerful"][Math.floor(Math.random() * 3)]
                });
                
                // Add as a friend in relationships
                state.relationships.push({
                    person: newFriend,
                    status: "friend",
                    level: 30 + Math.floor(Math.random() * 20)
                });
                
                return newFriend;
                
            case RelationshipRequirement.FAMILY:
                // Try to find a family member
                const familyMember = findReceiver({ relationshipStatus: "family" });
                if (familyMember) return familyMember;
                break;
                
            case RelationshipRequirement.STRANGER:
                // Try to find a stranger or create one
                const stranger = findReceiver({ 
                    relationshipStatus: "stranger",
                    minAge: Math.max(5, state.age - 20),
                    maxAge: state.age + 20
                });
                
                if (stranger) return stranger;
                
                // Create a new stranger
                const newStranger = createAndAddReceiver({ 
                    age: state.age + Math.floor(Math.random() * 10) - 5
                });
                
                // Add as a stranger in relationships
                state.relationships.push({
                    person: newStranger,
                    status: "stranger",
                    level: 0
                });
                
                return newStranger;
                
            case RelationshipRequirement.ANY:
            default:
                // Try to find any relationship
                const anyRelationship = state.relationships[Math.floor(Math.random() * state.relationships.length)];
                if (anyRelationship) return anyRelationship.person;
                
                // If no relationships, create a stranger
                return getEventReceiver({...event, receiverRequirement: RelationshipRequirement.STRANGER});
        }
    }
    
    // For events with specific age requirements but no relationship requirement
    if (event.requirements) {
        const minAge = event.requirements.minAge || 0;
        const maxAge = event.requirements.maxAge || 100;
        
        // Try to find someone of appropriate age
        const ageAppropriate = findReceiver({ 
            minAge: minAge,
            maxAge: maxAge
        });
        
        if (ageAppropriate) return ageAppropriate;
        
        // Create a new person of appropriate age
        const newPerson = createAndAddReceiver({ 
            age: minAge + Math.floor(Math.random() * (maxAge - minAge + 1))
        });
        
        // Add as a stranger in relationships
                state.relationships.push({
            person: newPerson,
                    status: "stranger",
                    level: 0
                });
                
        return newPerson;
    }
    
    // Default: create a new person of similar age
    const newPerson = createAndAddReceiver({ 
        age: state.age + Math.floor(Math.random() * 10) - 5
    });
    
    // Add as a stranger in relationships
    state.relationships.push({
        person: newPerson,
        status: "stranger",
        level: 0
    });
    
    return newPerson;
}

// Structure for storing past events
class EventHistory {
    constructor() {
        this.events = new Map(); // year -> array of events
    }

    addEvent(year, event) {
        if (!this.events.has(year)) {
            this.events.set(year, []);
        }
        this.events.get(year).push(event);
    }

    getEventsForYear(year) {
        return this.events.get(year) || [];
    }

    hasEventForCharacterInYear(year, characterId) {
        const yearEvents = this.getEventsForYear(year);
        return yearEvents.some(event => 
            event.receiver && event.receiver.id === characterId
        );
    }
}

// Sample events using the new structure
const gameEvents = [  // renamed from 'events' to avoid conflicts

    //Birth event
    {
        id: "birth",
        weight: 100000,  // Very high weight to ensure it happens
        title: "Birth",
        type: EventType.SOCIAL,
        repeatability: "once_per_life",
        requirements: {
            minAge: 0,
            maxAge: 1  // Only at age 0
        },
        description: function(state) {
            // Create parents using the receiver system
            const mom = createAndAddReceiver({ 
                age: 20 + Math.floor(Math.random() * 15),  // Age 20-35
                gender: "Female"
            });
            
            const dad = createAndAddReceiver({
                age: 22 + Math.floor(Math.random() * 15),  // Age 22-37
                gender: "Male"
            });
            
            // Store parents in state's temporary event data
            state._currentEventData = {
                mom: mom,
                dad: dad
            };
            
            return "You are born into this world, your parents are overjoyed.";
        },
        choices: [
            {
                text: "Cry",
                effect: { happiness: 20, smarts: 20, health: 20 },
                result: function(state, event) {
                    // Get parents from state's temporary event data
                    const { mom, dad } = state._currentEventData || {};
                    
                    if (!mom || !dad) {
                        console.error("Parents not found! This shouldn't happen.");
                        return "You are born into this world.";
                    }
                    
                    // Add parents to relationships
                    state.relationships.push(
                        {
                            person: mom,
                            status: "mom",  // Changed from "family" to "mom"
                            level: 80
                        },
                        {
                            person: dad,
                            status: "dad",  // Changed from "family" to "dad"
                            level: 80
                        }
                    );

                    // Clear the temporary event data
                    delete state._currentEventData;

                    return `You are born into this world, your parents are overjoyed. Your mom is ${mom.name} and your dad is ${dad.name}.`;
                }
            }
        ]
    },

    //Tragic accident death event
    {
        id: "tragic_death",
        weight: 100,
        title: "Death",
        repeatability: "once_per_game",  // Using new property instead of repeatable: false
        requirements: {
            minAge: 6,
            minAge: 16,
            maxAge: 25
        },
        description: "You're driving late at night after a party, feeling invincible. Suddenly, a deer jumps onto the road!",
        choices: [
            {
                text: "Swerve to avoid it",
                effect: { health: -100 },
                result: "You swerve sharply to avoid the deer. Your car loses control and rolls several times. The world goes dark...",
                onSelect: (state) => {
                    state.causeOfDeath = "Car accident - lost control while swerving";
                    showDeathModal();
                }
            },
            {
                text: "Hit the brakes",
                effect: { health: -100 },
                result: "You slam on the brakes, but it's too late. The car hits the deer then flips over, crashing into a tree. The world goes dark...",
                onSelect: (state) => {
                    state.causeOfDeath = "Car accident - collision with tree";
                    showDeathModal();
                }
            }
        ]
    },

    // Young Kids (0-5)
    
    // New events for babies (0-1)
    
    // First Laugh Event
    {
        id: "first_laugh",
        weight: 3,
        title: "First Laugh",
        repeatability: "once_per_life",  // Can only happen once per life
        requirements: {
            minAge: 1,
            maxAge: 2
        },
        description: "Your parents make funny faces at you, and suddenly, you let out your very first laugh!",
        effect: { happiness: 15 },
        message: "Your parents cheer and keep doing silly things to make you giggle more. They're delighted!",
        onTrigger: (state) => {
            // Find parents in relationships array and increase level
            state.relationships.forEach(rel => {
                if (rel.status === "family") {
                    rel.level += 10;
                }
            });
        }
    },
    
    // Teething Trouble Event
    {
        id: "teething_trouble",
        weight: 3,
        title: "Teething Trouble",
        repeatability: "once_per_life",  // Can only happen once per life
        requirements: {
            minAge: 1,
            maxAge: 2
        },
        description: "Your first teeth are starting to come in, and it's miserable! You chew on everything in sight.",
        effect: { happiness: -10, health: -5 },
        message: "You cry at night from the discomfort. Your parents try everything to soothe you."
    },
    
    // Crawling Event
    {
        id: "first_crawl",
        weight: 3,
        title: "Crawling for the First Time",
        repeatability: "once_per_life",  // Can only happen once per life
        requirements: {
            minAge: 1,
            maxAge: 1
        },
        description: "After weeks of trying, you finally manage to crawl across the floor!",
        effect: { happiness: 15, health: 5 },
        message: "Your parents cheer and record a video to show the family. You're on the move now!",
        onTrigger: (state) => {
            // Find parents in relationships array and increase level
            state.relationships.forEach(rel => {
                if (rel.status === "family") {
                    rel.level += 10;
                }
            });
            
            // Add motor skills to traits if it doesn't exist
            state.traits = state.traits || [];
            if (!state.traits.includes("Developing Motor Skills")) {
                state.traits.push("Developing Motor Skills");
            }
        }
    },
    
    // Grabbing Everything Event
    {
        id: "grabbing_everything",
        weight: 4,
        title: "Grabbing Everything",
        repeatability: "cooldown",  // Can repeat after a cooldown period
        cooldownYears: 10,           // Must wait 1 year between occurrences
        requirements: {
            minAge: 1,
            maxAge: 1
        },
        description: "You've developed a habit of grabbing whatever is in reach—your parents' glasses, their phone, and even their food!",
        choices: [
            {
                text: "Grab and hold onto your parent's finger",
                effect: { happiness: 10 },
                result: "Your parent smiles as you grip their finger tightly. This sweet moment strengthens your bond.",
                onSelect: (state) => {
                    // Find parents in relationships array and increase level
                    state.relationships.forEach(rel => {
                        if (rel.status === "family") {
                            rel.level += 15;
                        }
                    });
                }
            },
            {
                text: "Yank your parent's glasses off their face",
                effect: { happiness: 5 },
                result: "You grab their glasses with surprising strength! They're a bit annoyed but also impressed.",
                onSelect: (state) => {
                    // Find parents in relationships array and decrease level slightly
                    state.relationships.forEach(rel => {
                        if (rel.status === "family") {
                            rel.level -= 5;
                        }
                    });
                    
                    // Add strength to traits if it doesn't exist
                    state.traits = state.traits || [];
                    if (!state.traits.includes("Developing Strength")) {
                        state.traits.push("Developing Strength");
                    }
                }
            },
            {
                text: "Throw their phone to the ground",
                effect: { happiness: 3, health: -2 },
                result: "CRASH! Their phone hits the floor. Your parents are upset, but you find it hilarious.",
                onSelect: (state) => {
                    // Find parents in relationships array and decrease level
                    state.relationships.forEach(rel => {
                        if (rel.status === "family") {
                            rel.level -= 15;
                        }
                    });
                    
                    // Add chaotic trait if it doesn't exist
                    state.traits = state.traits || [];
                    if (!state.traits.includes("Chaotic")) {
                        state.traits.push("Chaotic");
                    }
                }
            }
        ]
    },
    
    // Refusing to Sleep Event
    {
        id: "refusing_sleep",
        weight: 4,
        title: "Refusing to Sleep",
        repeatability: "cooldown",  // Can repeat after a cooldown period
        cooldownYears: 1,           // Must wait 1 year between occurrences
        requirements: {
            minAge: 1,
            maxAge: 3
        },
        description: "Your parents rock you back and forth, hoping to lull you to sleep. But you don't feel tired at all!",
        choices: [
            {
                text: "Give in and sleep",
                effect: { health: 15, happiness: 5 },
                result: "You drift off to sleep peacefully. Your parents are relieved and get some much-needed rest too.",
                onSelect: (state) => {
                    // Find parents in relationships array and increase level
                    state.relationships.forEach(rel => {
                        if (rel.status === "family") {
                            rel.level += 10;
                        }
                    });
                }
            },
            {
                text: "Cry until they stay up with you",
                effect: { health: -5, happiness: 3 },
                result: "Your parents take turns staying up with you. They're exhausted, but you get extra attention.",
                onSelect: (state) => {
                    // Find parents in relationships array and decrease level slightly
                    state.relationships.forEach(rel => {
                        if (rel.status === "family") {
                            rel.level -= 10;
                        }
                    });
                    
                    // Add brave trait if it doesn't exist
                    state.traits = state.traits || [];
                    if (!state.traits.includes("Brave")) {
                        state.traits.push("Brave");
                    }
                }
            },
            {
                text: "Wail at the top of your lungs for an hour",
                effect: { health: -10, happiness: -5 },
                result: "You scream until you're red in the face. Your parents try everything but nothing works.",
                onSelect: (state) => {
                    // Find parents in relationships array and decrease level
                    state.relationships.forEach(rel => {
                        if (rel.status === "family") {
                            rel.level -= 20;
                        }
                    });
                    
                    // Add stubborn trait if it doesn't exist
                    state.traits = state.traits || [];
                    if (!state.traits.includes("Stubborn")) {
                        state.traits.push("Stubborn");
                    }
                }
            }
        ]
    },

    {
        id: "first_words",
        weight: 3,
        title: "First Words",
        repeatability: "once_per_life",  // Can only happen once per life
        requirements: {
            minAge: 2,
            maxAge: 3,
            minSmarts: 5  // Basic cognitive development
        },
        description: "You are about to say your first word! What will it be?",
        choices: [
            {
                text: "\"Mama\"",
                effect: { happiness: 10, smarts: 5 },
                result: "Your mother is overjoyed! This strengthens your bond with her.",
                onSelect: (state) => {
                    // Find mom in relationships array and increase level
                    const momRelationship = state.relationships.find(rel => 
                        rel.status === "family" && rel.person.gender === "Female"
                    );
                    if (momRelationship) {
                        momRelationship.level += 25;
                    }
                }
            },
            {
                text: "\"Dada\"",
                effect: { happiness: 10, smarts: 5 },
                result: "Your father beams with pride! This strengthens your bond with him.",
                onSelect: (state) => {
                    // Find dad in relationships array and increase level
                    const dadRelationship = state.relationships.find(rel => 
                        rel.status === "family" && rel.person.gender === "Male"
                    );
                    if (dadRelationship) {
                        dadRelationship.level += 25;
                    }
                }
            },
            {
                text: "\"No!\"",
                effect: { happiness: 5, smarts: 8 },
                result: "Your parents are surprised by your assertiveness! You're developing quite the personality.",
                onSelect: (state) => {
                    state.traits = state.traits || [];
                    state.traits.push("Independent");
                }
            }
        ]
    },

    // Daycare Sharing Event
    {
        id: "sharing_is_caring",
        weight: 4,
        title: "Sharing is Caring",
        repeatability: "once_per_life",  // Can only happen once per life
        requirements: {
            minAge: 2,
            maxAge: 4,
            minHappiness: 20
        },
        description: "At daycare, another child asks to borrow your favorite toy. What do you do?",
        choices: [
            {
                text: "Share the toy",
                effect: { happiness: 8, smarts: 5 },
                result: "The other child is happy! You've made your first friend at daycare!",
                onSelect: (state) => {
                    const newFriend = generatePerson();
                    newFriend.age = state.age;
                    state.relationships.push({
                        person: newFriend,
                        status: "friend",
                        level: 20
                    });
                    state.traits = state.traits || [];
                    state.traits.push("Generous");
                }
            },
            {
                text: "Politely say no",
                effect: { happiness: -2, smarts: 3 },
                result: "You kept your toy but missed a chance to make a friend.",
                onSelect: (state) => {
                    state.traits = state.traits || [];
                    state.traits.push("Reserved");
                }
            },
            {
                text: "Have a tantrum",
                effect: { happiness: -5, health: -2, looks: -1 },
                result: "The teachers had to calm you down. Your parents were called.",
                onSelect: (state) => {
                    state.traits = state.traits || [];
                    state.traits.push("Temperamental");
                }
            }
        ]
    },

    // First Play Event
    {
        id: "school_play",
        weight: 3,
        title: "School Play Opportunity",
        repeatability: "cooldown",  // Can repeat after a cooldown period
        cooldownYears: 2,           // Must wait 2 years between plays
        requirements: {
            minAge: 4,
            maxAge: 6,
            minHappiness: 30,
            minSmarts: 20
        },
        description: "Your preschool is putting on a play! The teacher asks if you want to participate.",
        choices: [
            {
                text: "Enthusiastically join",
                effect: { happiness: 10, smarts: 5, looks: 3 },
                result: "You had so much fun performing! Everyone loved your role as a dancing tree!",
                onSelect: (state) => {
                    state.traits = state.traits || [];
                    state.traits.push("Outgoing");
                    // Add some friends from the play
                    const castMember1 = generatePerson();
                    const castMember2 = generatePerson();
                    castMember1.age = state.age;
                    castMember2.age = state.age;
                    state.relationships.push(
                        {
                            person: castMember1,
                            status: "friend",
                            level: 15
                        },
                        {
                            person: castMember2,
                            status: "friend",
                            level: 15
                        }
                    );
                }
            },
            {
                text: "Nervously decline",
                effect: { happiness: -3, smarts: 2 },
                result: "You watched from the audience. Maybe next time you'll be braver.",
                onSelect: (state) => {
                    state.traits = state.traits || [];
                    state.traits.push("Shy");
                }
            },
            {
                text: "Hide in the bathroom",
                effect: { happiness: -5, smarts: -2 },
                result: "The teacher found you eventually. Your anxiety about performing is noted.",
                onSelect: (state) => {
                    state.traits = state.traits || [];
                    state.traits.push("Anxious");
                    state.stats.happiness = Math.max(0, state.stats.happiness - 5);
                }
            }
        ]
    },
    
    // New simple events for children aged 5-10
    
    // Imaginary Friend Event
    {
        id: "imaginary_friend",
        weight: 3,
        title: "Imaginary Friend Appears",
        repeatability: "once_per_life",  // Can only happen once per life
        requirements: {
            minAge: 5,
            maxAge: 10
        },
        description: function() {
            const names = ["Bloo", "Sparkles", "Mr. Whiskers", "Captain Awesome", "Fluffy", "Zap", "Bubbles"];
            const randomName = names[Math.floor(Math.random() * names.length)];
            this.friendName = randomName;
            return `You start spending a lot of time talking to your imaginary friend, ${randomName}. Your parents are amused but a little concerned.`;
        },
        effect: { happiness: 15, smarts: -3 },
        message: function() {
            return `${this.friendName} becomes your constant companion, taking you on amazing adventures in your mind.`;
        },
        onTrigger: (state) => {
            state.traits = state.traits || [];
            if (!state.traits.includes("Creative")) {
                state.traits.push("Creative");
            }
        }
    },
    
    // First Day of School Event
    {
        id: "first_day_school",
        weight: 30,
        title: "First Day of School Jitters",
        repeatability: "once_per_life",  // Can only happen once per life
        requirements: {
            minAge: 5,
            maxAge: 6
        },
        description: "You feel nervous on your first day of school, avoiding eye contact and keeping to yourself. By the end of the day, you manage to say a few words to a classmate.",
        effect: { happiness: -5, smarts: 5 },
        message: "Despite your nervousness, you made it through your first day of school. This is a big milestone!",
        onTrigger: (state) => {
            // Create a new classmate as an acquaintance
            const newClassmate = generatePerson();
            newClassmate.age = state.age;
            state.relationships.push({
                person: newClassmate,
                status: "acquaintance",
                level: 10
            });
            
            // Add social skills trait
            state.traits = state.traits || [];
            if (!state.traits.includes("Developing Social Skills")) {
                state.traits.push("Developing Social Skills");
            }
        }
    },
    
    // Bedtime Monster Event
    {
        id: "bedtime_monster",
        weight: 3,
        title: "Bedtime Monster Panic",
        repeatability: "cooldown",  // Can repeat after a cooldown period
        cooldownYears: 2,           // Must wait 2 years between occurrences
        requirements: {
            minAge: 5,
            maxAge: 10
        },
        description: "You wake up in the middle of the night convinced there's a monster under your bed. After hiding under the covers for what feels like hours, you finally fall back asleep.",
        effect: { happiness: -8, health: -3 },
        message: "The monster under your bed seemed so real! You're tired from lack of sleep the next day.",
        onTrigger: (state) => {
            // Find parents in relationships array and increase level (they comforted you)
            state.relationships.forEach(rel => {
                if (rel.status === "family") {
                    rel.level += 5;
                }
            });
            
            // Add fearful trait if it doesn't exist
            state.traits = state.traits || [];
            if (!state.traits.includes("Fearful")) {
                state.traits.push("Fearful");
            }
        }
    },
    
    // Lost in Store Event
    {
        id: "lost_in_store",
        weight: 2,
        title: "Lost in the Grocery Store",
        repeatability: "once_per_life",  // Can only happen once per life
        requirements: {
            minAge: 5,
            maxAge: 10
        },
        description: "You lose sight of your parents in the grocery store and start to panic. Just as tears start welling up in your eyes, they find you and reassure you everything is okay.",
        effect: { happiness: -10, health: -2 },
        message: "Being lost was terrifying, but the relief when your parents found you was overwhelming.",
        onTrigger: (state) => {
            // Find parents in relationships array and increase level (they rescued you)
            state.relationships.forEach(rel => {
                if (rel.status === "family") {
                    rel.level += 15;
                }
            });
        }
    },
    
    // School Prize Event
    {
        id: "school_prize",
        weight: 3,
        title: "Winning a School Prize",
        repeatability: "cooldown",  // Can repeat after a cooldown period
        cooldownYears: 2,           // Must wait 2 years between prizes
        requirements: {
            minAge: 6,
            maxAge: 10,
            minSmarts: 30
        },
        description: function() {
            const achievements = [
                "your creative writing story", 
                "your science project", 
                "your math skills", 
                "your artwork", 
                "your reading progress",
                "your kindness to others"
            ];
            const randomAchievement = achievements[Math.floor(Math.random() * achievements.length)];
            this.achievement = randomAchievement;
            
            return `You win a small award at school for ${randomAchievement}! Your teacher praises you, and your parents proudly hang the certificate on the fridge.`;
        },
        effect: { happiness: 20, smarts: 10 },
        message: function() {
            return `Your achievement in ${this.achievement} has boosted your confidence and made your parents proud!`;
        },
        onTrigger: (state) => {
            // Find parents in relationships array and increase level (they're proud)
            state.relationships.forEach(rel => {
                if (rel.status === "family") {
                    rel.level += 10;
                }
            });
            
            // Add achievement-based trait
            state.traits = state.traits || [];
            if (!state.traits.includes("Accomplished")) {
                state.traits.push("Accomplished");
            }
        }
    },
    
    // New events for kids ages 5-12
    
    // Classroom Talent Show Event
    {
        id: "classroom_talent_show",
        weight: 3,
        title: "Classroom Talent Show",
        repeatability: "cooldown",  // Can repeat after a cooldown period
        cooldownYears: 3,           // Must wait 3 years between talent shows
        requirements: {
            minAge: 5,
            maxAge: 12
        },
        description: "Your teacher announces a class talent show! Everyone is encouraged to perform something.",
        choices: [
            {
                text: "Sing a song!",
                effect: { happiness: 10, looks: 5 },
                result: "Your singing impresses everyone! You feel more confident after your performance.",
                onSelect: (state) => {
                    // Add confidence trait if it doesn't exist
                    state.traits = state.traits || [];
                    if (!state.traits.includes("Confident")) {
                        state.traits.push("Confident");
                    }
                    
                    // 50% chance to gain a childhood friend
                    if (Math.random() > 0.5) {
                        const newFriend = generatePerson();
                        newFriend.age = state.age;
                        state.relationships.push({
                            person: newFriend,
                            status: "friend",
                            level: 25
                        });
                        return "Your singing impresses everyone! A classmate named " + newFriend.name + " compliments your performance, and you become friends.";
                    }
                }
            },
            {
                text: "Do a silly dance!",
                effect: { happiness: 15, health: 3 },
                result: "Your dance makes everyone laugh! You have a great time, though some kids might be laughing at you rather than with you.",
                onSelect: (state) => {
                    // 30% chance of being teased
                    if (Math.random() < 0.3) {
                        state.stats.happiness = Math.max(0, state.stats.happiness - 5);
                        return "Your dance makes most people laugh, but a few kids tease you afterward. Still, you had fun!";
                    }
                }
            },
            {
                text: "Refuse to participate.",
                effect: { happiness: -5 },
                result: "You sit out while everyone else performs. You feel a bit left out.",
                onSelect: (state) => {
                    // Add shy trait if it doesn't exist
                    state.traits = state.traits || [];
                    if (!state.traits.includes("Shy")) {
                        state.traits.push("Shy");
                    }
                }
            }
        ]
    },
    
    // Trouble on the Playground Event
    {
        id: "playground_trouble",
        weight: 3,
        title: "Trouble on the Playground",
        repeatability: "cooldown",  // Can repeat after a cooldown period
        cooldownYears: 2,           // Must wait 2 years between playground incidents
        requirements: {
            minAge: 5,
            maxAge: 12
        },
        description: "A bigger kid is pushing other students around on the playground. You witness them shoving a classmate to the ground.",
        choices: [
            {
                text: "Stand up to them.",
                effect: { happiness: 5, health: -3 },
                result: function() {
                    // 50% chance of making friend with bullied kid
                    if (Math.random() > 0.5) {
                        const newFriend = generatePerson();
                        newFriend.age = state.age;
                        state.relationships.push({
                            person: newFriend,
                            status: "friend",
                            level: 30
                        });
                        return "You bravely confront the bully. The kid who was pushed, " + newFriend.name + ", is grateful and becomes your friend.";
                    } else {
                        // 30% chance of getting in trouble
                        if (Math.random() < 0.3) {
                            return "You stand up to the bully, but a teacher sees you arguing and you both get in trouble. Still, you feel good about doing the right thing.";
                        } else {
                            return "You stand up to the bully, who backs down. The other kids look at you with newfound respect.";
                        }
                    }
                },
                onSelect: (state) => {
                    // Add brave trait if it doesn't exist
                    state.traits = state.traits || [];
                    if (!state.traits.includes("Brave")) {
                        state.traits.push("Brave");
                    }
                }
            },
            {
                text: "Tell the teacher.",
                effect: { happiness: 3 },
                result: function() {
                    // 20% chance bully targets you next
                    if (Math.random() < 0.2) {
                        state.stats.happiness = Math.max(0, state.stats.happiness - 5);
                        return "You tell the teacher, who stops the bullying. However, the bully figures out it was you who told and gives you mean looks.";
                    } else {
                        return "You tell the teacher, who quickly intervenes. The bullied student gives you a grateful smile.";
                    }
                },
                onSelect: (state) => {
                    // Add moral trait if it doesn't exist
                    state.traits = state.traits || [];
                    if (!state.traits.includes("Moral")) {
                        state.traits.push("Moral");
                    }
                }
            },
            {
                text: "Ignore it and keep playing.",
                effect: { happiness: 0 },
                result: "You pretend not to see and continue playing. You feel a little guilty, but at least you stayed out of trouble.",
                onSelect: (state) => {
                    // Add cautious trait if it doesn't exist
                    state.traits = state.traits || [];
                    if (!state.traits.includes("Cautious")) {
                        state.traits.push("Cautious");
                    }
                }
            }
        ]
    },
    
    // Birthday Party Invite Event
    {
        id: "birthday_party_invite",
        weight: 3,
        title: "Birthday Party Invite",
        repeatability: "cooldown",  // Can repeat after a cooldown period
        cooldownYears: 2,           // Must wait 2 years between party invites
        requirements: {
            minAge: 5,
            maxAge: 12
        },
        description: "A classmate invites you to their birthday party, but you don't know them very well.",
        choices: [
            {
                text: "Go and try to make new friends!",
                effect: { happiness: 15 },
                result: function() {
                    // 70% chance to make a new friend
                    if (Math.random() < 0.7) {
                        const newFriend = generatePerson();
                        newFriend.age = state.age;
                        state.relationships.push({
                            person: newFriend,
                            status: "friend",
                            level: 20
                        });
                        return "You have a great time at the party! You meet " + newFriend.name + " and become friends.";
                    } else {
                        return "You have a fun time at the party! The cake was delicious, and the games were exciting.";
                    }
                },
                onSelect: (state) => {
                    // Add social trait if it doesn't exist
                    state.traits = state.traits || [];
                    if (!state.traits.includes("Social")) {
                        state.traits.push("Social");
                    }
                }
            },
            {
                text: "Politely decline.",
                effect: { happiness: 0 },
                result: "You politely tell your classmate you can't make it. They seem a little disappointed but understand."
            },
            {
                text: "Tell your parents you don't want to go because you think it will be boring.",
                effect: { happiness: -5 },
                result: "Your parents try to convince you to go, but you refuse. Later, you hear about how fun the party was and feel a bit left out.",
                onSelect: (state) => {
                    // Create a relationship with the classmate if it doesn't exist
                    const classmate = generatePerson();
                    classmate.age = state.age;
                    state.relationships.push({
                        person: classmate,
                        status: "acquaintance",
                        level: -5
                    });
                }
            }
        ]
    },
    
    // Lost in the Grocery Store Event
    {
        id: "lost_in_grocery_store",
        weight: 3,
        title: "Lost in the Grocery Store",
        repeatability: "once_per_life",  // Can only happen once per life
        requirements: {
            minAge: 5,
            maxAge: 10
        },
        description: "While shopping with your parents, you look away for a second, and suddenly they're gone!",
        choices: [
            {
                text: "Stay calm and look for them.",
                effect: { happiness: -3, smarts: 5 },
                result: "You remain calm and walk through the aisles looking for your parents. After a few minutes, you find them looking worried.",
                onSelect: (state) => {
                    // Find parents in relationships array and increase level slightly
                    state.relationships.forEach(rel => {
                        if (rel.status === "family") {
                            rel.level += 5;
                        }
                    });
                }
            },
            {
                text: "Ask a store employee for help.",
                effect: { happiness: -2, smarts: 10 },
                result: "You find a store employee and explain that you're lost. They make an announcement, and your parents quickly come to find you. They praise your maturity.",
                onSelect: (state) => {
                    // Find parents in relationships array and increase level
                    state.relationships.forEach(rel => {
                        if (rel.status === "family") {
                            rel.level += 15;
                        }
                    });
                    
                    // Add mature trait if it doesn't exist
                    state.traits = state.traits || [];
                    if (!state.traits.includes("Mature")) {
                        state.traits.push("Mature");
                    }
                }
            },
            {
                text: "Panic and start crying.",
                effect: { happiness: -10, health: -2 },
                result: "You burst into tears, attracting the attention of nearby shoppers. Your parents hear you crying and quickly find you.",
                onSelect: (state) => {
                    // Find parents in relationships array and increase level (they comforted you)
                    state.relationships.forEach(rel => {
                        if (rel.status === "family") {
                            rel.level += 10;
                        }
                    });
                    
                    // Add fearful trait if it doesn't exist
                    state.traits = state.traits || [];
                    if (!state.traits.includes("Fearful")) {
                        state.traits.push("Fearful");
                    }
                }
            }
        ]
    },
    
    // Drawing on the Walls Event
    {
        id: "drawing_on_walls",
        weight: 3,
        title: "Drawing on the Walls",
        repeatability: "once_per_life",  // Can only happen once per life
        requirements: {
            minAge: 5,
            maxAge: 8
        },
        description: "You get the urge to create a masterpiece… on the living room wall.",
        choices: [
            {
                text: "Use paper instead!",
                effect: { happiness: 5, smarts: 5 },
                result: "You resist the temptation and draw on paper instead. Your parents praise your good decision.",
                onSelect: (state) => {
                    // Find parents in relationships array and increase level
                    state.relationships.forEach(rel => {
                        if (rel.status === "family") {
                            rel.level += 10;
                        }
                    });
                    
                    // Add creative trait if it doesn't exist
                    state.traits = state.traits || [];
                    if (!state.traits.includes("Creative")) {
                        state.traits.push("Creative");
                    }
                }
            },
            {
                text: "Do it and try to blame your sibling.",
                effect: { happiness: 3, smarts: -5 },
                result: function() {
                    // Check if we have siblings
                    const siblings = state.relationships.filter(rel => 
                        rel.status === "family" && rel.person.age < 18 && rel.person.age > 0
                    );
                    
                    if (siblings.length > 0) {
                        const sibling = siblings[0];
                        
                        // 50% chance of getting caught
                        if (Math.random() < 0.5) {
                            // Find parents in relationships array and decrease level
                            state.relationships.forEach(rel => {
                                if (rel.status === "family" && rel.person.age >= 18) {
                                    rel.level -= 15;
                                }
                            });
                            
                            return "You draw on the wall and blame " + sibling.person.name + ", but your parents don't believe you. You get in trouble for both drawing and lying.";
                        } else {
                            // Sibling takes the blame
                            const siblingRel = state.relationships.find(rel => rel.person.id === sibling.person.id);
                            if (siblingRel) {
                                siblingRel.level += 5; // Oddly, this might strengthen your bond
                            }
                            
                            return "You draw on the wall and blame " + sibling.person.name + ". They get in trouble, and you feel a mix of guilt and relief.";
                        }
                    } else {
                        // No siblings to blame
                        // Find parents in relationships array and decrease level
                        state.relationships.forEach(rel => {
                            if (rel.status === "family" && rel.person.age >= 18) {
                                rel.level -= 20;
                            }
                        });
                        
                        return "You draw on the wall and try to blame an imaginary sibling. Your parents are not amused by your creativity in this case.";
                    }
                }
            },
            {
                text: "Go all out with crayons and markers!",
                effect: { happiness: 10, smarts: -3 },
                result: "Your wall masterpiece is impressive but short-lived. Your parents are not happy about the cleanup.",
                onSelect: (state) => {
                    // Find parents in relationships array and decrease level
                    state.relationships.forEach(rel => {
                        if (rel.status === "family" && rel.person.age >= 18) {
                            rel.level -= 25;
                        }
                    });
                    
                    // Deduct money if applicable (representing allowance loss)
                    if (state.money >= 50) {
                        state.money -= 50;
                    }
                    
                    // Add artistic trait if it doesn't exist
                    state.traits = state.traits || [];
                    if (!state.traits.includes("Artistic")) {
                        state.traits.push("Artistic");
                    }
                }
            }
        ]
    },
    
    // Get a paper route and earn $100 a week
    {
        id: "paper_route",
        weight: 3,
        title: "Paper Route",
        repeatability: "once_per_life",  // Can only happen once per life
        requirements: {
            minAge: 6,
            maxAge: 16,
            minMoney: 100
        },
        description: "You get a paper route and earn $50 a week.",
        choices: [
            {
                text: "Accept the paper route",
                effect: { money: 2500 },
                result: "You earned $2,500 from your paper route.  You're a paper route legend!"
            }
        ]
    },        
    
    // Grandma dies and leaves you $5,000
    {
        id: "grandma_legacy",
        weight: 3,
        title: "Grandma's Legacy",
        repeatability: "once_per_game",  // Can only happen once per game (across all lives)
        requirements: {
            minAge: 2,
            maxAge: 35,
            maxMoney: 50000
        },
        description: "Your grandma died and left you $5,000.",
        choices: [
            {
                text: "Invest it in the stock market",
                effect: { money: 8000 },
                result: "You invested in the stock market and made $8,000."
            },
            {
                text: "Donate it to charity in Grannies Honor",
                effect: { happiness: 15, health: 5 },
                result: "You donated the money to charity in Grannies Honor.  You feel good about yourself."
            },
            {
                text: "Buy a new car",
                effect: { money: 0 },
                result: "You bought a used car.  Thanks Grandma!"
            }
        ]
    },    
    // Elementry School Events (age 6-11)

    // Spelling Bee Event
    {
        id: "spelling_bee",
        weight: 2,
        title: "Spelling Bee",
        repeatability: "cooldown",  // Can repeat after a cooldown period
        cooldownYears: 3,           // Must wait 3 years between spelling bees
        requirements: {
            minAge: 6,
            maxAge: 11,
            minSmarts: 20
        },
        description: "You're participating in a spelling bee! Which of these words is spelled correctly?",
        choices: [
            {
                text: "Spell 'Antidisestablishmentarianism'",
                effect: { smarts: 10, happiness: 5 },
                result: "You spelled it correctly! Everyone is impressed by your vocabulary."
            },
            {
                text: "Spell 'Floccinaucinihilipilification'",
                effect: { smarts: -5, happiness: -2 },
                result: "Oops, that's not quite right. Better luck next time!"
            },
            {
                text: "Spell 'Pneumonoultramicroscopicsilicovolcanoconiosis'",
                effect: { smarts: -5, happiness: -2 },
                result: "That's a tough one! Don't worry, you'll get it next time."
            }
        ]
    },

    // Perfect Attendance Event
    {
        id: "perfect_attendance",
        weight: 1,
        title: "Perfect Attendance",
        repeatability: "once_per_life",  // Can happen once per life
        requirements: {
            minAge: 6,
            maxAge: 11
        },
        description: "You've achieved perfect attendance this year!",
        effect: { happiness: 10, smarts: 5 },
        message: "Your dedication to school is commendable. Keep it up!"
    },

    // Join Travel Soccer Team
    {
        id: "travel_soccer",
        weight: 2,
        title: "Travel Soccer Team",
        repeatability: "once_per_life",  // Can only happen once per life
        requirements: {
            minAge: 6,
            maxAge: 11,
            minHealth: 30
        },
        description: "The travel soccer team is looking for new players. Do you want to join?",
        choices: [
            {
                text: "Join the team",
                effect: { health: 10, happiness: 10 },
                result: "You joined the team and made new friends while staying active!",
                onSelect: (state) => {
                    const newFriend = generatePerson();
                    state.relationships.push({
                        person: newFriend,
                        status: "friend",
                        level: 20
                    });
                }
            },
            {
                text: "Focus on studies instead",
                effect: { smarts: 5 },
                result: "You decided to focus on your studies. Your grades improved!"
            }
        ]
    },

    // Learn to Ride a Bicycle
    {
        id: "learn_bicycle",
        weight: 1,
        title: "Learn to Ride a Bicycle",
        repeatability: "once_per_life",  // Can only happen once per life
        requirements: {
            minAge: 6,
            maxAge: 11
        },
        description: "You learned to ride a bicycle!",
        effect: { happiness: 15, health: 5 },
        message: "Riding a bike is so much fun! You feel a sense of freedom."
    },

    // School Science Club
    {
        id: "science_club",
        weight: 2,
        title: "School Science Club",
        repeatability: "once_per_life",  // Can only happen once per life
        requirements: {
            minAge: 6,
            maxAge: 11,
            minSmarts: 20
        },
        description: "The science club is looking for new members. Do you want to join?",
        choices: [
            {
                text: "Join the science club",
                effect: { smarts: 10, happiness: 5 },
                result: "You joined the science club and made a new friend!",
                onSelect: (state) => {
                    const newFriend = generatePerson();
                    state.relationships.push({
                        person: newFriend,
                        status: "friend",
                        level: 20
                    });
                }
            },
            {
                text: "Not interested",
                effect: { happiness: -2 },
                result: "You decided not to join the science club. Maybe next time!"
            }
        ]
    },

    // Hobby Discovery Event
    {
        id: "new_hobby",
        weight: 1,
        title: "New Hobby",
        repeatability: "cooldown",  // Can repeat after a cooldown period
        cooldownYears: 4,           // Must wait 4 years between new hobbies
        maxOccurrences: 5,          // Can only discover 5 hobbies in a lifetime
        requirements: {
            minAge: 12,
            maxAge: 90,
            minHappiness: 30
        },
        description: "You have some free time. What would you like to try?",
        choices: [
            {
                text: "Start collecting rare bugs",
                effect: { happiness: 5, smarts: 8, health: -2 },
                result: "You've become fascinated with entomology! Your parents are less excited about the bugs in jars.",
                onSelect: (state) => { state.hobbies.push("Bug collecting") }
            },
            {
                text: "Learn magic tricks",
                effect: { happiness: 8, looks: 5, smarts: 3 },
                result: "You're becoming quite the entertainer! Your card tricks are actually impressive.",
                onSelect: (state) => { state.hobbies.push("Magic tricks") }
            },
            {
                text: "Start a rock band",
                effect: { happiness: 10, health: -3, looks: 5 },
                result: "Your garage band isn't great, but you're having the time of your life!",
                onSelect: (state) => { state.hobbies.push("Playing music") }
            }
        ]
    },

    // Sickness Event
    {
        id: "feeling_sick",
        weight: 1,
        title: "Feeling Sick",
        repeatability: "cooldown",  // Can repeat after a cooldown period
        cooldownYears: 2,           // Must wait 2 years between sicknesses
        requirements: {
            minAge: 16,
            maxAge: 100,
            minHealth: 40
        },
        description: "You're not feeling well. What do you do?",
        choices: [
            {
                text: "Ignore it and go to school/work anyway",
                effect: { health: -15, happiness: -10, smarts: 2 },
                result: "You pushed through but got much sicker. Not your best decision.",
                onSelect: (state) => { state.achievements.push("Iron Will") }
            },
            {
                text: "Take medicine and rest",
                effect: { health: -5, happiness: -3 },
                result: "You recovered after a few days of rest.",
                onSelect: null
            },
            {
                text: "Try grandma's secret remedy",
                effect: { health: -8, happiness: 5 },
                result: "It tasted horrible but somehow made you feel better... eventually.",
                onSelect: null
            }
        ]
    },

    // Exam Cheating Event
    {
        id: "difficult_exam",
        weight: 2,
        title: "Difficult Exam",
        repeatability: "cooldown",  // Can repeat after a cooldown period
        cooldownYears: 3,           // Must wait 3 years between difficult exams
        requirements: {
            minAge: 16,
            maxAge: 25,
            minSmarts: 50,
            minHappiness: 30
        },
        description: "You're struggling with a really important exam. What do you do?",
        choices: [
            {
                text: "Study all night",
                effect: { smarts: 15, health: -5, happiness: -3 },
                result: "You aced the exam but you're exhausted!",
                onSelect: (state) => { state.achievements.push("Academic Excellence") }
            },
            {
                text: "Try to peek at your neighbor's answers",
                effect: { smarts: -5, happiness: -10 },
                result: "You got caught cheating. This will have consequences...",
                onSelect: (state) => { state.achievements.push("Caught Cheating") }
            },
            {
                text: "Write answers on your water bottle",
                effect: { happiness: -5 },
                result: "You got away with it, but the guilt is eating at you.",
                onSelect: null
            }
        ]
    },

    // Love Event
    {
        id: "crush_alert",
        weight: 1,
        title: "Crush Alert",
        repeatability: "cooldown",  // Can repeat after a cooldown period
        cooldownYears: 2,           // Must wait 2 years between crushes
        requirements: {
            minAge: 13,
            maxAge: 80,
            isSingle: true,
            minHappiness: 30
        },
        description: "Someone special has caught your eye. How do you approach them?",
        choices: [
            {
                text: "Write a romantic poem",
                effect: { happiness: 10, smarts: 5, looks: -2 },
                result: "They were touched by your creativity! A beautiful relationship begins.",
                onSelect: (state) => {
                    state.relationships.push({
                        person: generatePerson(),
                        status: "dating",
                        level: 50
                    });
                }
            },
            {
                text: "Try to impress them with sports",
                effect: { health: 8, happiness: 5, looks: 5 },
                result: "You showed off your athletic skills and caught their attention!",
                onSelect: (state) => {
                    state.relationships.push({
                        person: generatePerson(),
                        status: "dating",
                        level: 50
                    });
                }
            },
            {
                text: "Ask their friends about them",
                effect: { happiness: -5 },
                result: "They found out you were asking about them. How embarrassing!",
                onSelect: null
            }
        ]
    },

    // Dream Job Event
    {
        id: "career_opportunity",
        weight: 1,
        title: "Career Opportunity",
        repeatability: "once_per_life",  // Can only happen once per life
        description: "Multiple job offers! Which path do you choose?",
        requirements: {
            minAge: 18,
            maxAge: 65,
            minHappiness: 30
        },
        choices: [
            {
                text: "Tech startup CEO",
                effect: { happiness: 15, smarts: 10, health: -8 },
                result: "You're leading a promising startup! The stress is intense but so is the excitement.",
                onSelect: (state) => { state.job = "Tech Startup CEO" }
            },
            {
                text: "Professional food critic",
                effect: { happiness: 12, health: -5, looks: -3 },
                result: "You're living the dream, trying the best restaurants in town!",
                onSelect: (state) => { state.job = "Food Critic" }
            },
            {
                text: "International spy",
                effect: { happiness: 8, health: -2, smarts: 15 },
                result: "Your life is now filled with intrigue and adventure!",
                onSelect: (state) => { state.job = "Government Agent" }
            }
        ]
    },

    // Workout Event
    {
        id: "fitness_journey",
        weight: 1,
        title: "Fitness Journey",
        repeatability: "cooldown",  // Can repeat after a cooldown period
        cooldownYears: 3,           // Must wait 3 years between fitness journeys
        requirements: {
            minAge: 12,
            maxAge: 80,
            minHealth: 20,
            minHappiness: 30
        },
        description: "You want to get in shape. Which unusual method do you try?",
        choices: [
            {
                text: "Underwater basket weaving aerobics",
                effect: { health: 12, looks: 8, happiness: 5 },
                result: "This weird workout actually worked! You're in great shape!",
                onSelect: (state) => {
                    state.hobbies = state.hobbies || [];
                    state.hobbies.push("Underwater Aerobics");
                }
            },
            {
                text: "Extreme dog walking",
                effect: { health: 15, happiness: 10, looks: 3 },
                result: "Running with dogs through obstacle courses is surprisingly effective!",
                onSelect: (state) => {
                    state.hobbies = state.hobbies || [];
                    state.hobbies.push("Extreme Dog Walking");
                }
            },
            {
                text: "Competitive office chair racing",
                effect: { health: 5, happiness: 15, looks: -2 },
                result: "Not the best workout, but you're having a blast!",
                onSelect: (state) => {
                    state.hobbies = state.hobbies || [];
                    state.hobbies.push("Chair Racing");
                }
            }
        ]
    },
    // Meeting New Person Event
    {
        id: "new_connection",
        weight: 3,
        title: "New Connection",
        repeatability: "unlimited",  // Can happen multiple times without restrictions
        requirements: {
            minAge: 5,
            maxAge: 90,
            minHappiness: 20 // Need some basic happiness to be social
        },
        description: function(state) {
            console.log("Starting new connection event");
            // First, ensure potentialRelationships exists
            if (!state.potentialRelationships) {
                state.potentialRelationships = [];
                console.log("Initialized potentialRelationships array");
            }

            // Ensure relationships array exists
            if (!state.relationships) {
                state.relationships = [];
                console.log("Initialized relationships array");
            }

            // Generate a new person if we have less than 3 potential relationships
            if (state.potentialRelationships.length < 3) {
                const newPerson = generatePerson();
                state.potentialRelationships.push(newPerson);
                console.log("Generated new potential relationship:", newPerson);
            }

            // Get a random stranger from potential relationships
            const availableStrangers = state.potentialRelationships.filter(person => 
                !state.relationships.some(rel => rel.person.id === person.id)
            );
            console.log("Available strangers:", availableStrangers.length);

            let selectedPerson;
            // If no available strangers, generate a new one
            if (availableStrangers.length === 0) {
                selectedPerson = generatePerson();
                state.potentialRelationships.push(selectedPerson);
                console.log("Generated new person due to no available strangers:", selectedPerson);
            } else {
                // Select a random stranger
                selectedPerson = availableStrangers[Math.floor(Math.random() * availableStrangers.length)];
                console.log("Selected existing stranger:", selectedPerson);
            }
            
            // Store in both event and state for persistence
            this._selectedPerson = selectedPerson;
            state._currentEventData = { selectedPerson: selectedPerson };
            
            return `You meet ${selectedPerson.name}, a ${selectedPerson.personality.toLowerCase()} person who loves ${selectedPerson.interests[0].toLowerCase()}. How do you approach them?`;
        },
        choices: [
            {
                text: "Be friendly and open",
                effect: { happiness: 5 },
                result: function(state, event) {
                    const person = state._currentEventData?.selectedPerson || event._selectedPerson;
                    console.log("Result - Selected person:", person);
                    if (!person) return "You had a pleasant interaction with someone new.";
                    return `You had an amazing time with ${person.name}! Your friendship has grown stronger.`;
                },
                onSelect: (state, event) => { 
                    const person = state._currentEventData?.selectedPerson || event._selectedPerson;
                    console.log("OnSelect - Selected person:", person);
                    if (!person) {
                        console.log("No person found in onSelect!");
                        return;
                    }
                    if (!state.relationships) state.relationships = [];
                    addRelationship(state, person, "acquaintance", 20);
                    console.log("Added acquaintance relationship with", person.name);
                    delete state._currentEventData;
                }
            },
            {
                text: "Share common interests",
                effect: { happiness: 8, smarts: 2 },
                result: function(state, event) {
                    const person = state._currentEventData?.selectedPerson || event._selectedPerson;
                    console.log("Result - Selected person:", person);
                    if (!person) return "You had an engaging conversation about shared interests.";
                    return `You and ${person.name} really hit it off talking about ${person.interests[0]}!`;
                },
                onSelect: (state, event) => {
                    const person = state._currentEventData?.selectedPerson || event._selectedPerson;
                    console.log("OnSelect - Selected person:", person);
                    if (!person) {
                        console.log("No person found in onSelect!");
                        return;
                    }
                    if (!state.relationships) state.relationships = [];
                    addRelationship(state, person, "friend", 30);
                    console.log("Added friend relationship with", person.name);
                    delete state._currentEventData;
                }
            },
            {
                text: "Keep your distance",
                effect: { happiness: -1 },
                result: function(state, event) {
                    const person = state._currentEventData?.selectedPerson || event._selectedPerson;
                    console.log("Result - Selected person:", person);
                    if (!person) return "You decided to keep to yourself.";
                    return `You decide to avoid ${person.name}. They seem a bit hurt.`;
                },
                onSelect: (state, event) => {
                    const person = state._currentEventData?.selectedPerson || event._selectedPerson;
                    console.log("OnSelect - Selected person:", person);
                    if (!person) {
                        console.log("No person found in onSelect!");
                        return;
                    }
                    if (!state.relationships) state.relationships = [];
                    addRelationship(state, person, "stranger", -10);
                    console.log("Added stranger relationship with", person.name);
                    delete state._currentEventData;
                }
            }
        ]
    },

    // Friendship Development Event
    {
        id: "deepening_friendship",
        weight: 5,
        title: "Deepening Friendship",
        repeatability: "cooldown",  // Can repeat after a cooldown period
        cooldownYears: 1,           // Must wait 1 year between friendship developments
        requirements: {
            minAge: 5,
            maxAge: 90,
            hasFriends: true,
            minHappiness: 30 // Need to be somewhat happy to develop friendships
        },
        description: function(state) {
            // Check if we have any friends first
            const friends = state.relationships.filter(rel => 
                ["friend", "good_friend","best_friend"].includes(rel.status)
            );
            
            console.log("All relationships:", state.relationships);
            console.log("Filtered friends:", friends);
            
            if (friends.length === 0) {
                // Simply return a message about loneliness
                state.stats.happiness = Math.max(0, state.stats.happiness - 10);
                updateUI();
                return "You find yourself with no real friends. The loneliness weighs heavily on you.";
            }
            
            // Otherwise, proceed normally
            const randomFriend = friends[Math.floor(Math.random() * friends.length)];
            console.log("Selected random friend:", randomFriend);
            
            this._selectedPerson = randomFriend.person;
            console.log("Selected person:", this._selectedPerson);
            
            // Make sure the selected person has interests
            if (!this._selectedPerson.interests || !this._selectedPerson.interests.length) {
                this._selectedPerson.interests = ["hanging out", "watching movies", "playing games"];
            }
            
            return `Your friend ${this._selectedPerson.name} invites you to ${this._selectedPerson.interests[0].toLowerCase()} together. What do you do?`;
        },
        choices: [
            {
                text: "Enthusiastically join them",
                effect: { happiness: 10 },
                result: function(state, event) {
                    if (!event._selectedPerson) {
                        return "You had an amazing time with your friend! Your friendship has grown stronger.";
                    }
                    return `You had an amazing time with ${event._selectedPerson.name}! Your friendship has grown stronger.`;
                },
                onSelect: (state, event) => {
                    const person = event._selectedPerson;
                    if (person) {
                        upgradeRelationship(state, person, "good_friend");
                    }
                }
            },
            {
                text: "Make an excuse",
                effect: { happiness: -3 },
                result: function(state, event) {
                    if (!event._selectedPerson) {
                        return "Your friend seems disappointed. Your friendship has cooled a bit.";
                    }
                    return `${event._selectedPerson.name} seems disappointed. Your friendship has cooled a bit.`;
                },
                onSelect: (state, event) => {
                    const person = event._selectedPerson;
                    if (person) {
                        downgradeRelationship(state, person);
                    }
                }
            },
            {
                text: "Suggest a different activity",
                effect: { happiness: 5 },
                result: function(state, event) {
                    if (!event._selectedPerson) {
                        return "Your friend appreciates your honesty and you find a compromise.";
                    }
                    return `${event._selectedPerson.name} appreciates your honesty and you find a compromise.`;
                },
                onSelect: (state, event) => {
                    const person = event._selectedPerson;
                    if (person) {
                        addRelationshipPoints(state, person, 5);
                        console.log("New relationship points:", state.relationships);
                    }
                }
            }
        ]
    },

    // Job-related event
    {
        id: "promotion_opportunity",
        weight: 3,
        title: "Promotion Opportunity",
        repeatability: "cooldown",  // Can repeat after cooldown period
        cooldownYears: 5,           // Must wait 5 years between promotions
        maxOccurrences: 5,          // Can only be promoted 3 times in a lifetime
        requirements: {
            minAge: 18,
            maxAge: 100,
            hasJob: true,
            minSmarts: 60,
            minHappiness: 20
        },
        description: "Your boss has noticed your hard work...",
        choices: [
            {
                text: "Work extra hours to prove yourself",
                effect: { happiness: -5, smarts: 10, health: -5 },
                result: "Your dedication paid off! You got the promotion!",
                onSelect: (state) => {
                    state.money += 5000;
                    if (state.job) {
                        state.job.level = (state.job.level || 1) + 1;
                    }
                }
            },
            {
                text: "Present your innovative ideas",
                effect: { happiness: 5, smarts: 5 },
                result: "Your creativity impressed everyone! Promotion granted!",
                onSelect: (state) => {
                    state.money += 5000;
                    if (state.job) {
                        state.job.level = (state.job.level || 1) + 1;
                    }
                }
            },
            {
                text: "Decline the opportunity",
                effect: { happiness: -3 },
                result: "You decided to stay in your current position.",
                onSelect: null
            }
        ]
    },

    // Education event
    {
        id: "college_opportunity",
        weight: 7,
        title: "College Opportunity",
        repeatability: "once_per_life",  // Can only happen once per life
        requirements: {
            minAge: 18,
            maxAge: 25,
            hasHighSchool: true,
            minSmarts: 50
            //minMoney: 5000
        },
        description: "You have the opportunity to go to college..."
    },

    // Teenage Events with Choices
    
    // Love Triangle Event
    {
        id: "love_triangle_drama",
        weight: 4,
        title: "Love Triangle Drama",
        repeatability: "once_per_life",
        requirements: {
            minAge: 13,
            maxAge: 17
        },
        description: function(state) {
            const admirer1 = generatePerson();
            const admirer2 = generatePerson();
            admirer1.age = state.age;
            admirer2.age = state.age;
            this._admirer1 = admirer1;
            this._admirer2 = admirer2;
            return `${admirer1.name} and ${admirer2.name} both confess their feelings for you on the same day. Word spreads fast around school, and now everyone is watching to see what you'll do.`;
        },
        choices: [
            {
                text: "Choose one and reject the other",
                effect: { happiness: 10, looks: 5 },
                result: function(state, event) {
                    const chosen = event._admirer1;
                    const rejected = event._admirer2;
                    addRelationship(state, chosen, "dating", 50);
                    addRelationship(state, rejected, "enemy", -20);
                    return `You choose ${chosen.name}, breaking ${rejected.name}'s heart. The school is buzzing with drama.`;
                }
            },
            {
                text: "Turn them both down gently",
                effect: { happiness: -5, smarts: 10 },
                result: function(state, event) {
                    addRelationship(state, event._admirer1, "friend", 20);
                    addRelationship(state, event._admirer2, "friend", 20);
                    return "You handle the situation maturely, explaining that you value their friendship too much to risk it.";
                }
            },
            {
                text: "Leave them hanging and avoid both",
                effect: { happiness: -10, looks: -5 },
                result: "Your indecision leads to awkward encounters in the hallways. Both admirers eventually move on, but your reputation takes a hit."
            }
        ]
    },

    // Group Chat Drama Event
    {
        id: "group_chat_drama",
        weight: 5,
        title: "Exposed in Group Chat",
        repeatability: "cooldown",
        cooldownYears: 2,
        requirements: {
            minAge: 13,
            maxAge: 18
        },
        description: "Someone screenshots your private message and shares it in the school's group chat. Your embarrassing secret is now public!",
        choices: [
            {
                text: "Own up to it with confidence",
                effect: { happiness: 5, looks: 10 },
                result: "Your confident attitude turns the situation around. People admire your honesty and ability to laugh at yourself.",
                onSelect: (state) => {
                    state.traits = state.traits || [];
                    if (!state.traits.includes("Confident")) {
                        state.traits.push("Confident");
                    }
                }
            },
            {
                text: "Confront the person who leaked it",
                effect: { happiness: -5, health: -5 },
                result: function() {
                    const leaker = generatePerson();
                    addRelationship(state, leaker, "enemy", -30);
                    return `You confront ${leaker.name}, the person who leaked your message. The confrontation gets heated, and now you have a new enemy.`;
                }
            },
            {
                text: "Delete all social media and hide",
                effect: { happiness: -15, looks: -5 },
                result: "You go dark on social media for a while. The drama eventually dies down, but you miss out on a lot of social events."
            }
        ]
    },

    // Cafeteria Drama Event
    {
        id: "cafeteria_drama",
        weight: 4,
        title: "Public Breakup Scene",
        repeatability: "once_per_life",
        requirements: {
            minAge: 14,
            maxAge: 18
        },
        description: "A dramatic breakup unfolds in the cafeteria during lunch. Everyone is watching the shouting match, and phones are out recording.",
        choices: [
            {
                text: "Record it for social media",
                effect: { happiness: 5, looks: -5 },
                result: "Your video goes viral in the school, but some people think you're mean for recording it. Drama follows.",
                onSelect: (state) => {
                    state.traits = state.traits || [];
                    if (!state.traits.includes("Opportunistic")) {
                        state.traits.push("Opportunistic");
                    }
                }
            },
            {
                text: "Try to calm everyone down",
                effect: { happiness: 10, smarts: 5 },
                result: "Your intervention helps defuse the situation. Teachers praise your maturity, and both parties later thank you.",
                onSelect: (state) => {
                    state.traits = state.traits || [];
                    if (!state.traits.includes("Peacemaker")) {
                        state.traits.push("Peacemaker");
                    }
                }
            },
            {
                text: "Keep eating and ignore it",
                effect: { happiness: 0 },
                result: "You focus on your lunch while chaos unfolds around you. Sometimes staying neutral is the best policy."
            }
        ]
    },

    // ... existing code ...

    // Love Triangle Event
    {
        id: "love_triangle_drama",
        weight: 3,
        title: "Love Triangle Drama",
        repeatability: "once_per_life",
        requirements: {
            minAge: 13,
            maxAge: 19
        },
        description: function(state) {
            const admirer1 = generatePerson();
            const admirer2 = generatePerson();
            admirer1.age = state.age;
            admirer2.age = state.age;
            this._admirer1 = admirer1;
            this._admirer2 = admirer2;
            return `Two classmates, ${admirer1.name} and ${admirer2.name}, both confess their feelings for you on the same day. Word spreads fast around school, and now everyone is watching to see what you'll do.`;
        },
        choices: [
            {
                text: "Choose one and reject the other",
                effect: { happiness: 10, looks: 5 },
                result: function(state, event) {
                    const chosen = event._admirer1;
                    const rejected = event._admirer2;
                    addRelationship(state, chosen, "dating", 50);
                    addRelationship(state, rejected, "enemy", -20);
                    return `You choose ${chosen.name}, breaking ${rejected.name}'s heart. The school drama reaches new heights.`;
                }
            },
            {
                text: "Turn them both down to avoid drama",
                effect: { happiness: -5, smarts: 5 },
                result: function(state, event) {
                    const admirer1 = event._admirer1;
                    const admirer2 = event._admirer2;
                    addRelationship(state, admirer1, "acquaintance", 10);
                    addRelationship(state, admirer2, "acquaintance", 10);
                    return "You decide to avoid the drama and turn them both down. People respect your maturity, but your heart feels a bit empty.";
                }
            },
            {
                text: "Tell them you need time to think",
                effect: { happiness: -10 },
                result: function(state, event) {
                    const admirer1 = event._admirer1;
                    const admirer2 = event._admirer2;
                    addRelationship(state, admirer1, "acquaintance", -5);
                    addRelationship(state, admirer2, "acquaintance", -5);
                    return "Your indecision leads to weeks of awkward encounters and whispered rumors. Both admirers eventually move on, leaving you alone.";
                }
            }
        ]
    },

    // Group Chat Drama Event
    {
        id: "exposed_chat",
        weight: 4,
        title: "Exposed in Group Chat",
        repeatability: "once_per_life",
        requirements: {
            minAge: 13,
            maxAge: 19,
            minSmarts: 20
        },
        description: "Someone screenshots your private message complaining about a teacher and shares it in the school-wide group chat. The teacher has seen it.",
        choices: [
            {
                text: "Own up and apologize sincerely",
                effect: { happiness: -5, smarts: 10 },
                result: "You apologize to the teacher and take responsibility. They appreciate your honesty, and your classmates respect your integrity.",
                onSelect: (state) => {
                    state.traits = state.traits || [];
                    if (!state.traits.includes("Honest")) {
                        state.traits.push("Honest");
                    }
                }
            },
            {
                text: "Deny everything and blame the leaker",
                effect: { happiness: -10, smarts: -5 },
                result: function() {
                    const leaker = generatePerson();
                    addRelationship(state, leaker, "enemy", -30);
                    return `You deny it all and blame ${leaker.name} for fabricating the screenshot. Nobody believes you, and now you've made a powerful enemy.`;
                }
            },
            {
                text: "Play it cool and ignore everything",
                effect: { happiness: 5, looks: 5 },
                result: "You act like it doesn't bother you at all. Your apparent confidence impresses some classmates, though the teacher remains unhappy.",
                onSelect: (state) => {
                    state.traits = state.traits || [];
                    if (!state.traits.includes("Confident")) {
                        state.traits.push("Confident");
                    }
                }
            }
        ]
    },

    // Cafeteria Drama Event
    {
        id: "public_breakup",
        weight: 3,
        title: "Public Breakup Drama",
        repeatability: "cooldown",
        cooldownYears: 2,
        requirements: {
            minAge: 13,
            maxAge: 19
        },
        description: function() {
            const person1 = generatePerson();
            const person2 = generatePerson();
            this._person1 = person1;
            this._person2 = person2;
            return `${person1.name} and ${person2.name} are having a full-blown screaming match in the middle of the cafeteria over their messy breakup. Everyone's watching!`;
        },
        choices: [
            {
                text: "Record it and share with friends",
                effect: { happiness: 5, looks: -5 },
                result: function(state, event) {
                    const person1 = event._person1;
                    const person2 = event._person2;
                    addRelationship(state, person1, "enemy", -20);
                    addRelationship(state, person2, "enemy", -20);
                    return "Your video goes viral in the school. You gain some social clout, but both parties involved now hate you.";
                }
            },
            {
                text: "Try to calm them down",
                effect: { happiness: -5, smarts: 10 },
                result: function(state, event) {
                    const person1 = event._person1;
                    const person2 = event._person2;
                    addRelationship(state, person1, "friend", 20);
                    addRelationship(state, person2, "friend", 20);
                    return "You manage to defuse the situation. Both parties appreciate your maturity and become your friends.";
                }
            },
            {
                text: "Keep eating and ignore it",
                effect: { happiness: 0 },
                result: "You focus on your lunch while chaos unfolds around you. Sometimes staying neutral is the best policy."
            }
        ]
    },

    // Spreading Rumors Event
    {
        id: "nasty_rumor",
        weight: 4,
        title: "Vicious Rumors",
        repeatability: "cooldown",
        cooldownYears: 3,
        requirements: {
            minAge: 13,
            maxAge: 19,
            minHappiness: 30
        },
        description: "A particularly nasty rumor about you is spreading through school like wildfire. Everyone's whispering and giving you strange looks.",
        choices: [
            {
                text: "Investigate and confront the source",
                effect: { happiness: -5, smarts: 10 },
                result: function() {
                    const rumorStarter = generatePerson();
                    if (Math.random() > 0.5) {
                        addRelationship(state, rumorStarter, "enemy", -40);
                        return `You discover ${rumorStarter.name} started the rumor out of jealousy. The confrontation turns ugly, but at least you know the truth.`;
                    } else {
                        addRelationship(state, rumorStarter, "friend", 20);
                        return `You find out ${rumorStarter.name} started the rumor, but they sincerely apologize and you both end up becoming friends.`;
                    }
                }
            },
            {
                text: "Start a counter-rumor",
                effect: { happiness: -10, looks: -5 },
                result: "Your counter-rumor only makes things worse. Now there are multiple versions of the story circulating.",
                onSelect: (state) => {
                    state.traits = state.traits || [];
                    if (!state.traits.includes("Vengeful")) {
                        state.traits.push("Vengeful");
                    }
                }
            },
            {
                text: "Rise above it and focus on yourself",
                effect: { happiness: 10, smarts: 5 },
                result: "You ignore the rumors and focus on your goals. People eventually forget about it, and you earn respect for your maturity.",
                onSelect: (state) => {
                    state.traits = state.traits || [];
                    if (!state.traits.includes("Mature")) {
                        state.traits.push("Mature");
                    }
                }
            }
        ]
    },

    // Test Cheating Ring Event
    {
        id: "cheating_ring",
        weight: 3,
        title: "The Cheating Ring",
        repeatability: "once_per_life",
        requirements: {
            minAge: 13,
            maxAge: 19,
            minSmarts: 40
        },
        description: "You discover a sophisticated cheating ring at school. They offer to let you join, promising perfect grades with minimal effort.",
        choices: [
            {
                text: "Join the ring",
                effect: { smarts: 15, happiness: -10 },
                result: function() {
                    if (Math.random() > 0.7) {
                        state.stats.smarts = Math.max(0, state.stats.smarts - 30);
                        return "The ring gets caught! You and several others face serious consequences. Your academic record is permanently damaged.";
                    } else {
                        return "You successfully cheat your way to better grades, but the guilt weighs heavily on you.";
                    }
                }
            },
            {
                text: "Report them to the administration",
                effect: { happiness: -5, smarts: 10 },
                result: function() {
                    const cheater = generatePerson();
                    addRelationship(state, cheater, "enemy", -50);
                    return `The ring is busted, but ${cheater.name} figures out you were the whistleblower. Your conscience is clear, but you've made some dangerous enemies.`;
                }
            },
            {
                text: "Decline and study honestly",
                effect: { happiness: 5, smarts: 20 },
                result: "You choose the honest path. It's harder, but you actually learn the material and feel proud of your achievements.",
                onSelect: (state) => {
                    state.traits = state.traits || [];
                    if (!state.traits.includes("Studious")) {
                        state.traits.push("Studious");
                    }
                }
            }
        ]
    },

    // Rumor Mill Event
    {
        id: "rumor_mill",
        weight: 5,
        title: "Vicious Rumors",
        repeatability: "cooldown",
        cooldownYears: 3,
        requirements: {
            minAge: 13,
            maxAge: 18
        },
        description: "A nasty rumor about you is spreading through school like wildfire. You have no idea who started it.",
        choices: [
            {
                text: "Launch an investigation",
                effect: { happiness: -5, smarts: 10 },
                result: function() {
                    const culprit = generatePerson();
                    addRelationship(state, culprit, "enemy", -40);
                    return `You discover that ${culprit.name} started the rumor out of jealousy. Confronting them leads to a tense showdown.`;
                }
            },
            {
                text: "Start a counter-rumor",
                effect: { happiness: -10, looks: 5 },
                result: "Your counter-rumor successfully distracts everyone, but you feel guilty about stooping to their level.",
                onSelect: (state) => {
                    state.traits = state.traits || [];
                    if (!state.traits.includes("Cunning")) {
                        state.traits.push("Cunning");
                    }
                }
            },
            {
                text: "Rise above it",
                effect: { happiness: 5, smarts: 5 },
                result: "You maintain your dignity and let your actions speak for themselves. The rumor eventually dies out.",
                onSelect: (state) => {
                    state.traits = state.traits || [];
                    if (!state.traits.includes("Dignified")) {
                        state.traits.push("Dignified");
                    }
                }
            }
        ]
    },

    // Test Cheating Event
    {
        id: "major_test_cheating",
        weight: 4,
        title: "Final Exam Temptation",
        repeatability: "cooldown",
        cooldownYears: 2,
        requirements: {
            minAge: 14,
            maxAge: 18,
            minSmarts: 30
        },
        description: "A friend offers you the answers to the final exam. They swear they got them legitimately from last year's test.",
        choices: [
            {
                text: "Study honestly",
                effect: { happiness: 5, smarts: 15 },
                result: "You ace the test through hard work! Your teacher even comments on your impressive improvement.",
                onSelect: (state) => {
                    state.traits = state.traits || [];
                    if (!state.traits.includes("Honest")) {
                        state.traits.push("Honest");
                    }
                }
            },
            {
                text: "Take the answers but study too",
                effect: { happiness: -5, smarts: 10 },
                result: "You use the answers as a study guide. Your conscience is slightly troubled, but you learn the material anyway.",
                onSelect: (state) => {
                    state.traits = state.traits || [];
                    if (!state.traits.includes("Pragmatic")) {
                        state.traits.push("Pragmatic");
                    }
                }
            },
            {
                text: "Share the answers with everyone",
                effect: { happiness: 10, smarts: -10 },
                result: "The whole class gets suspicious grades. An investigation begins...",
                onSelect: (state) => {
                    state.traits = state.traits || [];
                    if (!state.traits.includes("Risk-taker")) {
                        state.traits.push("Risk-taker");
                    }
                }
            }
        ]
    },

    // Teenage Events with No Choices
    
    // Friend Betrayal Event
    {
        id: "friend_betrayal_teen",
        weight: 4,
        title: "Backstabbed",
        repeatability: "once_per_life",
        requirements: {
            minAge: 13,
            maxAge: 18,
            hasFriends: true
        },
        description: function(state) {
            const friends = state.relationships.filter(rel => 
                ["friend", "good_friend", "best_friend"].includes(rel.status)
            );
            if (friends.length === 0) return "You discover that someone you trusted has been spreading rumors about you.";
            const betrayer = friends[Math.floor(Math.random() * friends.length)];
            downgradeRelationship(state, betrayer.person);
            return `You find out that ${betrayer.person.name}, one of your closest friends, has been talking about you behind your back.`;
        },
        effect: { happiness: -15, looks: -5 },
        message: "The betrayal stings deeply. You start questioning who you can really trust."
    },

    // Party Raid Event
    {
        id: "party_raid",
        weight: 3,
        title: "Party Panic",
        repeatability: "cooldown",
        cooldownYears: 2,
        requirements: {
            minAge: 15,
            maxAge: 18
        },
        description: "You're at the biggest party of the year when suddenly the police show up! Everyone scatters in panic.",
        effect: { happiness: -10, health: -5 },
        message: "You're at the biggest party of the year when suddenly the police show up! Everyone scatters in panic. You barely make it out without getting caught. Your heart is racing from the adrenaline!"
    },

    // Social Media Drama
    {
        id: "social_media_callout",
        weight: 4,
        title: "Social Media Meltdown",
        repeatability: "cooldown",
        cooldownYears: 2,
        requirements: {
            minAge: 13,
            maxAge: 18
        },
        description: function(state) {
            const ex = generatePerson();
            addRelationship(state, ex, "enemy", -30);
            return `${ex.name}, your ex, posts a lengthy rant about you on social media. The comments section is exploding with drama.`;
        },
        effect: { happiness: -20, looks: -10 },
        message: "Your phone won't stop buzzing with notifications. This is not how you wanted to go viral."
    },

    // Embarrassing Moment
    {
        id: "class_embarrassment",
        weight: 5,
        title: "Voice Crack Catastrophe",
        repeatability: "once_per_life",
        requirements: {
            minAge: 13,
            maxAge: 16
        },
        description: "While giving an important presentation in class, your voice cracks horribly. The whole class erupts in laughter.",
        effect: { happiness: -15, looks: -5 },
        message: "You'll never live this down. At least it'll make a funny story... eventually."
    },

    // False Accusation
    {
        id: "false_accusation",
        weight: 3,
        title: "Wrongly Accused",
        repeatability: "once_per_life",
        requirements: {
            minAge: 14,
            maxAge: 18
        },
        description: "Someone's expensive headphones go missing from the locker room, and rumors start circulating that you took them.",
        effect: { happiness: -20, looks: -10 },
        message: "Being falsely accused is frustrating. You hope the truth comes out soon.",
        onTrigger: (state) => {
            state.traits = state.traits || [];
            if (!state.traits.includes("Resilient")) {
                state.traits.push("Resilient");
            }
        }
    }
]// Close the events array

function triggerEventByTitle(title) {
    const event = gameEvents.find(e => e.title === title);  // Changed from events to gameEvents
    
    if (!event) {
        console.warn(`Event with title "${title}" not found.`);
        return;
    }
    
    console.log(`Triggering event: ${event.title}`);
    
    if (event.choices) {
        showChoice(event);
    } else {
        // ... rest of the function ...
    }
}