const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const envPath = path.resolve(__dirname, '..', '.env')
const envFile = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : ''

function readEnvValue(key) {
  const match = envFile.match(new RegExp(`^${key}=(.*)$`, 'm'))
  if (!match) return null
  return match[1].trim().replace(/^['"]|['"]$/g, '')
}

const supabaseUrl = readEnvValue('SUPABASE_URL') || readEnvValue('VITE_SUPABASE_URL')
const serviceKey = readEnvValue('SUPABASE_SECRET_KEY') || readEnvValue('SUPABASE_SERVICE_ROLE_KEY')

if (!supabaseUrl || !serviceKey) {
  throw new Error('Missing Supabase URL or secret key in .env')
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

const bucket = 'recipe-images'
const recipes = [
  ['Classic Scrambled Eggs', 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1200&q=80'],
  ['Warm Apple Cinnamon Oats', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80'],
  ['Turkey and Veggie Pita', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80'],
  ['Herb Chicken Rice Bowl', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80'],
  ['Weeknight Tomato Soup', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80'],
  ['Garden Cucumber Salad', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=1200&q=80'],
  ['Cheesy Garlic Breadsticks', 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=1200&q=80'],
  ['Simple Berry Crumble', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80'],
  ['Cozy Ginger Tea', 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?auto=format&fit=crop&w=1200&q=80'],
  ['Lemon Herb Roast Chicken', 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&w=1200&q=80'],
  ['Buttery Corn Pancakes', 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=1200&q=80'],
  ['Banana Peanut Butter Toast', 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&w=1200&q=80'],
  ['Savory Ham and Cheese Pinwheels', 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=1200&q=80'],
  ['Creamy Tomato Pasta', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1200&q=80'],
  ['Roasted Vegetable Soup', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80'],
  ['Mediterranean Chickpea Salad', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80'],
  ['Crispy Potato Skins', 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80'],
  ['Cinnamon Sugar Roasted Pears', 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=1200&q=80'],
  ['Refreshing Lime Lemonade', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80'],
  ['Maple Glazed Carrots', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80'],
  ['Soft Fluffy Pancakes', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80'],
  ['Turkey and Veggie Wraps', 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=1200&q=80'],
  ['Slow Simmered Beef Stew', 'https://images.unsplash.com/photo-1464219551459-ac14b8c1a8a6?auto=format&fit=crop&w=1200&q=80'],
  ['Creamy Potato Leek Soup', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80'],
  ['Greek Pasta Salad', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80'],
  ['Homemade Trail Mix', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80'],
  ['Vanilla Banana Mug Cake', 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=1200&q=80'],
  ['Sparkling Berry Spritz', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80'],
  ['Crispy Baked Zucchini Fries', 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&w=1200&q=80'],
  ['Garlic Butter Green Beans', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80'],
]

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function main() {
  for (const [title, imageUrl] of recipes) {
    const fileName = `${slugify(title)}.jpg`
    const filePath = `shared/${fileName}`

    const response = await fetch(imageUrl)
    if (!response.ok) throw new Error(`Failed to download ${title}: ${response.status}`)

    const buffer = Buffer.from(await response.arrayBuffer())

    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, buffer, {
      contentType: 'image/jpeg',
      upsert: true,
    })

    if (uploadError) {
      console.error(`Upload failed for ${title}`, uploadError)
      continue
    }

    const {\n      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath)

    const { error: updateError } = await supabase
      .from('recipes')
      .update({ image_url: publicUrl })
      .eq('title', title)

    if (updateError) {
      console.error(`Update failed for ${title}`, updateError)
      continue
    }

    console.log(`Updated ${title} -> ${publicUrl}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
