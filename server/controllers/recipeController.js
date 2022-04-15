require('../models/database');
const Category = require('../models/Category');
const Recipe = require('../models/Recipe');

/**
 * GET /
 * Homepage
 */
exports.homepage = async (req, res) => {
  try {
    const limitNumber = 5;
    const categories = await Category.find({}).limit(limitNumber);
    const latest = await Recipe.find({}).sort({ _id: -1 }).limit(limitNumber);
    const thai = await Recipe.find({ category: 'Thai' }).limit(limitNumber);
    const american = await Recipe.find({ category: 'American' }).limit(
      limitNumber
    );
    const chinese = await Recipe.find({ category: 'Chinese' }).limit(
      limitNumber
    );

    const food = { latest, thai, american, chinese };

    res.render('index', { title: 'Cooking Blog - Home', categories, food });
  } catch (error) {
    res.satus(500).send({ message: error.message || 'Error Occured' });
  }
};

/**
 * GET /categories
 * Categories
 */
exports.exploreCategories = async (req, res) => {
  try {
    const limitNumber = 20;
    const categories = await Category.find({}).limit(limitNumber);

    res.render('categories', {
      title: 'Cooking Blog - Categoreis',
      categories,
    });
  } catch (error) {
    res.satus(500).send({ message: error.message || 'Error Occured' });
  }
};

/**
 * GET /categories/:id
 * Categories By Id
 */
exports.exploreCategoriesById = async (req, res) => {
  try {
    let categoryId = req.params.id;
    const limitNumber = 20;
    const categoryById = await Recipe.find({ category: categoryId }).limit(
      limitNumber
    );
    res.render('categories', {
      title: 'Cooking Blog - Categoreis',
      categoryById,
    });
  } catch (error) {
    res.satus(500).send({ message: error.message || 'Error Occured' });
  }
};

/**
 * GET /recipe/:id
 * Recipe
 */
exports.exploreRecipe = async (req, res) => {
  try {
    let recipeId = req.params.id;
    const recipe = await Recipe.findById(recipeId);
    res.render('recipe', { title: 'Cooking Blog - Recipe', recipe });
  } catch (error) {
    res.satus(500).send({ message: error.message || 'Error Occured' });
  }
};

/**
 * POST /search
 * Search
 */
exports.searchRecipe = async (req, res) => {
  try {
    let searchTerm = req.body.searchTerm;
    let recipe = await Recipe.find({
      $text: { $search: searchTerm, $diacriticSensitive: true },
    });
    res.render('search', { title: 'Cooking Blog - Search', recipe });
  } catch (error) {
    res.satus(500).send({ message: error.message || 'Error Occured' });
  }
};

/**
 * GET /explore-latest
 * Explplore Latest
 */
exports.exploreLatest = async (req, res) => {
  try {
    const limitNumber = 20;
    const recipe = await Recipe.find({}).sort({ _id: -1 }).limit(limitNumber);
    res.render('explore-latest', {
      title: 'Cooking Blog - Explore Latest',
      recipe,
    });
  } catch (error) {
    res.satus(500).send({ message: error.message || 'Error Occured' });
  }
};

/**
 * GET /explore-random
 * Explore Random as JSON
 */
exports.exploreRandom = async (req, res) => {
  try {
    let count = await Recipe.find().countDocuments();
    let random = Math.floor(Math.random() * count);
    let recipe = await Recipe.findOne().skip(random).exec();
    res.render('explore-random', {
      title: 'Cooking Blog - Explore Latest',
      recipe,
    });
  } catch (error) {
    res.satus(500).send({ message: error.message || 'Error Occured' });
  }
};

/**
 * GET /submit-recipe
 * Submit Recipe
 */
exports.submitRecipe = async (req, res) => {
  const infoErrorsObj = req.flash('infoErrors');
  const infoSubmitObj = req.flash('infoSubmit');
  res.render('submit-recipe', {
    title: 'Cooking Blog - Submit Recipe',
    infoErrorsObj,
    infoSubmitObj,
  });
};

/**
 * POST /submit-recipe
 * Submit Recipe
 */
