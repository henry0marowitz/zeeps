import templateLibrary from './templates.json'

const createQuestion = (id, prompt, optionA, optionB, type) => ({
  id,
  prompt,
  type,
  options: [
    { id: 'A', label: optionA },
    { id: 'B', label: optionB }
  ]
})

export const codedQuestions = [
  createQuestion('dogsCats', 'Dogs or Cats?', 'Dogs', 'Cats', 'coded'),
  createQuestion('cityCountry', 'City or countryside?', 'City', 'Countryside', 'coded'),
  createQuestion('breakfastDinner', 'Breakfast or dinner?', 'Breakfast', 'Dinner', 'coded'),
  createQuestion('moviesTV', 'Movies or TV shows?', 'Movies', 'TV shows', 'coded'),
  createQuestion('waterSoda', 'Water or soda?', 'Water', 'Soda', 'coded')
]

export const politicalQuestions = [
  createQuestion('taxes', 'High taxes or low taxes?', 'High taxes', 'Low taxes', 'policy'),
  createQuestion(
    'transit',
    'More Zeep buses or better Zeep highways?',
    'More Zeep buses',
    'Better Zeep highways',
    'policy'
  ),
  createQuestion('housing', 'Rent control or free market housing?', 'Rent control', 'Free market housing', 'policy'),
  createQuestion('schools', 'Public schools or private schools?', 'Public schools', 'Private schools', 'policy'),
  createQuestion('labor', 'More unions or more corporate autonomy?', 'More unions', 'More corporate autonomy', 'policy')
]

export const allQuestions = [...codedQuestions, ...politicalQuestions]

export const questionLookup = allQuestions.reduce((acc, question) => {
  acc[question.id] = question
  return acc
}, {})

const palette = ['#f97316', '#ec4899', '#10b981', '#6366f1', '#facc15', '#14b8a6', '#a855f7', '#ef4444']

export const zeepProfiles = [
  {
    id: 'pilgus',
    name: 'Pilgus',
    color: palette[0],
    postingPreferences: ['pro_glorp', 'glorp_coded'],
    likePreferences: ['pro_glorp'],
    actualAffiliation: 'glorp'
  },
  {
    id: 'weddle',
    name: 'Weddle',
    color: palette[1],
    postingPreferences: ['pro_glorp', 'neutral'],
    likePreferences: ['neutral'],
    actualAffiliation: 'glorp'
  },
  {
    id: 'beldge',
    name: 'Beldge',
    color: palette[2],
    postingPreferences: ['pro_glorp', 'splink_coded'],
    likePreferences: ['splink_coded'],
    actualAffiliation: 'glorp'
  },
  {
    id: 'wix',
    name: 'Wix',
    color: palette[3],
    postingPreferences: ['glorp_coded'],
    likePreferences: ['pro_splink'],
    actualAffiliation: 'neutral'
  },
  {
    id: 'helm',
    name: 'Helm',
    color: palette[4],
    postingPreferences: ['neutral'],
    likePreferences: ['neutral'],
    actualAffiliation: 'neutral'
  },
  {
    id: 'albi',
    name: 'Albi',
    color: palette[5],
    postingPreferences: ['splink_coded'],
    likePreferences: ['pro_glorp'],
    actualAffiliation: 'splink'
  },
  {
    id: 'chex',
    name: 'Chex',
    color: palette[6],
    postingPreferences: ['pro_splink', 'glorp_coded'],
    likePreferences: ['glorp_coded'],
    actualAffiliation: 'splink'
  },
  {
    id: 'fritz',
    name: 'Fritz',
    color: palette[7],
    postingPreferences: ['pro_splink', 'neutral'],
    likePreferences: ['neutral'],
    actualAffiliation: 'splink'
  },
  {
    id: 'dolp',
    name: 'Dolp',
    color: palette[0],
    postingPreferences: ['pro_splink', 'splink_coded'],
    likePreferences: ['splink_coded'],
    actualAffiliation: 'splink'
  }
]

export const categoryLabels = {
  pro_glorp: 'Pro Glorp',
  pro_splink: 'Pro Splink',
  glorp_coded: 'Glorp coded',
  splink_coded: 'Splink coded',
  neutral: 'Neutral'
}

const templateKeys = Object.keys(templateLibrary)

const initTemplateUsage = () =>
  templateKeys.reduce((acc, key) => {
    acc[key] = 0
    return acc
  }, {})

const pullTemplate = (category, trackers) => {
  const pool = templateLibrary[category] || []
  if (pool.length === 0) {
    return { template: '', cycle: 0 }
  }
  const idx = trackers.templateUsage[category] || 0
  trackers.templateUsage[category] = idx + 1
  const template = pool[idx % pool.length]
  const cycle = Math.floor(idx / pool.length)
  return { template, cycle }
}

