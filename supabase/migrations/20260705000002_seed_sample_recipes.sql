-- Seed 30 sample recipes for the three existing profiles
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT FALSE;

-- Profile 1: 10 recipes (2 private)
WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, c.id, 'Classic Scrambled Eggs', 'A quick breakfast staple with soft eggs and buttered toast.', 10, 5, 2, FALSE
  FROM public.categories c
  WHERE c.name = 'Breakfast'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('eggs', '4', '', 1),
  ('butter', '1', 'tbsp', 2),
  ('milk', '2', 'tbsp', 3),
  ('salt', '1', 'pinch', 4),
  ('black pepper', '1', 'pinch', 5)
) AS v(name, amount, unit, sort_order);

WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, c.id, 'Warm Apple Cinnamon Oats', 'Comforting oats with soft apples and a hint of spice.', 10, 20, 2, FALSE
  FROM public.categories c
  WHERE c.name = 'Breakfast'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('rolled oats', '1', 'cup', 1),
  ('apple', '1', '', 2),
  ('milk', '1', 'cup', 3),
  ('cinnamon', '1', 'tsp', 4),
  ('honey', '1', 'tbsp', 5)
) AS v(name, amount, unit, sort_order);

WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, c.id, 'Turkey and Veggie Pita', 'A filling lunch wrap packed with crisp vegetables and lean turkey.', 15, 0, 2, FALSE
  FROM public.categories c
  WHERE c.name = 'Lunch'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('pita bread', '2', 'pieces', 1),
  ('turkey slices', '6', 'oz', 2),
  ('cucumber', '1', '', 3),
  ('tomato', '1', '', 4),
  ('lettuce', '2', 'cups', 5)
) AS v(name, amount, unit, sort_order);

WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, c.id, 'Herb Chicken Rice Bowl', 'A simple dinner bowl with chicken, rice, and fresh herbs.', 15, 25, 4, FALSE
  FROM public.categories c
  WHERE c.name = 'Dinner'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('chicken breast', '2', '', 1),
  ('cooked rice', '2', 'cups', 2),
  ('olive oil', '1', 'tbsp', 3),
  ('parsley', '1', 'tbsp', 4),
  ('lemon', '1', '', 5)
) AS v(name, amount, unit, sort_order);

WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, c.id, 'Weeknight Tomato Soup', 'A smooth tomato soup made from pantry staples and a touch of cream.', 10, 25, 4, TRUE
  FROM public.categories c
  WHERE c.name = 'Soups'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('tomatoes', '2', 'cans', 1),
  ('onion', '1', '', 2),
  ('garlic', '2', 'cloves', 3),
  ('vegetable broth', '2', 'cups', 4),
  ('cream', '1/4', 'cup', 5)
) AS v(name, amount, unit, sort_order);

WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, c.id, 'Garden Cucumber Salad', 'A crisp salad that comes together fast for a simple side.', 10, 0, 2, TRUE
  FROM public.categories c
  WHERE c.name = 'Salads'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('cucumber', '2', '', 1),
  ('tomato', '2', '', 2),
  ('olive oil', '2', 'tbsp', 3),
  ('lemon juice', '1', 'tbsp', 4),
  ('dill', '1', 'tbsp', 5)
) AS v(name, amount, unit, sort_order);

WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, c.id, 'Cheesy Garlic Breadsticks', 'Warm breadsticks with garlic butter and melted cheese.', 15, 12, 4, FALSE
  FROM public.categories c
  WHERE c.name = 'Snacks'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('pizza dough', '1', 'ball', 1),
  ('butter', '2', 'tbsp', 2),
  ('garlic', '2', 'cloves', 3),
  ('mozzarella', '1', 'cup', 4),
  ('parsley', '1', 'tbsp', 5)
) AS v(name, amount, unit, sort_order);

WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, c.id, 'Simple Berry Crumble', 'A quick dessert with juicy berries and a buttery topping.', 15, 30, 4, FALSE
  FROM public.categories c
  WHERE c.name = 'Desserts'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('mixed berries', '3', 'cups', 1),
  ('brown sugar', '1/3', 'cup', 2),
  ('flour', '1', 'cup', 3),
  ('butter', '1/4', 'cup', 4),
  ('cinnamon', '1', 'tsp', 5)
) AS v(name, amount, unit, sort_order);

WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, c.id, 'Cozy Ginger Tea', 'A soothing tea with fresh ginger and warm spices.', 5, 10, 2, FALSE
  FROM public.categories c
  WHERE c.name = 'Drinks'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('fresh ginger', '2', 'tbsp', 1),
  ('water', '2', 'cups', 2),
  ('honey', '1', 'tbsp', 3),
  ('lemon', '1', 'slice', 4),
  ('cinnamon', '1', 'stick', 5)
) AS v(name, amount, unit, sort_order);

WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, c.id, 'Lemon Herb Roast Chicken', 'A simple roasted chicken with bright citrus and herbs.', 20, 45, 4, FALSE
  FROM public.categories c
  WHERE c.name = 'Dinner'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('chicken thighs', '4', '', 1),
  ('olive oil', '2', 'tbsp', 2),
  ('lemon', '1', '', 3),
  ('garlic', '3', 'cloves', 4),
  ('rosemary', '1', 'tbsp', 5)
) AS v(name, amount, unit, sort_order);

-- Profile 2: 10 recipes (2 private)
WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, c.id, 'Buttery Corn Pancakes', 'Soft corn pancakes that work well for a quick breakfast.', 15, 15, 4, FALSE
  FROM public.categories c
  WHERE c.name = 'Breakfast'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('cornmeal', '1', 'cup', 1),
  ('egg', '1', '', 2),
  ('milk', '3/4', 'cup', 3),
  ('butter', '1', 'tbsp', 4),
  ('salt', '1', 'pinch', 5)
) AS v(name, amount, unit, sort_order);

WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, c.id, 'Banana Peanut Butter Toast', 'A fast breakfast toast with sweet banana and nutty spread.', 5, 0, 1, FALSE
  FROM public.categories c
  WHERE c.name = 'Breakfast'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('bread', '2', 'slices', 1),
  ('banana', '1', '', 2),
  ('peanut butter', '2', 'tbsp', 3),
  ('cinnamon', '1', 'pinch', 4),
  ('chia seeds', '1', 'tbsp', 5)
) AS v(name, amount, unit, sort_order);

WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, c.id, 'Savory Ham and Cheese Pinwheels', 'A simple lunch treat rolled in puff pastry and filled with ham.', 15, 20, 4, FALSE
  FROM public.categories c
  WHERE c.name = 'Lunch'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('puff pastry', '1', 'sheet', 1),
  ('ham', '6', 'oz', 2),
  ('cheese', '1', 'cup', 3),
  ('mustard', '1', 'tbsp', 4),
  ('egg wash', '1', '', 5)
) AS v(name, amount, unit, sort_order);

WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, c.id, 'Creamy Tomato Pasta', 'A quick pasta dinner with a rich tomato cream sauce.', 10, 20, 4, FALSE
  FROM public.categories c
  WHERE c.name = 'Dinner'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('pasta', '8', 'oz', 1),
  ('tomato sauce', '1', 'cup', 2),
  ('cream', '1/2', 'cup', 3),
  ('garlic', '2', 'cloves', 4),
  ('parmesan', '1/4', 'cup', 5)
) AS v(name, amount, unit, sort_order);

WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, c.id, 'Roasted Vegetable Soup', 'A cozy soup with roasted vegetables and herbs.', 15, 35, 4, TRUE
  FROM public.categories c
  WHERE c.name = 'Soups'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('carrot', '2', '', 1),
  ('celery', '2', 'stalks', 2),
  ('onion', '1', '', 3),
  ('vegetable broth', '3', 'cups', 4),
  ('thyme', '1', 'tsp', 5)
) AS v(name, amount, unit, sort_order);

WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, c.id, 'Mediterranean Chickpea Salad', 'A bright salad with chickpeas, herbs, and lemon.', 10, 0, 2, FALSE
  FROM public.categories c
  WHERE c.name = 'Salads'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('chickpeas', '1', 'can', 1),
  ('cucumber', '1', '', 2),
  ('tomato', '1', '', 3),
  ('olive oil', '2', 'tbsp', 4),
  ('parsley', '1', 'tbsp', 5)
) AS v(name, amount, unit, sort_order);

WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, c.id, 'Crispy Potato Skins', 'Golden potato skins with cheese and a little sour cream.', 15, 25, 4, FALSE
  FROM public.categories c
  WHERE c.name = 'Snacks'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('potatoes', '4', '', 1),
  ('cheddar', '1', 'cup', 2),
  ('sour cream', '1/4', 'cup', 3),
  ('green onion', '2', 'tbsp', 4),
  ('butter', '1', 'tbsp', 5)
) AS v(name, amount, unit, sort_order);

WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, c.id, 'Cinnamon Sugar Roasted Pears', 'Simple roasted pears with a warm spice finish.', 10, 20, 2, FALSE
  FROM public.categories c
  WHERE c.name = 'Desserts'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('pears', '2', '', 1),
  ('brown sugar', '2', 'tbsp', 2),
  ('cinnamon', '1', 'tsp', 3),
  ('butter', '1', 'tbsp', 4),
  ('vanilla', '1', 'tsp', 5)
) AS v(name, amount, unit, sort_order);

WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, c.id, 'Refreshing Lime Lemonade', 'A bright homemade lemonade with citrusy freshness.', 10, 0, 4, TRUE
  FROM public.categories c
  WHERE c.name = 'Drinks'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('water', '4', 'cups', 1),
  ('lime juice', '1/2', 'cup', 2),
  ('lemon juice', '1/2', 'cup', 3),
  ('sugar', '1/3', 'cup', 4),
  ('ice', '2', 'cups', 5)
) AS v(name, amount, unit, sort_order);

WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, c.id, 'Maple Glazed Carrots', 'Tender carrots coated in maple glaze for an easy side.', 10, 20, 4, FALSE
  FROM public.categories c
  WHERE c.name = 'Dinner'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('carrots', '4', '', 1),
  ('maple syrup', '2', 'tbsp', 2),
  ('butter', '1', 'tbsp', 3),
  ('salt', '1', 'pinch', 4),
  ('parsley', '1', 'tbsp', 5)
) AS v(name, amount, unit, sort_order);

-- Profile 3: 10 recipes (2 private)
WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, c.id, 'Soft Fluffy Pancakes', 'A classic homemade breakfast pancake stack.', 15, 15, 4, FALSE
  FROM public.categories c
  WHERE c.name = 'Breakfast'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('flour', '1', 'cup', 1),
  ('egg', '1', '', 2),
  ('milk', '3/4', 'cup', 3),
  ('butter', '1', 'tbsp', 4),
  ('baking powder', '1', 'tsp', 5)
) AS v(name, amount, unit, sort_order);

WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, c.id, 'Turkey and Veggie Wraps', 'Handy wraps filled with turkey, greens, and crunchy vegetables.', 10, 0, 2, FALSE
  FROM public.categories c
  WHERE c.name = 'Lunch'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('tortillas', '4', '', 1),
  ('turkey', '8', 'oz', 2),
  ('spinach', '2', 'cups', 3),
  ('bell pepper', '1', '', 4),
  ('mustard', '2', 'tbsp', 5)
) AS v(name, amount, unit, sort_order);

WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, c.id, 'Slow Simmered Beef Stew', 'A hearty dinner stew with tender beef and vegetables.', 20, 90, 6, FALSE
  FROM public.categories c
  WHERE c.name = 'Dinner'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('beef chunks', '1', 'lb', 1),
  ('potatoes', '2', '', 2),
  ('carrots', '2', '', 3),
  ('onion', '1', '', 4),
  ('beef broth', '3', 'cups', 5)
) AS v(name, amount, unit, sort_order);

WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, c.id, 'Creamy Potato Leek Soup', 'A silky soup made from potatoes, leeks, and a little cream.', 15, 30, 4, TRUE
  FROM public.categories c
  WHERE c.name = 'Soups'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('potatoes', '3', '', 1),
  ('leeks', '2', '', 2),
  ('butter', '2', 'tbsp', 3),
  ('vegetable broth', '3', 'cups', 4),
  ('cream', '1/2', 'cup', 5)
) AS v(name, amount, unit, sort_order);

WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, c.id, 'Greek Pasta Salad', 'A fresh pasta salad with feta, olives, and herbs.', 15, 0, 4, FALSE
  FROM public.categories c
  WHERE c.name = 'Salads'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('pasta', '8', 'oz', 1),
  ('feta', '1', 'cup', 2),
  ('olives', '1/2', 'cup', 3),
  ('cucumber', '1', '', 4),
  ('olive oil', '2', 'tbsp', 5)
) AS v(name, amount, unit, sort_order);

WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, c.id, 'Homemade Trail Mix', 'A simple snack mix with nuts, seeds, and dried fruit.', 5, 0, 4, TRUE
  FROM public.categories c
  WHERE c.name = 'Snacks'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('almonds', '1', 'cup', 1),
  ('peanuts', '1', 'cup', 2),
  ('dried cranberries', '1/2', 'cup', 3),
  ('pumpkin seeds', '1/2', 'cup', 4),
  ('honey', '1', 'tbsp', 5)
) AS v(name, amount, unit, sort_order);

WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, c.id, 'Vanilla Banana Mug Cake', 'A warm single-serve dessert made in minutes.', 5, 5, 1, FALSE
  FROM public.categories c
  WHERE c.name = 'Desserts'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('banana', '1', '', 1),
  ('flour', '3', 'tbsp', 2),
  ('sugar', '1', 'tbsp', 3),
  ('milk', '2', 'tbsp', 4),
  ('vanilla', '1/4', 'tsp', 5)
) AS v(name, amount, unit, sort_order);

WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, c.id, 'Sparkling Berry Spritz', 'A refreshing drink with berries and sparkling water.', 5, 0, 2, FALSE
  FROM public.categories c
  WHERE c.name = 'Drinks'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('mixed berries', '1', 'cup', 1),
  ('sparkling water', '2', 'cups', 2),
  ('lime', '1', '', 3),
  ('honey', '1', 'tbsp', 4),
  ('ice', '1', 'cup', 5)
) AS v(name, amount, unit, sort_order);

WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, c.id, 'Crispy Baked Zucchini Fries', 'A simple snack with crunchy zucchini sticks and herbs.', 10, 20, 4, FALSE
  FROM public.categories c
  WHERE c.name = 'Snacks'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('zucchini', '2', '', 1),
  ('breadcrumbs', '1', 'cup', 2),
  ('egg', '1', '', 3),
  ('parmesan', '1/4', 'cup', 4),
  ('oregano', '1', 'tsp', 5)
) AS v(name, amount, unit, sort_order);

WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id, category_id, title, description, prep_time, cook_time, servings, is_private
  )
  SELECT '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, c.id, 'Garlic Butter Green Beans', 'Tender green beans finished with butter and garlic.', 10, 10, 4, FALSE
  FROM public.categories c
  WHERE c.name = 'Dinner'
  RETURNING id
)
INSERT INTO public.ingredients (recipe_id, name, amount, unit, sort_order)
SELECT ir.id, v.name, v.amount, v.unit, v.sort_order
FROM inserted_recipe ir
CROSS JOIN (VALUES
  ('green beans', '1', 'lb', 1),
  ('butter', '2', 'tbsp', 2),
  ('garlic', '2', 'cloves', 3),
  ('salt', '1', 'pinch', 4),
  ('black pepper', '1', 'pinch', 5)
) AS v(name, amount, unit, sort_order);

