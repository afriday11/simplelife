RogueLife Game Documentation

Overview
RogueLife is a life simulation game where players experience different lives through a series of random events. The game features a year-by-year progression system where players make choices that affect their character's stats and relationships. When a character dies, players can start a new life in the same persistent world, with previous decisions and events remaining in effect.

Core Game Structure

Files
- index.html - Main game file containing HTML, CSS, and JavaScript
- dialogSystem.js - Handles dialog sequences (e.g., conversations with God after death)
- characterGenerator.js - Generates characters with random traits and stats
- timeHandler.js - Manages the game's timeline and aging system
- events.js - Contains all possible game events and their requirements

Game State
The game state is managed through a global state object that contains the following

state = {
    // Basic character info
    name: "Character Name",
    gender: "Male/Female",
    personality: "Personality Type",
    year: 0,
    age: 0,
    avatar: '👶', // Emoji representing character
    
    // Core stats (0-100)
    stats: {
        happiness: 50,
        health: 50,
        smarts: 50,
        looks: 50
    },
    
    // Economy
    money: 0,
    
    // Character development
    job: null,
    education: null,
    childhoodMemory: null,
    favoriteColor: null,
    greatestFear: null,
    relationships: [], // [{person: Person, status: "friend", level: 50}]
    achievements: [],
    talents: [],
    dreams: null,
    bestFriend: null,
    favoriteSubject: null,
    hobbies: [],
    quirk: "Character quirk",
    pets: [],
    
    // Game mechanics
    causeOfDeath: null,
    potentialRelationships: [], // Characters that can become relationships
    eventHistory: new EventHistory(),
    town: [] // All characters in the town (persistent across lives)
}


Game Loop
1. Player clicks "+ Year" button to advance time
2. advanceYear() function is called, which:
    Increments the global year and character's age
    Selects a random event based on eligibility criteria
    Displays the event to the player
    Applies effects to character stats
3. If the event has choices, the player selects one and handleChoice() processes it
4. The UI is updated to reflect changes
5. If health drops to 0, the character dies and a new life can be started

Key Systems

Character Generation
Characters are generated using the characterGenerator.js file, which provides:
- generateRandomName() - Creates a random name
- generatePerson() - Creates a character with random traits
- generateChild() - Creates a child character from two parents
- generateEnemy() - Creates an enemy character
- generateCoreCharacters(count) - Creates the initial town population
When a new game starts, 12 characters are generated for the town. These characters persist across multiple lives.

Event System
Events are defined in events.js and have the following structure:
{
    title: "Event Title",
    weight: 1, // Likelihood of occurring
    requirements: {
        minAge: 0,
        maxAge: 100,
        // Other requirements like job, relationships, stats
    },
    description: "Event description text",
    choices: [
        {
            text: "Choice text",
            effect: { happiness: 10, health: -5 }, // Stat changes
            result: "Result text or function returning text",
            onSelect: function(state, event) { /* Additional effects */ }
        }
    ]
}

Events are selected based on:
1. Character's current age
2. Character's stats, relationships, and other attributes
3. Whether the event has already occurred (non-repeatable events)
4. Random selection weighted by the event's weight property

Relationship System
Relationships are stored in state.relationships as an array of objects:
{
    person: Person, // Character object
    status: "friend", // Relationship type (friend, family, married, enemy, etc.)
    level: 50 // Relationship strength (0-100)
}

Helper functions for managing relationships:
- getRandomStranger() - Finds a character not yet in relationships
- addRelationship() - Adds a new relationship
- upgradeRelationship() - Improves a relationship status
- downgradeRelationship() - Worsens a relationship
- addRelationshipPoints() - Changes relationship strength

UI Components
The game UI consists of:
1. Character Header - Shows avatar, name, age, and money
2. Stats Display - Shows the four main stats (happiness, health, smarts, looks)
3. Story Log - Records events and choices with their stat impacts
4. Control Strip - Contains buttons for game actions
5. Relationships Container - Lists current relationships
6. Character Stats Table - Shows detailed character information
7. Choice Modal - Appears when an event requires player choice
8. Death Modal - Appears when character dies
9. Characters Modal - Shows all town characters


Persistence Mechanics
Town Persistence
When a character dies and a new life begins:
1. The town characters are preserved (state.town)
2. A new character is generated
3. The global year continues from where it left off (NOT CORRECT, CHECK THIS)
4. Previous events remain in the world's history

Death and Rebirth
When a character dies:
1. The death modal appears showing final stats
2. A dialog with God may occur (based on death count)
3. Player can start a new life in the same world
4. The death count is stored in localStorage

Useful commands for debugging and testing

Key Commands
localStorage.setItem("deathCount", "0"); // Reset your death count to replay the story
setAge(25) - Sets the character's age
triggerEventByTitle("Event Title") - Triggers a specific event