exports.submitRecipeOnPost = async (req, res) => {
  try {
    let imageUploadFile;
    let uploadPath;
    let newImageName;

    if (!req.files || Object.keys(req.files).length === 0) {
      console.log('No Files where uploaded.');
    } else {
      imageUploadFile = req.files.image;
      newImageName = Date.now() + imageUploadFile.name;

      uploadPath =
        require('path').resolve('./') + '/public/uploads/' + newImageName;

      imageUploadFile.mv(uploadPath, function (err) {
        if (err) return res.satus(500).send(err);
      });
    }

    const newRecipe = new Recipe({
      name: req.body.name,
      description: req.body.description,
      email: req.body.email,
      ingredients: req.body.ingredients,
      category: req.body.category,
      image: newImageName,
    });

    await newRecipe.save();

    req.flash('infoSubmit', 'Recipe has been added.');
    res.redirect('/submit-recipe');
  } catch (error) {
    // res.json(error);
    req.flash('infoErrors', error);
    res.redirect('/submit-recipe');
  }
};

//Delete Recipe
// async function deleteRecipe() {
//   try {
//     await Recipe.deleteOne({ name: 'random' });
//   } catch (error) {
//     console.log(error);
//   }
// }
// deleteRecipe();

//Update Recipe
// async function updateRecipe() {
//   try {
//     const res = await Recipe.updateOne(
//       { name: 'Random' },
//       { name: 'New Recipe Updated' }
//     );
//     res.n; // Number of documents matched
//     res.nModified; // Number of documents modified
//   } catch (error) {
//     console.log(error);
//   }
// }
// updateRecipe();

// async function insertDymmyCategoryData(){
//     try {
//       await Category.insertMany([
//         {
//           "name": "Thai",
//           "image": "thai-food.jpg"
//         },
//         {
//           "name": "American",
//           "image": "american-food.jpg"
//         },
//         {
//           "name": "Chinese",
//           "image": "chinese-food.jpg"
//         },
//         {
//           "name": "Mexican",
//           "image": "mexican-food.jpg"
//         },
//         {
//           "name": "Indian",
//           "image": "indian-food.jpg"
//         },
//         {
//           "name": "Spanish",
//           "image": "spanish-food.jpg"
//         }
//       ]);
//     } catch (error) {
//       console.log('err', + error)
//     }
//   }

// async function insertDymmyRecipeData() {
//   try {
//     await Recipe.insertMany([
//       {
//         name: 'Southern fried chicken',
//         description: `
//         To make the brine, toast the peppercorns in a large pan on a high heat for 1 minute, then add the rest of the brine ingredients and 400ml of cold water. Bring to the boil, then leave to cool, topping up with another 400ml of cold water.
// Meanwhile, slash the chicken thighs a few times as deep as the bone, keeping the skin on for maximum flavour. Once the brine is cool, add all the chicken pieces, cover with clingfilm and leave in the fridge for at least 12 hours – I do this overnight.
// After brining, remove the chicken to a bowl, discarding the brine, then pour over the buttermilk, cover with clingfilm and place in the fridge for a further 8 hours, so the chicken is super-tender.
// When you’re ready to cook, preheat the oven to 190°C/375°F/gas 5.
// Wash the sweet potatoes well, roll them in a little sea salt, place on a tray and bake for 30 minutes.
// Meanwhile, make the pickle – toast the fennel seeds in a large pan for 1 minute, then remove from the heat. Pour in the vinegar, add the sugar and a good pinch of sea salt, then finely slice and add the cabbage. Place in the fridge, remembering to stir every now and then while you cook your chicken.
// In a large bowl, mix the flour with the baking powder, cayenne, paprika and the onion and garlic powders.
// Just under half fill a large sturdy pan with oil – the oil should be 8cm deep, but never fill your pan more than half full – and place on a medium to high heat. Use a thermometer to tell when it’s ready (180°C), or add a piece of potato and wait until it turns golden – that’s a sign it’s ready to go.
// Take the chicken out of the fridge, then, one or two pieces at a time, remove from the buttermilk and dunk into the bowl of flour until well coated. Give them a shake, then place on a large board and repeat with the remaining chicken pieces.
// Turn the oven down to 170°C/325°F/gas 3 and move the sweet potatoes to the bottom shelf.
// Once the oil is hot enough, start with 2 thighs – quickly dunk them back into the flour, then carefully lower into the hot oil using a slotted spoon. Fry for 5 minutes, turning halfway, then remove to a wire rack over a baking tray.
// Bring the temperature of the oil back up, repeat the process with the remaining 2 thighs, then pop the tray into the oven.
// Fry the 4 drumsticks in one batch, then add them to the rack of thighs in the oven for 30 minutes, or until all the chicken is cooked through.
// Serve with your baked sweet potatoes, cabbage pickle and some salad leaves.

