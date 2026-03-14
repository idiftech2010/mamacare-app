export interface EducationArticle {
  id: string;
  title: string;
  category: 'nutrition' | 'exercise' | 'mental-health' | 'prenatal' | 'postnatal' | 'newborn';
  excerpt: string;
  content: string;
  image: string;
  readTime: number;
  author: string;
  publishedAt: string;
  tags: string[];
}

export const educationArticles: EducationArticle[] = [
  {
    id: 'nutrition-1',
    title: 'Essential Nutrients for a Healthy Pregnancy',
    category: 'nutrition',
    excerpt: 'Discover the key nutrients your body needs during pregnancy and how to incorporate them into your daily diet.',
    content: `
## Essential Nutrients for a Healthy Pregnancy

During pregnancy, your body needs additional nutrients to support your baby's growth and development. Here are the most important ones:

### Folic Acid (Vitamin B9)
- **Why it's important:** Prevents neural tube defects
- **Daily requirement:** 600-800 mcg
- **Food sources:** Leafy greens, fortified cereals, beans, citrus fruits

### Iron
- **Why it's important:** Prevents anemia and supports blood volume increase
- **Daily requirement:** 27 mg
- **Food sources:** Red meat, spinach, lentils, fortified cereals

### Calcium
- **Why it's important:** Builds strong bones and teeth
- **Daily requirement:** 1,000 mg
- **Food sources:** Dairy products, fortified plant milk, leafy greens

### Protein
- **Why it's important:** Supports fetal tissue growth
- **Daily requirement:** 71 grams
- **Food sources:** Lean meat, poultry, fish, eggs, beans, nuts

### Omega-3 Fatty Acids
- **Why it's important:** Supports brain and eye development
- **Daily requirement:** 200-300 mg DHA
- **Food sources:** Fatty fish, walnuts, flaxseeds, chia seeds

## Sample Daily Meal Plan

**Breakfast:**
- Fortified oatmeal with berries and nuts
- Glass of fortified orange juice

**Mid-morning Snack:**
- Greek yogurt with sliced banana

**Lunch:**
- Grilled chicken salad with leafy greens
- Whole grain roll

**Afternoon Snack:**
- Apple with almond butter

**Dinner:**
- Baked salmon
- Quinoa
- Steamed broccoli

**Evening Snack:**
- Whole grain crackers with cheese

Remember to stay hydrated by drinking at least 8-10 glasses of water daily!
    `,
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop',
    readTime: 8,
    author: 'Dr. Zanele Mthembu',
    publishedAt: '2025-01-15',
    tags: ['nutrition', 'diet', 'prenatal', 'healthy-eating'],
  },
  {
    id: 'exercise-1',
    title: 'Safe Exercises During Pregnancy',
    category: 'exercise',
    excerpt: 'Learn which exercises are safe and beneficial during each trimester of your pregnancy.',
    content: `
## Safe Exercises During Pregnancy

Staying active during pregnancy offers numerous benefits including improved mood, better sleep, and easier labor. Here's what you need to know:

### First Trimester (Weeks 1-12)

**Safe Activities:**
- Walking (30 minutes daily)
- Swimming
- Prenatal yoga
- Light strength training
- Stationary cycling

**Exercises to Avoid:**
- Contact sports
- High-impact activities
- Exercises lying flat on your back
- Hot yoga or pilates

### Second Trimester (Weeks 13-27)

This is often the most comfortable time to exercise. You can continue most first-trimester activities and add:

- Pelvic floor exercises (Kegels)
- Modified planks
- Side-lying leg lifts
- Prenatal Pilates

### Third Trimester (Weeks 28-40)

Focus on low-impact activities:
- Walking
- Swimming
- Gentle stretching
- Prenatal yoga
- Pelvic tilts

## Important Safety Tips

1. **Stay hydrated** - Drink water before, during, and after exercise
2. **Avoid overheating** - Exercise in cool environments
3. **Listen to your body** - Stop if you feel dizzy, short of breath, or experience pain
4. **Wear supportive clothing** - Including a good sports bra
5. **Avoid lying flat** on your back after the first trimester

## Warning Signs to Stop Exercising

Contact your healthcare provider if you experience:
- Vaginal bleeding
- Dizziness or faintness
- Chest pain
- Calf pain or swelling
- Decreased fetal movement
- Contractions

Always consult with your healthcare provider before starting any exercise program during pregnancy.
    `,
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop',
    readTime: 10,
    author: 'Dr. Sarah Mitchell',
    publishedAt: '2025-01-20',
    tags: ['exercise', 'fitness', 'prenatal', 'wellness'],
  },
  {
    id: 'mental-health-1',
    title: 'Managing Pregnancy Anxiety and Stress',
    category: 'mental-health',
    excerpt: 'Practical strategies for maintaining good mental health throughout your pregnancy journey.',
    content: `
## Managing Pregnancy Anxiety and Stress

Pregnancy is a time of significant change, and it's completely normal to experience a range of emotions. Here's how to take care of your mental health:

### Understanding Pregnancy Emotions

Hormonal changes can affect your mood and emotions. You might experience:
- Mood swings
- Anxiety about the baby\'s health
- Worry about labor and delivery
- Concerns about becoming a parent
- Body image concerns

### Coping Strategies

**1. Practice Mindfulness**
- Try meditation apps designed for pregnancy
- Practice deep breathing exercises
- Focus on the present moment

**2. Stay Connected**
- Share your feelings with your partner
- Join a pregnancy support group
- Talk to friends who have been through pregnancy

**3. Self-Care Activities**
- Take warm baths (not too hot)
- Read books about pregnancy and parenting
- Get a prenatal massage
- Practice gentle yoga

**4. Prepare and Plan**
- Attend childbirth classes
- Create a birth plan
- Set up the nursery
- Research childcare options

**5. Maintain Healthy Habits**
- Get adequate sleep (7-9 hours)
- Eat nutritious meals
- Exercise regularly
- Limit caffeine intake

### When to Seek Help

Contact a mental health professional if you experience:
- Persistent sadness or hopelessness
- Loss of interest in activities
- Excessive worry that interferes with daily life
- Panic attacks
- Thoughts of harming yourself or your baby

Remember, seeking help is a sign of strength, not weakness. Your mental health is just as important as your physical health during pregnancy.
    `,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop',
    readTime: 7,
    author: 'Dr. Emily Johnson',
    publishedAt: '2025-01-25',
    tags: ['mental-health', 'anxiety', 'stress', 'wellness'],
  },
  {
    id: 'prenatal-1',
    title: 'Your First Trimester: What to Expect',
    category: 'prenatal',
    excerpt: 'A comprehensive guide to navigating the first 12 weeks of your pregnancy.',
    content: `
## Your First Trimester: What to Expect

The first trimester is a time of rapid development for your baby and significant changes for your body. Here's what you need to know:

### Baby\'s Development

**Weeks 1-4:**
- Fertilization and implantation occur
- Neural tube begins to form
- Heart starts beating around week 6

**Weeks 5-8:**
- Major organs begin developing
- Facial features start forming
- Arms and legs bud
- Baby is about 1 inch long

**Weeks 9-12:**
- Baby is now called a fetus
- All major organs are formed
- Fingers and toes separate
- Baby can move (though you won\'t feel it yet)

### Common Symptoms

**Physical Changes:**
- Morning sickness (nausea and vomiting)
- Breast tenderness
- Fatigue
- Frequent urination
- Food cravings or aversions
- Mild cramping

**Emotional Changes:**
- Mood swings
- Anxiety or excitement
- Feeling overwhelmed

### Prenatal Care Checklist

**Schedule your first prenatal visit:**
- Usually between weeks 8-10
- Bring your medical history
- List of current medications
- Questions for your provider

**Start taking prenatal vitamins:**
- Folic acid (400-800 mcg daily)
- Iron
- DHA

**Lifestyle Changes:**
- Stop smoking and avoid alcohol
- Limit caffeine to 200mg daily
- Avoid raw or undercooked foods
- Stay hydrated

### When to Call Your Doctor

- Severe abdominal pain
- Heavy bleeding
- Severe vomiting
- Fever over 100.4°F (38°C)
- Signs of dehydration

Remember, every pregnancy is different. Trust your instincts and don\'t hesitate to reach out to your healthcare provider with any concerns.
    `,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop',
    readTime: 12,
    author: 'Dr. Amara Okafor',
    publishedAt: '2025-02-01',
    tags: ['prenatal', 'first-trimester', 'pregnancy-basics'],
  },
  {
    id: 'postnatal-1',
    title: 'Postpartum Recovery: A Complete Guide',
    category: 'postnatal',
    excerpt: 'Everything you need to know about recovering after childbirth and caring for yourself.',
    content: `
## Postpartum Recovery: A Complete Guide

The postpartum period, also known as the fourth trimester, is a time of physical and emotional recovery. Here's what to expect and how to care for yourself:

### Physical Recovery

**First 24 Hours:**
- You\'ll experience vaginal bleeding (lochia)
- Uterine contractions as it shrinks back to size
- Possible perineal pain or discomfort
- Difficulty urinating

**First Week:**
- Continued bleeding (should gradually lighten)
- Breast engorgement as milk comes in
- Night sweats
- Fatigue

**Weeks 2-6:**
- Bleeding should taper off
- Incision healing (if C-section or episiotomy)
- Hormonal changes affecting mood

### Emotional Recovery

**Baby Blues (Days 3-14):**
- Mood swings
- Crying spells
- Anxiety
- Difficulty sleeping

These are normal due to hormonal changes and usually resolve on their own.

**Postpartum Depression:**
If symptoms persist beyond two weeks or are severe, contact your healthcare provider.

### Self-Care Tips

**Physical Care:**
- Rest as much as possible
- Accept help from family and friends
- Eat nutritious meals
- Stay hydrated
- Do gentle exercises when cleared by doctor

**Emotional Care:**
- Talk about your feelings
- Connect with other new moms
- Take breaks when needed
- Don\'t expect perfection

### Warning Signs

Contact your doctor immediately if you experience:
- Heavy bleeding (soaking a pad in an hour)
- Fever over 100.4°F
- Signs of infection
- Severe headache
- Chest pain
- Thoughts of harming yourself or baby

### Breastfeeding Tips

- Feed on demand (8-12 times daily)
- Ensure proper latch
- Stay hydrated
- Eat extra calories (about 500 more daily)
- Seek help from a lactation consultant if needed

Remember, recovery takes time. Be patient and kind to yourself as you adjust to motherhood.
    `,
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&h=600&fit=crop',
    readTime: 15,
    author: 'Dr. Aisha Hassan',
    publishedAt: '2025-02-05',
    tags: ['postnatal', 'postpartum', 'recovery', 'new-mom'],
  },
  {
    id: 'newborn-1',
    title: 'Newborn Care Basics for New Parents',
    category: 'newborn',
    excerpt: 'Essential tips for caring for your newborn baby during the first few weeks.',
    content: `
## Newborn Care Basics for New Parents

Caring for a newborn can feel overwhelming, but with some basic knowledge, you'll quickly become confident. Here's what you need to know:

### Feeding Your Baby

**Breastfeeding:**
- Feed every 2-3 hours (8-12 times daily)
- Look for hunger cues: rooting, sucking motions, hand-to-mouth
- Baby should have 6-8 wet diapers daily

**Formula Feeding:**
- Feed every 3-4 hours
- Prepare formula according to instructions
- Sterilize bottles and nipples

### Sleep Patterns

Newborns sleep 16-17 hours daily but in short bursts:
- Sleep 2-4 hours at a time
- Wake for feeding
- Day/night confusion is normal

**Safe Sleep Guidelines:**
- Always place baby on their back
- Use a firm sleep surface
- Keep crib free of blankets, toys, and pillows
- Share room (not bed) for first 6 months

### Diaper Changing

**How Often:**
- Newborns need 10-12 diaper changes daily
- Change immediately after bowel movements

**Diaper Rash Prevention:**
- Change diapers frequently
- Use barrier cream
- Allow diaper-free time

### Bathing Your Baby

**Sponge Baths (Until Umbilical Cord Falls Off):**
- 2-3 times per week
- Use warm water and mild soap
- Keep umbilical stump dry

**Tub Baths:**
- After cord falls off (1-2 weeks)
- Never leave baby unattended
- Test water temperature

### Recognizing Illness

**Call Your Pediatrician If Baby Has:**
- Fever over 100.4°F (38°C)
- Poor feeding
- Lethargy
- Difficulty breathing
- Persistent crying
- Fewer wet diapers

### Bonding with Your Baby

- Skin-to-skin contact
- Talk and sing to your baby
- Respond to cries promptly
- Make eye contact

Remember, every baby is different. Trust your instincts and don't hesitate to ask for help when needed.
    `,
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&h=600&fit=crop',
    readTime: 11,
    author: 'Dr. Emily Johnson',
    publishedAt: '2025-02-10',
    tags: ['newborn', 'baby-care', 'parenting', 'infant'],
  },
];

export const getArticlesByCategory = (category: EducationArticle['category']) => {
  return educationArticles.filter(a => a.category === category);
};

export const getArticleById = (id: string) => {
  return educationArticles.find(a => a.id === id);
};

export const searchArticles = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return educationArticles.filter(a =>
    a.title.toLowerCase().includes(lowerQuery) ||
    a.excerpt.toLowerCase().includes(lowerQuery) ||
    a.tags.some(t => t.toLowerCase().includes(lowerQuery))
  );
};
