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
    {
        id: "lovers_quarrel",
        type: EventType.SOCIAL,
        title: "Lover's Quarrel",
        weight: 3,
        receiverRequirement: RelationshipRequirement.SPOUSE,
        requirements: {
            minAge: 18,
            maxAge: 90,
            isMarried: true
        },
        description: (doer, receiver) => 
            `You and ${receiver.name} are having a heated argument about ${
                ['household chores', 'spending habits', 'time management'][Math.floor(Math.random() * 3)]
            }...`,
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
                result: (doer, receiver) => ({
                    message: `You and ${receiver.name} had a heart-to-heart conversation and grew closer.`,
                    effects: {
                        doer: { happiness: 8, smarts: 2 },
                        receiver: { happiness: 8 }
                    }
                })
            },
            {
                text: "Stand your ground",
                result: (doer, receiver) => ({
                    message: `The argument with ${receiver.name} intensified, causing strain in your relationship.`,
                    effects: {
                        doer: { happiness: -3 },
                        receiver: { happiness: -5 }
                    }
                })
            }
        ]
    },
    {
        id: "friendly_competition",
        type: EventType.SOCIAL,
        title: "Friendly Competition",
        weight: 2,
        receiverRequirement: RelationshipRequirement.FRIEND,
        requirements: {
            minAge: 6,
            maxAge: 90,
            hasFriends: true
        },
        description: (doer, receiver) => 
            `${receiver.name} challenges you to a ${
                ['video game tournament', 'sports match', 'trivia contest'][Math.floor(Math.random() * 3)]
            }...`,
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
                result: (doer, receiver) => ({
                    message: `You and ${receiver.name} had an intense competition, strengthening your friendship!`,
                    effects: {
                        doer: { happiness: 5, health: 2 },
                        receiver: { happiness: 5, health: 2 }
                    }
                })
            },
            {
                text: "Let them win",
                result: (doer, receiver) => ({
                    message: `${receiver.name} saw through your attempt to let them win, but appreciated the gesture.`,
                    effects: {
                        doer: { happiness: 6 },
                        receiver: { happiness: 6 }
                    }
                })
            }
        ]
    },

    // New childhood event about taking a toy from another child and have it make us friends, or make us into enemies
    {
        id: "toy_theft",
        type: EventType.SOCIAL,
        title: "Toy Theft",
        weight: 200,
        requirements: {
            minAge: 2,
            maxAge: 12,
        },
        description: function(doer) {
            // If no receiver exists, create one and add to town
            if (!this.receiver) {
                const newChild = generatePerson({
                    age: doer.age + Math.floor(Math.random() * 3) - 1,
                    personality: "Playful"
                });
                
                // Add the new child to the town
                state.town.push(newChild);
                
                // Add them as a stranger in relationships
                state.relationships.push({
                    person: newChild,
                    status: "stranger",
                    level: 0
                });
                
                this.receiver = newChild;
            }
            return `You see ${this.receiver.name} playing with a toy you want. What do you do?`;
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
                result: function(doer, event) {
                    const receiver = event.receiver;
                    const relationship = state.relationships.find(r => r.person.id === receiver.id);
                    if (relationship) {
                        relationship.status = "enemy";
                        relationship.level = -20;
                    }
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
                result: function(doer, event) {
                    const receiver = event.receiver;
                    const relationship = state.relationships.find(r => r.person.id === receiver.id);
                    if (relationship) {
                        relationship.status = "friend";
                        relationship.level = 20;
                    }
                    return `${receiver.name} smiles and makes room for you. You both have fun playing together!`;
                }
            },
            {
                text: "Watch sadly from a distance",
                effect: {
                    happiness: 3,
                    smarts: 2
                },
                result: function(doer, event) {
                    const receiver = event.receiver;
                    const relationship = state.relationships.find(r => r.person.id === receiver.id);
                    if (relationship) {
                        relationship.status = "friend";
                        relationship.level = 10;
                    }
                    return `You decide not to do anything. ${receiver.name} notices your interest and offers to let you have a turn later.`;
                }
            }
        ]
    },


    //Birth event
    {
        weight: 1,
        title: "Birth",
        requirements: {
            minAge: 0,
            maxAge: 1
        },
        description: "You are born into this world, your parents are overjoyed.",
        choices: [
            {
                text: "Cry",
                effect: { happiness: 20, smarts: 20, health: 20 },
                result: function(state) {
                    const mom = generatePerson();
                    const dad = generatePerson();
                    
                    // Assign parents to the state
                    state.relationships.push(
                        {
                            person: mom,
                            status: "family",
                            level: 80
                        },
                        {
                            person: dad,
                            status: "family",
                            level: 80
                        }
                    );

                    return `You are born into this world, your parents are overjoyed. Your mom is ${mom.name} and your dad is ${dad.name}.`;
                }
            }
        ]
    },
    //Tragic accident death event
    {
        weight: 100,
        title: "Death",
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
    {
        weight: 3,
        title: "First Words",
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
        weight: 4,
        title: "Sharing is Caring",
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
        weight: 3,
        title: "School Play Opportunity",
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
    // Get a paper route and earn $100 a week
    {
        weight: 3,
        title: "Paper Route",
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
        weight: 3,
        title: "Grandma's Legacy",
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
        weight: 2,
        title: "Spelling Bee",
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
        weight: 1,
        title: "Perfect Attendance",
        repeatable: true,
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
        weight: 2,
        title: "Travel Soccer Team",
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
        weight: 1,
        title: "Learn to Ride a Bicycle",
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
        weight: 2,
        title: "School Science Club",
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
        weight: 1,
        title: "New Hobby",
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
        weight: 1,
        title: "Feeling Sick",
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
        weight: 2,
        title: "Difficult Exam",
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
        weight: 1,
        title: "Crush Alert",
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
        weight: 1,
        title: "Career Opportunity",
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
        weight: 1,
        title: "Fitness Journey",
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
        weight: 3,
        title: "New Connection",
        requirements: {
            minAge: 5,
            maxAge: 90,
            minHappiness: 20 // Need some basic happiness to be social
        },
        description: function(state) {
            // First, ensure potentialRelationships exists
            if (!state.potentialRelationships) {
                state.potentialRelationships = [];
            }

            // Generate a new person if we have less than 3 potential relationships
            if (state.potentialRelationships.length < 3) {
                const newPerson = generatePerson();
                state.potentialRelationships.push(newPerson);
            }

            // Get a random stranger from potential relationships
            const availableStrangers = state.potentialRelationships.filter(person => 
                !state.relationships.some(rel => rel.person.id === person.id)
            );

            // Select a random stranger
            const person = availableStrangers[Math.floor(Math.random() * availableStrangers.length)];
            
            // Store the selected person in the event state
            this.selectedPerson = person;
            
            return `You meet ${person.name}, a ${person.personality.toLowerCase()} person who loves ${person.interests[0].toLowerCase()}. How do you approach them?`;
        },
        choices: [
            {
                text: "Be friendly and open",
                effect: { happiness: 5 },
                result: function(state, event) {
                    const person = event.selectedPerson;
                    return `You had an amazing time with ${person.name}! Your friendship has grown stronger.`;
                },
                onSelect: (state, event) => { 
                    const person = event.selectedPerson;
                    addRelationship(state, person, "acquaintance", 20);
                    console.log("Added relationship with", person.name);
                }
            },
            {
                text: "Share common interests",
                effect: { happiness: 8, smarts: 2 },
                result: function(state, event) {
                    const person = event.selectedPerson;
                    return `You and ${person.name} really hit it off talking about ${person.interests[0]}!`;
                },
                onSelect: (state, event) => {
                    const person = event.selectedPerson;
                    addRelationship(state, person, "friend", 30);
                    console.log("Added relationship with", person.name);
                }
            },
            {
                text: "Keep your distance",
                effect: { happiness: -1 },
                result: function(state, event) {
                    const person = event.selectedPerson;
                    return `You decide to avoid ${person.name}. They seem a bit hurt.`;
                },
                onSelect: (state, event) => {
                    const person = event.selectedPerson;
                    addRelationship(state, person, "stranger", -10);
                    console.log("Added relationship with", person.name);
                }
            }
        ]
    },

    // Friendship Development Event
    {
        weight: 5,
        title: "Deepening Friendship",
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
            
            this.selectedPerson = randomFriend.person;
            console.log("Selected person:", this.selectedPerson);
            
            return `Your friend ${this.selectedPerson.name} invites you to ${this.selectedPerson.interests[0].toLowerCase()} together. What do you do?`;
        },
        choices: [
            {
                text: "Enthusiastically join them",
                effect: { happiness: 10 },
                result: function(state, event) {
                    const person = event.selectedPerson;
                    return `You had an amazing time with ${person.name}! Your friendship has grown stronger.`;
                },
                onSelect: (state, event) => {
                    const person = event.selectedPerson;
                    if (person) {
                        upgradeRelationship(state, person, "good_friend");
                    }
                }
            },
            {
                text: "Make an excuse",
                effect: { happiness: -3 },
                result: function(state, event) {
                    const person = event.selectedPerson;
                    return `${person.name} seems disappointed. Your friendship has cooled a bit.`;
                },
                onSelect: (state, event) => {
                    const person = event.selectedPerson;
                    if (person) {
                        downgradeRelationship(state, person);
                    }
                }
            },
            {
                text: "Suggest a different activity",
                effect: { happiness: 5 },
                result: function(state, event) {
                    const person = event.selectedPerson;
                    return `${person.name} appreciates your honesty and you find a compromise.`;
                },
                onSelect: (state, event) => {
                    const person = event.selectedPerson;
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
        weight: 3,
        title: "Promotion Opportunity",
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
        weight: 7,
        title: "College Opportunity",
        requirements: {
            minAge: 18,
            maxAge: 25,
            hasHighSchool: true,
            minSmarts: 50
            //minMoney: 5000
        },
        description: "You have the opportunity to go to college..."
    },

    // Health event
    {
        weight: 2,
        title: "Marathon Training",
        requirements: {
            minAge: 16,
            maxAge: 70,
            minHealth: 70,
            minHappiness: 50
        },
        description: "You feel inspired to train for a marathon..."
    },
    {
        weight: 2,
        title: "Scammed",
        requirements: {
            minAge: 18,
            maxAge: 100,
            minMoney: 2000
        },
        description: "You've been scammed!  I guess Nigerian princes aren't as rich as they say.",
        effect: { money: -2000 },  // Deduct $200
        message: "You got scammed out of $2000. I guess Nigerian princes aren't as rich as they say."
    }
]// Close the events array