// Source:https://www.jamieoliver.com/recipes/chicken-recipes/southern-fried-chicken/`,

//         email: 'mrkrozerin.krmzts@gmail.com',
//         ingredients: [
//           '4 free-range chicken thighs , skin on, bone in',
//           '4 free-range chicken drumsticks',
//           '200 ml buttermilk',
//           '4 sweet potatoes',
//           '200 g plain flour',
//           '1 level teaspoon baking powder',
//           '1 level teaspoon cayenne pepper',
//           '1 level teaspoon hot smoked paprika',
//           '1 level teaspoon onion powder',
//           '1 level teaspoon garlic powder',
//           '2 litres groundnut oil',
//         ],
//         category: 'American',
//         image: 'southern-friend-chicken.jpg',
//       },

//       {
//         name: 'Crab Cakes',
//         description: `
//         Trim and finely chop the spring onions, and pick and finely chop the parsley. Beat the egg.
// Combine the crabmeat, potatoes, spring onion, parsley, white pepper, cayenne and egg in a bowl with a little sea salt.
// Refrigerate for 30 minutes, then shape into 6cm cakes.
// Dust with flour and shallow-fry in oil over a medium heat for about 5 minutes each side or until golden-brown.
// Serve with pinches of watercress and a dollop of tartare sauce.
// Source:https://www.jamieoliver.com/recipes/seafood-recipes/crab-cakes/`,
//         email: 'mrkrozerin.krmzts@gmail.com',
//         ingredients: [
//           '3 spring onions',
//           '½ a bunch of fresh flat-leaf parsley',
//           '1 large free-range egg',
//           '750 g cooked crabmeat , from sustainable sources',
//           '300 g mashed potatoes',
//           '1 teaspoon ground white pepper',
//           '1 teaspoon cayenne pepper',
//           'plain flour , for dusting',
//           'olive oil',
//           'watercress',
//           'tartare sauce',
//         ],
//         category: 'American',
//         image: 'crab-cakes.jpg',
//       },

//       {
//         name: 'Veggie chilli',
//         description: `
//         Peel and halve the red onion. Put the chillies, onion, paprika and cumin seeds into the processor, squash in the unpeeled garlic through a garlic crusher, then add the coriander stalks (reserving the leaves) and 2 tablespoons of oil, and whiz until fine.

// Tip into the pan. Deseed and roughly chop the peppers, drain the chickpeas and black beans, then add to the pan with a pinch of sea salt and black pepper and the passata, stir well and put the lid on.

// Fold the tortillas in half, slice into 0.5cm strips, sprinkle on to a baking tray and pop in the oven until golden and crisp.

// Put most of the coriander leaves, a pinch of salt and pepper, half a peeled avocado, the yoghurt and the lime juice into a jug and whiz with a stick blender until silky.

// Check and adjust the seasoning of the chilli, then leave the lid off.

// Remove the tortillas from the oven into a bowl, cut the lettuce into chunky wedges and add to the bowl. Scoop and dot over curls of avocado.

// Peel the cucumber into ribbons and finely slice half a chilli, then scatter both over the top.

// Make a well in the middle of the chilli and tip in the rice, then pop the lid on for the last few minutes to warm the rice through.

// Pour the dressing over the salad, pick over the remaining coriander leaves, finely slice the remaining chilli and sprinkle over the top along with the halved cherry tomatoes, then toss everything together. Serve with dollops of yoghurt.
// Source:https://www.jamieoliver.com/recipes/vegetables-recipes/veggie-chilli-with-crunchy-tortilla-avocado-salad/`,
//         email: 'mrkrozerin.krmzts@gmail.com',
//         ingredients: [
//           '          CHILLI & RICE',
//           '1 red onion',
//           '1 dried smoked chipotle or ancho chilli',
//           '½ a fresh red chilli',
//           '1 teaspoon sweet smoked paprika',
//           '½ teaspoon cumin seeds',
//           '1-2 cloves of garlic',
//           '1 big bunch of fresh coriander',
//           'olive oil',
//           '2 mixed-colour peppers',
//           '1 x 400 g tin of chickpeas',
//           '1 x 400 g tin of black beans',
//           '700 g passata',
//           '1x 250 g pack of cooked mixed long grain & wild rice',
//           'SALAD',
//           '4 small corn tortilla wraps',
//           '2 ripe avocados',
//           '3 heaped tablespoons fat-free natural yoghurt , plus extra to serve',
//           '2 limes',
//           '1 romaine lettuce',
//           '½ a cucumber',
//           '1 fresh red chilli',
//           '1 handful of ripe cherry tomatoes',
//         ],
//         category: 'Mexican',
//         image: 'Veggie-chilli.jpg',
//       },

