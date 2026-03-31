const fs = require("fs");
const ejs = require("ejs");

function readUserInput(userInputFile) {
    return JSON.parse(fs.readFileSync(userInputFile));
}


function createIngredientsObject(userInput) {
    // Base ingredients for all potions
    const baseIngredients = {
        "Glass Bottle": {
            "type": "quantity",
            "value": 1
        },
        "4 year old petrol from a lawn mower in the garage": {
            "type": "L",
            "value": 1
        },
        "Pine-o-clean": {
            "type": "mL",
            "value": 400
        },
        "Bam and the Dirt is Gone": {
            "type": "mL",
            "value": 500
        },
        "Ajax Spray and Wipe": {
            "type": "mL",
            "value": 420
        },
        "Battery Acid": {
            "type": "g",
            "value": 69
        }
    };

    for (const key in userInput) {
        // Input is in the format of `{ingredientName}.{attribute}`
        if (!key.includes(".")) continue
        // Split the key name by the '.' character
        const split = key.split('.')
        // Set the attribute for the ingredient by the first two dots
        // E.g. if the input is vinegar.type=mL it will set
        // {"vinegar": {"type": "mL"}} in the baseIngredients variable
        const ingredientName = split[0]
        if (typeof baseIngredients[ingredientName] === "undefined") {
            baseIngredients[ingredientName] = {}
        }
        const ingredientAttribute = split[1];
        // Should be completely secure doing this???
        // I don't think the hoomans can pollute anything by assigning attributes this way
        // Yeah I am pretty sure this is not vulnerable to prototype pollution
        // I am not merging anything right???
        baseIngredients[ingredientName][ingredientAttribute] = userInput[key];
    }
    
    return baseIngredients;
}


/**
 * Display the ingredients in a very pretty HTML file
 * 
 * We use the EJS template engine for rendering the HTML template
 * Surely there isn't any way that a hooman hacker could **pollute** our pretty HTML
 */
async function displayIngredients(ingredients) {
    const page = await ejs.renderFile("views/index.ejs", {ingredients: ingredients});
    console.log(page);
}


const userInput = readUserInput(process.argv[2]);
const ingredients = createIngredientsObject(userInput);
displayIngredients(ingredients);