const fillTemplate = (templateString, context) => {
  if (!templateString) return ''
  const replacements = {
    zeep: context.zeep?.name || '',
    party: context.partyLabel || '',
    partyLower: context.partyLabel?.toLowerCase() || '',
    option: context.option?.label || '',
    optionLower: context.option?.label?.toLowerCase() || '',
    opposite: context.opposite?.label || '',
    oppositeLower: context.opposite?.label?.toLowerCase() || '',
    question: context.question?.prompt || '',
    questionLower: context.question?.prompt?.toLowerCase() || ''
  }
  return templateString.replace(/{{\s*(\w+)\s*}}/g, (_, key) => replacements[key] ?? '')
}

const ensureUniqueText = (text, category, cycle) => {
  if (cycle === 0) return text
  return `${text} · ${categoryLabels[category] || category} remix ${cycle + 1}`
}

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1)

const ensureConcreteChoice = (choice) => {
  if (choice === 'A' || choice === 'B') return choice
  return 'A'
}

const pickLiker = (category, authorId) => {
  const candidates = zeepProfiles.filter((zeep) => zeep.likePreferences.includes(category) && zeep.id !== authorId)
  if (candidates.length === 0) {
    return zeepProfiles.find((zeep) => zeep.id !== authorId) || zeepProfiles[0]
  }
  return candidates[Math.floor(Math.random() * candidates.length)]
}

const shufflePosts = (posts) => {
  const cloned = [...posts]
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cloned[i], cloned[j]] = [cloned[j], cloned[i]]
  }
  return cloned
}

const buildNarrative = ({ category, zeep, partyPositions, trackers }) => {
  trackers.postCounter += 1

  if (category === 'neutral') {
    const { template, cycle } = pullTemplate('neutral', trackers)
    return {
      id: `post-${zeep.id}-${trackers.postCounter}`,
      author: zeep,
      type: 'neutral',
      label: categoryLabels.neutral,
      text: ensureUniqueText(
        fillTemplate(template, {
          zeep,
          partyLabel: ''
        }),
        'neutral',
        cycle
      ),
      likedBy: pickLiker('neutral', zeep.id)
    }
  }

  const isCoded = category.includes('coded')
  const questionPool = isCoded ? codedQuestions : politicalQuestions
  const questionIdxKey = isCoded ? 'codedQuestionIdx' : 'policyQuestionIdx'

  const question = questionPool[trackers[questionIdxKey] % questionPool.length]
  trackers[questionIdxKey] += 1

  const partyKey = category === 'glorp_coded' || category === 'pro_glorp' ? 'glorp' : 'splink'
  const choiceKey = ensureConcreteChoice(partyPositions[partyKey]?.[question.id])
  const option = question.options.find((item) => item.id === choiceKey) || question.options[0]
  const opposite = question.options.find((item) => item.id !== option.id) || question.options[0]
  const { template, cycle } = pullTemplate(category, trackers)

  return {
    id: `post-${zeep.id}-${category}-${trackers.postCounter}`,
    author: zeep,
    questionId: question.id,
    choiceId: option.id,
    type: category,
    label: categoryLabels[category],
    text: ensureUniqueText(
      fillTemplate(template, {
        zeep,
        partyLabel: capitalize(partyKey),
        question,
        option,
        opposite
      }),
      category,
      cycle
    ),
    likedBy: pickLiker(category, zeep.id)
  }
}

export const generateZeepPosts = (partyPositions) => {
  const trackers = {
    codedQuestionIdx: 0,
    policyQuestionIdx: 0,
    postCounter: 0,
    templateUsage: initTemplateUsage()
  }

  const posts = []

  zeepProfiles.forEach((zeep) => {
    const { postingPreferences } = zeep
    const perTraitCount = Math.floor(6 / postingPreferences.length)

    postingPreferences.forEach((category) => {
      for (let i = 0; i < perTraitCount; i += 1) {
        posts.push(
          buildNarrative({
            category,
            zeep,
            partyPositions,
            trackers
          })
        )
      }
    })
  })

  return shufflePosts(posts)
}

export const formatAffiliation = (value) => {
  if (!value) return '—'
  return value === 'neutral' ? 'Neutral' : `${capitalize(value)}`
}

export const getChoiceLabel = (questionId, choiceId) => {
  const question = questionLookup[questionId]
  if (!question) return ''
  if (choiceId === 'neutral') return 'Indifferent'
  const option = question.options.find((item) => item.id === choiceId)
  return option ? option.label : ''
}