//       {
//         name: 'Spring rolls',
//         description: `
//         Put your mushrooms in a medium-sized bowl, cover with hot water and leave for 10 minutes, or until soft. Meanwhile, place the noodles in a large bowl, cover with boiling water and leave for 1 minute. Drain, rinse under cold water, then set aside.
// For the filling, finely slice the cabbage and peel and julienne the carrot. Add these to a large bowl with the noodles.
// Slice the white part of the spring onions on the diagonal and add to the bowl. Finely slice the green parts into ribbons and reserve for later.
// Peel and grate the ginger, then finely chop the chilli. Roughly chop the herbs and add to the bowl with the ginger and chilli.
// Crush the peanuts and add to the bowl with the sesame oil, beansprouts, soy and oyster sauces, and mix well.
// When they’re ready, drain the mushrooms, then chop them and stir into the filling. Season to taste.
// In a small bowl, blend the cornflour and 2 tablespoons of cold water.
// Next, lay one spring-roll wrapper, smooth-side down, on a clean surface as a diamond shape, with one corner pointing down towards you. Sprinkle a little of the five spice powder over it, then place another wrapper on top (the extra thickness will stop the rolls from breaking open while cooking).
// Spoon 2 tablespoons of the filling on the bottom corner of the double wrapper. Brush each corner with the cornflour mixture, then start rolling up from the bottom. When the filling is covered, pull the corners in from each side (to seal the ends as you go). Continue rolling until the filling is tightly covered, then press to seal the top corner.
// Lay the finished roll on a large baking tray and cover with a damp tea towel. Continue until you’ve filled all the wrappers.
// Heat the groundnut oil in a large wok or saucepan over a medium heat. To check whether the oil is ready, drop in a piece of potato; it should sizzle and start to turn golden. In small batches, carefully lower the spring rolls into the oil and deep-fry for 2 to 3 minutes, or until golden brown. Remove with a slotted spoon and drain on kitchen paper.
// Serve with the sweet chilli sauce and reserved sliced spring-onion tops.
// Source:https://www.jamieoliver.com/recipes/vegetables-recipes/spring-rolls/`,
//         email: 'mrkrozerin.krmzts@gmail.com',
//         ingredients: [
//           '          40 g dried Asian mushrooms',
//           '50 g vermicelli noodles',
//           '200 g Chinese cabbage',
//           '1 carrot',
//           '3 spring onions',
//           '5 cm piece of ginger',
//           '1 red chilli',
//           '1 big bunch of fresh Thai basil , (30g)',
//           '1 big bunch of fresh coriander , (30g)',
//           '3 tablespoons toasted peanuts',
//           '20 ml sesame oil',
//           '75 g beansprouts , (ready to eat)',
//           '2 tablespoons low-salt soy sauce',
//           '2 tablespoons oyster sauce',
//           '1 tablespoon cornflour',
//           '16 large spring-roll wrappers , thawed if frozen',
//           '1 tablespoon five-spice powder',
//           '1 litre groundnut oil',
//           'sweet chilli sauce , to serve',
//         ],
//         category: 'Chinese',
//         image: 'spring-rolls.jpg',
//       },

//       {
//         name: 'Thai red chicken soup',
//         description: `
//         Sit the chicken in a large, deep pan.
// Carefully halve the squash lengthways, then cut into 3cm chunks, discarding the seeds.
// Slice the coriander stalks, add to the pan with the squash, curry paste and coconut milk, then pour in 1 litre of water. Cover and simmer on a medium heat for 1 hour 20 minutes.
// Use tongs to remove the chicken to a platter. Spoon any fat from the surface of the soup over the chicken, then sprinkle with half the coriander leaves.
// Serve with 2 forks for divvying up the meat at the table. Use a potato masher to crush some of the squash, giving your soup a thicker texture.
// Taste, season to perfection with sea salt and black pepper, then divide between six bowls and sprinkle with the remaining coriander.
// Shred and add chicken, as you dig in.
// Source:https://www.jamieoliver.com/recipes/vegetables-recipes/spring-rolls/`,
//         email: 'mrkrozerin.krmzts@gmail.com',
//         ingredients: [
//           '          1 x 1.6 kg whole free-range chicken',
//           '1 butternut squash (1.2kg)',
//           '1 bunch of fresh coriander (30g)',
//           '100 g Thai red curry paste',
//           '1 x 400 ml tin of light coconut milk',
//         ],
//         category: 'Thai',
//         image: 'thai-red-chicken-soup.jpg',
//       },