Nice to have
getGlobalYear()  // Returns and logs the current global year
console.log(state.town); // Get list of characters in town
setGlobalYear(2050)  // Sets the global year to 2050
advanceGlobalYear(5)  // Advances the global year by 5 years
advanceGlobalYear()   // Advances the global year by 1 year (default)











I tried to create a new kind of event that required specific types of people and also updated their status afterwards.  We were getting close to it working, but it required a ton of code within the event, which I really didn't want to deal with. I've removed the code for now, but have saved it here in case we want to pick this up again.

It should also be noted there is a bunch of questionable code at the beginning of events.js, but I'm not gonna mess with it for now.

    {
        id: "lovers_quarrel",
        type: EventType.SOCIAL,
        title: "Lover's Quarrel",
        weight: 3,
        repeatability: "cooldown",  // Can repeat after a cooldown period
        cooldownYears: 2,           // Must wait 2 years between quarrels
        receiverRequirement: RelationshipRequirement.SPOUSE,
        requirements: {
            minAge: 18,
            maxAge: 90,
            isMarried: true
        },
        description: function(doer) {
            // Find a spouse using our helper function
            const spouse = findReceiver({ relationshipStatus: "married" });
            
            // If no spouse found, this event shouldn't trigger
            // But just in case, store a placeholder
            if (!spouse) {
                console.warn("Lover's Quarrel triggered but no spouse found");
                this._currentReceiver = { name: "your spouse" };
                return "You and your spouse are having a heated argument...";
            }
            
            // Store the spouse temporarily for this event execution
            this._currentReceiver = spouse;
            
            const topics = ['household chores', 'spending habits', 'time management'];
            const randomTopic = topics[Math.floor(Math.random() * topics.length)];
            
            return `You and ${spouse.name} are having a heated argument about ${randomTopic}...`;
        },
        effects: {
            doer: {
                happiness: -5,
                health: -2
            },
            receiver: {
                happiness: -5,
                health: -2
            }
        },
        choices: [
            {
                text: "Try to understand their perspective",
                result: function(doer, event) {
                    // Use the temporary receiver we stored during description
                    const receiver = event._currentReceiver;
                    
                    // Update relationship if it exists
                    const relationship = state.relationships.find(r => 
                        r.person.id === receiver.id
                    );
                    
                    if (relationship) {
                        relationship.level += 5;
                    }
                    
                    return {
                        message: `You and ${receiver.name} had a heart-to-heart conversation and grew closer.`,
                        effects: {
                            doer: { happiness: 8, smarts: 2 }
                        }
                    };
                }
            },
            {
                text: "Stand your ground",
                result: function(doer, event) {
                    // Use the temporary receiver we stored during description
                    const receiver = event._currentReceiver;
                    
                    // Update relationship if it exists
                    const relationship = state.relationships.find(r => 
                        r.person.id === receiver.id
                    );
                    
                    if (relationship) {
                        relationship.level -= 5;
                    }
                    
                    return {
                        message: `The argument with ${receiver.name} intensified, causing strain in your relationship.`,
                        effects: {
                            doer: { happiness: -3 }
                        }
                    };
                }
            }
        ]
    },
    {
        id: "friendly_competition",
        type: EventType.SOCIAL,
        title: "Friendly Competition",
        weight: 2,
        repeatability: "unlimited",  // Can happen multiple times without restrictions
        receiverRequirement: RelationshipRequirement.FRIEND,
        requirements: {
            minAge: 6,
            maxAge: 90,
            hasFriends: true
        },
        description: function(doer) {
            // Find a friend using our helper function
            // This will either find an existing friend or create a new one
            const friend = getEventReceiver(this);
            
            // Store the friend temporarily for this event execution
            this._currentReceiver = friend;
            
            const activities = ['video game tournament', 'sports match', 'trivia contest'];
            const randomActivity = activities[Math.floor(Math.random() * activities.length)];
            
            return `${friend.name} challenges you to a ${randomActivity}...`;
        },
        effects: {
            doer: {
                happiness: 3,
                health: 1
            },
            receiver: {
                happiness: 3,
                health: 1
            }
        },
        choices: [
            {
                text: "Give it your all",
                result: function(doer, event) {
                    // Use the temporary receiver we stored during description
                    const receiver = event._currentReceiver;
                    
                    // Update relationship if it exists
                    const relationship = state.relationships.find(r => 
                        r.person.id === receiver.id
                    );
                    
                    if (relationship) {
                        relationship.level += 5;
                    }
                    
                    return {
                        message: `You and ${receiver.name} had an intense competition, strengthening your friendship!`,
                        effects: {
                            doer: { happiness: 5, health: 2 }
                        }
                    };
                }
            },
            {
                text: "Let them win",
                result: function(doer, event) {
                    // Use the temporary receiver we stored during description
                    const receiver = event._currentReceiver;
                    
                    // Update relationship if it exists
                    const relationship = state.relationships.find(r => 
                        r.person.id === receiver.id
                    );
                    
                    if (relationship) {
                        relationship.level += 3;
                    }
                    
                    return {
                        message: `${receiver.name} saw through your attempt to let them win, but appreciated the gesture.`,
                        effects: {
                            doer: { happiness: 6 }
                        }
                    };
                }
            }
        ]
    },

    // New childhood event about taking a toy from another child and have it make us friends, or make us into enemies
    {
        id: "toy_theft",
        type: EventType.SOCIAL,
        title: "Toy Theft",
        weight: 200,
        repeatability: "once_per_life",  // Can only happen once per life
        requirements: {
            minAge: 2,
            maxAge: 12,
        },
        description: function(doer) {
            // Find or create a child of similar age using our new helper function
            // We'll create a temporary receiver just for this event execution
            const childAge = Math.max(1, doer.age + Math.floor(Math.random() * 3) - 1);
            
            // Create a new child or find an existing one
            const receiver = findReceiver({ 
                minAge: childAge - 1, 
                maxAge: childAge + 1 
            }) || createAndAddReceiver({
                age: childAge,
                personality: "Playful"
            });
            
            // Add them as a stranger in relationships if they don't exist yet
            if (!state.relationships.some(rel => rel.person.id === receiver.id)) {
                state.relationships.push({
                    person: receiver,
                    status: "stranger",
                    level: 0
                });
            }
            
            // Store the receiver temporarily for this event execution
            this._currentReceiver = receiver;
            
            return `You see ${receiver.name} playing with a toy you want. What do you do?`;
        },
        effects: {
            doer: {
                happiness: -2,  // Initial anxiety about the situation
                health: 0
            },
            receiver: {
                happiness: 0,
                health: 0
            }
        },
        choices: [
            {
                text: "Take the toy from them violently",
                effect: {
                    happiness: 5,
                    smarts: -2,
                    health: -1
                },
                result: function(state, event) {
                    // Use the temporary receiver we stored during description
                    const receiver = event._currentReceiver;
                    if (!receiver) {
                        return "You grab the toy from another child. They cry, but you enjoy playing with it. Your parents are disappointed in your behavior.";
                    }
                    
                    // Make sure the receiver is in the relationships array
                    let relationship = state.relationships.find(r => r.person.id === receiver.id);
                    if (!relationship) {
                        relationship = {
                            person: receiver,
                            status: "stranger",
                            level: 0
                        };
                        state.relationships.push(relationship);
                    }
                    
                    // Update the relationship
                    relationship.status = "enemy";
                    relationship.level = -20;
                    
                    console.log("Updated relationship:", relationship); // Debug log
                    
                    return `You grab the toy from ${receiver.name}. They cry, but you enjoy playing with it. Your parents are disappointed in your behavior.`;
                }
            },
            {
                text: "Ask if you can play with it together",
                effect: {
                    happiness: 8,
                    smarts: 5,
                    health: 1
                },
                result: function(state, event) {
                    // Use the temporary receiver we stored during description
                    const receiver = event._currentReceiver;
                    if (!receiver) {
                        return "You ask another child if you can play together. They smile and make room for you. You both have fun playing together!";
                    }
                    
                    // Make sure the receiver is in the relationships array
                    let relationship = state.relationships.find(r => r.person.id === receiver.id);
                    if (!relationship) {
                        relationship = {
                            person: receiver,
                            status: "stranger",
                            level: 0
                        };
                        state.relationships.push(relationship);
                    }
                    
                    // Update the relationship
                    relationship.status = "friend";
                    relationship.level = 20;
                    
                    console.log("Updated relationship:", relationship); // Debug log
                    
                    return `${receiver.name} smiles and makes room for you. You both have fun playing together!`;
                }
            },
            {
                text: "Watch sadly from a distance",
                effect: {
                    happiness: 3,
                    smarts: 2
                },
                result: function(state, event) {
                    // Use the temporary receiver we stored during description
                    const receiver = event._currentReceiver;
                    if (!receiver) {
                        return "You decide not to do anything. Another child notices your interest and offers to let you have a turn later.";
                    }
                    
                    // Make sure the receiver is in the relationships array
                    let relationship = state.relationships.find(r => r.person.id === receiver.id);
                    if (!relationship) {
                        relationship = {
                            person: receiver,
                            status: "stranger",
                            level: 0
                        };
                        state.relationships.push(relationship);
                    }
                    
                    // Update the relationship
                    relationship.status = "friend";
                    relationship.level = 10;
                    
                    console.log("Updated relationship:", relationship); // Debug log
                    
                    return `You decide not to do anything. ${receiver.name} notices your interest and offers to let you have a turn later.`;
                }
            }
        ]
    },