-- Insert recipe steps
INSERT INTO public.recipe_steps (recipe_id, step_number, description)
SELECT r.id, s.step_number, s.description
FROM public.recipes r
JOIN (
  VALUES
    ('Classic Scrambled Eggs', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 1, 'Whisk the eggs with milk, salt, and pepper.'),
    ('Classic Scrambled Eggs', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 2, 'Melt butter in a nonstick pan over low heat.'),
    ('Classic Scrambled Eggs', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 3, 'Pour in the eggs and stir gently until softly set.'),
    ('Classic Scrambled Eggs', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 4, 'Serve warm with toast or roasted potatoes.'),
    ('Warm Apple Cinnamon Oats', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 1, 'Cook the oats with milk until creamy.'),
    ('Warm Apple Cinnamon Oats', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 2, 'Dice the apple and stir it in with cinnamon.'),
    ('Warm Apple Cinnamon Oats', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 3, 'Simmer until the fruit softens.'),
    ('Warm Apple Cinnamon Oats', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 4, 'Drizzle with honey before serving.'),
    ('Turkey and Veggie Pita', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 1, 'Slice the vegetables into thin strips.'),
    ('Turkey and Veggie Pita', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 2, 'Layer turkey and vegetables inside the pita.'),
    ('Turkey and Veggie Pita', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 3, 'Press gently so the filling stays compact.'),
    ('Turkey and Veggie Pita', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 4, 'Serve immediately or wrap for later.'),
    ('Herb Chicken Rice Bowl', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 1, 'Season and pan-cook the chicken until golden.'),
    ('Herb Chicken Rice Bowl', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 2, 'Warm the rice and spoon it into bowls.'),
    ('Herb Chicken Rice Bowl', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 3, 'Slice the chicken and place it on top.'),
    ('Herb Chicken Rice Bowl', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 4, 'Finish with parsley, lemon juice, and a drizzle of oil.'),
    ('Weeknight Tomato Soup', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 1, 'Saute onion and garlic until fragrant.'),
    ('Weeknight Tomato Soup', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 2, 'Add tomatoes and broth, then simmer for 15 minutes.'),
    ('Weeknight Tomato Soup', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 3, 'Blend until smooth.'),
    ('Weeknight Tomato Soup', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 4, 'Stir in cream and serve hot.'),
    ('Garden Cucumber Salad', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 1, 'Slice the cucumber and tomato into bite-size pieces.'),
    ('Garden Cucumber Salad', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 2, 'Toss with olive oil and lemon juice.'),
    ('Garden Cucumber Salad', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 3, 'Scatter over fresh dill.'),
    ('Garden Cucumber Salad', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 4, 'Chill briefly and serve cold.'),
    ('Cheesy Garlic Breadsticks', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 1, 'Roll the dough into strips and place on a tray.'),
    ('Cheesy Garlic Breadsticks', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 2, 'Brush with garlic butter and sprinkle cheese on top.'),
    ('Cheesy Garlic Breadsticks', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 3, 'Bake until puffed and golden.'),
    ('Cheesy Garlic Breadsticks', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 4, 'Finish with parsley and serve warm.'),
    ('Simple Berry Crumble', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 1, 'Mix the berries with sugar and spread them in a baking dish.'),
    ('Simple Berry Crumble', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 2, 'Combine flour, butter, and cinnamon into crumbs.'),
    ('Simple Berry Crumble', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 3, 'Sprinkle the topping over the berries.'),
    ('Simple Berry Crumble', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 4, 'Bake until bubbling and golden.'),
    ('Cozy Ginger Tea', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 1, 'Simmer ginger and cinnamon in water for 8 minutes.'),
    ('Cozy Ginger Tea', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 2, 'Strain the liquid into a mug.'),
    ('Cozy Ginger Tea', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 3, 'Stir in honey and lemon.'),
    ('Cozy Ginger Tea', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 4, 'Sip while warm.'),
    ('Lemon Herb Roast Chicken', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 1, 'Rub the chicken with oil, lemon, garlic, and rosemary.'),
    ('Lemon Herb Roast Chicken', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 2, 'Bake until the skin is crisp and the juices run clear.'),
    ('Lemon Herb Roast Chicken', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 3, 'Rest the chicken briefly before slicing.'),
    ('Lemon Herb Roast Chicken', '681e82a0-96b1-40bc-80e4-4df35d72584f'::uuid, 4, 'Serve with roasted vegetables or rice.'),
    ('Buttery Corn Pancakes', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 1, 'Mix the dry ingredients with egg and milk.'),
    ('Buttery Corn Pancakes', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 2, 'Melt butter in a skillet and spoon in the batter.'),
    ('Buttery Corn Pancakes', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 3, 'Cook until bubbles form and flip.'),
    ('Buttery Corn Pancakes', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 4, 'Serve warm with syrup or yogurt.'),
    ('Banana Peanut Butter Toast', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 1, 'Toast the bread until golden.'),
    ('Banana Peanut Butter Toast', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 2, 'Spread peanut butter over the warm toast.'),
    ('Banana Peanut Butter Toast', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 3, 'Top with sliced banana and cinnamon.'),
    ('Banana Peanut Butter Toast', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 4, 'Finish with chia seeds and serve.'),
    ('Savory Ham and Cheese Pinwheels', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 1, 'Roll out the pastry and brush lightly with mustard.'),
    ('Savory Ham and Cheese Pinwheels', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 2, 'Layer ham and cheese over the surface.'),
    ('Savory Ham and Cheese Pinwheels', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 3, 'Roll into a log and slice into rounds.'),
    ('Savory Ham and Cheese Pinwheels', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 4, 'Bake until golden and crisp.'),
    ('Creamy Tomato Pasta', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 1, 'Cook the pasta until al dente.'),
    ('Creamy Tomato Pasta', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 2, 'Saute garlic and stir in tomato sauce and cream.'),
    ('Creamy Tomato Pasta', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 3, 'Toss the pasta through the sauce.'),
    ('Creamy Tomato Pasta', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 4, 'Finish with parmesan and serve hot.'),
    ('Roasted Vegetable Soup', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 1, 'Roast the vegetables until caramelized.'),
    ('Roasted Vegetable Soup', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 2, 'Transfer them to a pot with broth.'),
    ('Roasted Vegetable Soup', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 3, 'Simmer until everything is tender.'),
    ('Roasted Vegetable Soup', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 4, 'Blend until smooth and season with thyme.'),
    ('Mediterranean Chickpea Salad', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 1, 'Rinse the chickpeas and drain well.'),
    ('Mediterranean Chickpea Salad', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 2, 'Dice the vegetables and combine them in a bowl.'),
    ('Mediterranean Chickpea Salad', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 3, 'Toss with olive oil and parsley.'),
    ('Mediterranean Chickpea Salad', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 4, 'Serve chilled or room temperature.'),
    ('Crispy Potato Skins', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 1, 'Bake the potatoes until tender, then halve them.'),
    ('Crispy Potato Skins', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 2, 'Scoop out the centers and crisp the shells.'),
    ('Crispy Potato Skins', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 3, 'Fill with cheese and return to the oven.'),
    ('Crispy Potato Skins', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 4, 'Top with sour cream and green onion.'),
    ('Cinnamon Sugar Roasted Pears', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 1, 'Halve the pears and remove the cores.'),
    ('Cinnamon Sugar Roasted Pears', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 2, 'Fill with brown sugar, cinnamon, butter, and vanilla.'),
    ('Cinnamon Sugar Roasted Pears', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 3, 'Roast until fragrant and tender.'),
    ('Cinnamon Sugar Roasted Pears', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 4, 'Serve warm on their own or with yogurt.'),
    ('Refreshing Lime Lemonade', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 1, 'Stir sugar into a little warm water until dissolved.'),
    ('Refreshing Lime Lemonade', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 2, 'Mix in the lime and lemon juices.'),
    ('Refreshing Lime Lemonade', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 3, 'Add the remaining water and chill.'),
    ('Refreshing Lime Lemonade', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 4, 'Serve over ice with citrus slices.'),
    ('Maple Glazed Carrots', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 1, 'Toss carrots with butter, maple syrup, and salt.'),
    ('Maple Glazed Carrots', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 2, 'Roast or saute until tender and glossy.'),
    ('Maple Glazed Carrots', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 3, 'Stir halfway through cooking.'),
    ('Maple Glazed Carrots', '8e442da5-82e7-4f77-9b1c-f0dd96038237'::uuid, 4, 'Finish with parsley before serving.'),
    ('Soft Fluffy Pancakes', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 1, 'Whisk the dry ingredients together.'),
    ('Soft Fluffy Pancakes', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 2, 'Add egg, milk, and melted butter to form a thick batter.'),
    ('Soft Fluffy Pancakes', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 3, 'Cook small rounds on a lightly greased pan.'),
    ('Soft Fluffy Pancakes', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 4, 'Flip once and serve warm with syrup.'),
    ('Turkey and Veggie Wraps', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 1, 'Lay out the tortillas and spread on mustard.'),
    ('Turkey and Veggie Wraps', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 2, 'Layer turkey, spinach, and sliced peppers.'),
    ('Turkey and Veggie Wraps', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 3, 'Roll tightly into wraps.'),
    ('Turkey and Veggie Wraps', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 4, 'Slice in half and pack for lunch.'),
    ('Slow Simmered Beef Stew', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 1, 'Brown the beef in a heavy pot.'),
    ('Slow Simmered Beef Stew', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 2, 'Add onion, carrots, and potatoes.'),
    ('Slow Simmered Beef Stew', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 3, 'Pour in broth and simmer gently.'),
    ('Slow Simmered Beef Stew', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 4, 'Cook until the beef is tender and the stew thickens.'),
    ('Creamy Potato Leek Soup', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 1, 'Saute the leeks in butter until softened.'),
    ('Creamy Potato Leek Soup', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 2, 'Add potatoes and broth, then simmer until tender.'),
    ('Creamy Potato Leek Soup', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 3, 'Blend until smooth.'),
    ('Creamy Potato Leek Soup', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 4, 'Stir in cream and adjust the seasoning.'),
    ('Greek Pasta Salad', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 1, 'Cook the pasta and chill it briefly.'),
    ('Greek Pasta Salad', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 2, 'Toss with chopped cucumber, olives, and feta.'),
    ('Greek Pasta Salad', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 3, 'Dress with olive oil and a squeeze of lemon.'),
    ('Greek Pasta Salad', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 4, 'Serve cold or at room temperature.'),
    ('Homemade Trail Mix', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 1, 'Combine the nuts and seeds in a bowl.'),
    ('Homemade Trail Mix', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 2, 'Stir in the dried cranberries.'),
    ('Homemade Trail Mix', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 3, 'Drizzle lightly with honey and toss.'),
    ('Homemade Trail Mix', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 4, 'Store in an airtight jar for later snacking.'),
    ('Vanilla Banana Mug Cake', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 1, 'Mash the banana in a microwave-safe mug.'),
    ('Vanilla Banana Mug Cake', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 2, 'Stir in flour, sugar, milk, and vanilla.'),
    ('Vanilla Banana Mug Cake', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 3, 'Microwave until puffed and set.'),
    ('Vanilla Banana Mug Cake', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 4, 'Cool briefly and enjoy warm.'),
    ('Sparkling Berry Spritz', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 1, 'Muddle the berries with honey in a glass.'),
    ('Sparkling Berry Spritz', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 2, 'Add lime juice and a few ice cubes.'),
    ('Sparkling Berry Spritz', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 3, 'Pour over sparkling water.'),
    ('Sparkling Berry Spritz', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 4, 'Stir gently and serve immediately.'),
    ('Crispy Baked Zucchini Fries', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 1, 'Slice the zucchini into fries.'),
    ('Crispy Baked Zucchini Fries', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 2, 'Dip them in egg, then coat in breadcrumbs and parmesan.'),
    ('Crispy Baked Zucchini Fries', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 3, 'Bake until crisp and golden.'),
    ('Crispy Baked Zucchini Fries', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 4, 'Sprinkle with oregano and serve warm.'),
    ('Garlic Butter Green Beans', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 1, 'Steam the green beans until just tender.'),
    ('Garlic Butter Green Beans', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 2, 'Saute garlic in butter until fragrant.'),
    ('Garlic Butter Green Beans', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 3, 'Toss the beans through the garlic butter.'),
    ('Garlic Butter Green Beans', '0566deea-4d84-45d2-b85a-6131c276d166'::uuid, 4, 'Season with salt and pepper before serving.')
  ) AS s(title, user_id, step_number, description)
ON r.title = s.title AND r.user_id = s.user_id;