//       {
//         name: 'Indian-style chip butty',
//         description: `
//         Scrub the potatoes and sweet potatoes and chop into 2cm chunks, cook in a large pan of boiling salted water for 10 minutes, or until tender, then drain and steam dry.
// Peel the garlic and ginger, finely chop with the chilli, and place in a large non-stick frying pan over a medium heat with the butter, garam masala and mustard seeds.
// After 1 minute, tip and mash in the potatoes, then season to perfection with sea salt and black pepper. Keep frying until crispy, then mix up and allow to get crispy again.
// Divide roughly into 4 (still in the pan), then use 2 spoons to crudely mould and shape into balls, patiently frying and turning until kind of rounded, really golden and crispy all over (trust me, these are amazing!).
// Spoon the mango chutney into a bowl, squeeze in enough pomegranate juice to loosen, then mix together with a handful of the pomegranate seeds.
// Whiz the mint leaves in a blender with the yoghurt until smooth. Split the rolls open and lightly toast on the inside, and roughly crush the Bombay mix.
// Spoon a dollop of mint yoghurt on to each bun base, top with a hot potato ball, a little mango chutney and Bombay mix, then pop the lid on and squash.
// Source:https://www.jamieoliver.com/recipes/vegetables-recipes/spring-rolls/`,

//         email: 'mrkrozerin.krmzts@gmail.com',
//         ingredients: [
//           '          400 g potatoes',
//           '400 g sweet potatoes',
//           '3 cloves of garlic',
//           '3 cm piece of ginger',
//           '1 fresh red chilli',
//           '1 large knob of unsalted butter',
//           '1 teaspoon garam masala',
//           '1 teaspoon mustard seeds',
//           '2 tablespoons mango chutney',
//           '½ a pomegranate',
//           '1 bunch of fresh mint , (30g)',
//           '4 tablespoons natural yoghurt',
//           '4 soft rolls',
//           '20 g Bombay mix',
//         ],
//         category: 'Indian',
//         image: 'Indian-style-chip-butty.jpg',
//       },

//       {
//         name: 'Spanish tortilla',
//         description: `
//         Peel the potatoes using a speed-peeler, then carefully cut them into thin slices. Pat the potato slices dry with a clean tea towel.
//         Peel and finely slice the onion. Drizzle 2 tablespoons of oil into a small frying pan over a medium heat, then add the onion and potatoes.
//         Turn the heat down to low and cook for 25 to 30 minutes, or until the onions are turning golden and the potato slices are cooked through. Try not to stir it too much or the potatoes will break up – just use a fish slice to flip them over halfway through.
//         Crack the eggs into a mixing bowl, season with a tiny pinch of sea salt and black pepper, then whisk together with a fork.
//         When the onions and potatoes are cooked, remove the pan from the heat and carefully tip them into the eggs. Transfer the mixture back into the frying pan and place it over a low heat. Cook for around 20 minutes, or until there’s almost no runny egg on top.
//         Use a fish slice to slightly lift and loosen the sides of the tortilla. Carefully flip the pan over a dinner plate and tip out the tortilla, then slide it back into the pan and cook for another 5 minutes, or until golden and cooked through.
//         Turn out the tortilla onto a serving board, then cut into 6 wedges and serve hot or cold with a simple green salad.
// Source:https://www.jamieoliver.com/recipes/vegetables-recipes/veggie-chilli-with-crunchy-tortilla-avocado-salad/`,
//         email: 'mrkrozerin.krmzts@gmail.com',
//         ingredients: [
//           '300 g waxy potatoes',
//           '1 onion',
//           'olive oil',
//           '5 large free-range egg',
//         ],
//         category: 'Spanish',
//         image: 'Spanish-tortilla.jpg',
//       },
//     ]);
//   } catch (error) {
//     console.log('err', +error);
//   }
// }

// insertDymmyRecipeData();
