import { useMemo, useState } from 'react'
import './App.css'
import {
  allQuestions,
  codedQuestions,
  politicalQuestions,
  zeepProfiles,
  generateZeepPosts,
  getChoiceLabel,
  formatAffiliation
} from './data'

const PHASES = {
  QUIZ: 'quiz',
  REVEAL: 'reveal',
  FEED: 'feed',
  SORT: 'sorting',
  RESULTS: 'results'
}

const ratingScale = Array.from({ length: 5 }, (_, index) => index + 1)

function App() {
  const [phase, setPhase] = useState(PHASES.QUIZ)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [party, setParty] = useState(null)
  const [partyPositions, setPartyPositions] = useState(null)
  const [posts, setPosts] = useState([])
  const [currentPostIdx, setCurrentPostIdx] = useState(0)
  const [ratings, setRatings] = useState({})
  const [sorting, setSorting] = useState({})
  const [currentSortIdx, setCurrentSortIdx] = useState(0)
  const [randomizedZeeps, setRandomizedZeeps] = useState([])

  const currentQuestion = allQuestions[currentQuestionIdx]
  const currentChoice = answers[currentQuestion?.id]

  const handleSelectChoice = (questionId, choiceId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choiceId }))
  }

  const handleNextQuestion = () => {
    if (!currentChoice) return
    if (currentQuestionIdx === allQuestions.length - 1) {
      finalizeQuiz()
    } else {
      setCurrentQuestionIdx((prev) => prev + 1)
    }
  }

  const handlePrevQuestion = () => {
    setCurrentQuestionIdx((prev) => Math.max(prev - 1, 0))
  }

  const finalizeQuiz = () => {
    const total = allQuestions.reduce((acc, question) => {
      const choice = answers[question.id]
      if (choice === 'A') return acc + 1
      if (choice === 'B') return acc - 1
      return acc
    }, 0)

    const assignedParty = total >= 0 ? 'glorp' : 'splink'
    const otherParty = assignedParty === 'glorp' ? 'splink' : 'glorp'
    const positions = { glorp: {}, splink: {} }

    allQuestions.forEach((question) => {
      const choice = answers[question.id] || 'A'
      positions[assignedParty][question.id] = choice
      if (choice === 'A') {
        positions[otherParty][question.id] = 'B'
      } else {
        positions[otherParty][question.id] = 'A'
      }
    })

    setParty(assignedParty)
    setPartyPositions(positions)
    setPosts(generateZeepPosts(positions))
    setPhase(PHASES.REVEAL)
  }

  const handleEnterFeed = () => {
    setPhase(PHASES.FEED)
    setCurrentPostIdx(0)
  }

  const currentPost = posts[currentPostIdx]
  const feedProgress = `${currentPostIdx + 1}/${posts.length}`

  const ratePost = (score) => {
    if (!currentPost) return
    setRatings((prev) => ({ ...prev, [currentPost.id]: score }))
    if (currentPostIdx >= posts.length - 1) {
      // Randomize zeep order for sorting
      const shuffled = [...zeepProfiles].sort(() => Math.random() - 0.5)
      setRandomizedZeeps(shuffled)
      setPhase(PHASES.SORT)
      setCurrentSortIdx(0)
    } else {
      setCurrentPostIdx((prev) => prev + 1)
    }
  }

  const currentZeepToSort = randomizedZeeps[currentSortIdx]
  const sortingComplete = currentSortIdx >= randomizedZeeps.length

  const sortZeep = (affiliation) => {
    if (!currentZeepToSort) return
    setSorting((prev) => ({ ...prev, [currentZeepToSort.id]: affiliation }))
    if (currentSortIdx >= randomizedZeeps.length - 1) {
      setPhase(PHASES.RESULTS)
    } else {
      setCurrentSortIdx((prev) => prev + 1)
    }
  }

  const revealResults = () => {
    if (!sortingComplete) return
    setPhase(PHASES.RESULTS)
  }

  const resetExperience = () => {
    setPhase(PHASES.QUIZ)
    setCurrentQuestionIdx(0)
    setAnswers({})
    setParty(null)
    setPartyPositions(null)
    setPosts([])
    setCurrentPostIdx(0)
    setRatings({})
    setSorting({})
    setCurrentSortIdx(0)
    setRandomizedZeeps([])
  }

  const averages = useMemo(() => {
    if (!posts.length) return {}
    const acc = {}
    posts.forEach((post) => {
      const value = ratings[post.id]
      if (!value) return
      acc[post.author.id] = acc[post.author.id] || { total: 0, count: 0 }
      acc[post.author.id].total += value
      acc[post.author.id].count += 1
    })
    return acc
  }, [posts, ratings])

  const renderQuestionGroup = (title, questionList) => (
    <div className="position-block" key={title}>
      <h4>{title}</h4>
      <ul>
        {questionList.map((q) => (
          <li key={q.id}>
            <span>{q.prompt}</span>
            <strong>{getChoiceLabel(q.id, partyPositions?.glorp?.[q.id])}</strong>
          </li>
        ))}
      </ul>
    </div>
  )

  const renderQuestionGroupSplink = (title, questionList) => (
    <div className="position-block" key={title}>
      <h4>{title}</h4>
      <ul>
        {questionList.map((q) => (
          <li key={q.id}>
            <span>{q.prompt}</span>
            <strong>{getChoiceLabel(q.id, partyPositions?.splink?.[q.id])}</strong>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <main className="app-shell">
      <header>
        <h1>Zeep Polarization Lab</h1>
        <p>Explore how rumours, sorting, and affective polarization grow in a zeep-made feed.</p>
      </header>

      {phase === PHASES.QUIZ && (
        <section className="card">
          <div className="card-header">
            <p className="eyebrow">Question {currentQuestionIdx + 1} of {allQuestions.length}</p>
            <h2>{currentQuestion.prompt}</h2>
          </div>
          <div className="choices">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                className={`choice-button ${currentChoice === option.id ? 'active' : ''}`}
                onClick={() => handleSelectChoice(currentQuestion.id, option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="nav-row">
            <button className="ghost-button" onClick={handlePrevQuestion} disabled={currentQuestionIdx === 0}>
              Back
            </button>
            <button className="primary-button" onClick={handleNextQuestion} disabled={!currentChoice}>
              {currentQuestionIdx === allQuestions.length - 1 ? 'Lock in answers' : 'Next'}
            </button>
          </div>
        </section>
      )}

      {phase === PHASES.REVEAL && (
        <section className="card">
          <p className="eyebrow">Identity locked</p>
          <h2>You are a {party === 'glorp' ? 'Glorp' : 'Splink'}.</h2>
          <p>
            Below is the agenda for both factions.
          </p>
          <div className="positions-grid">
            <div>
              <h3>Glorp positions</h3>
              {renderQuestionGroup('Culture code', codedQuestions)}
              {renderQuestionGroup('Policy fights', politicalQuestions)}
            </div>
            <div>
              <h3>Splink positions</h3>
              {renderQuestionGroupSplink('Culture code', codedQuestions)}
              {renderQuestionGroupSplink('Policy fights', politicalQuestions)}
            </div>
          </div>
          <button className="primary-button wide" onClick={handleEnterFeed}>
            Enter the zeep feed
          </button>
        </section>
      )}

      {phase === PHASES.FEED && currentPost && (
        <section className="card">
          <div className="card-header">
            <p className="eyebrow">Post {feedProgress}</p>
            <h2>How do you feel about this?</h2>
          </div>
          <article className="post-card">
            <div className="post-top">
              <div className="avatar" style={{ backgroundColor: currentPost.author.color }}>
                {currentPost.author.name.charAt(0)}
              </div>
              <div>
                <p className="handle">@{currentPost.author.name.toLowerCase()}</p>
              </div>
            </div>
            <p className="post-text">{currentPost.text}</p>
            <div className="liked-by">
              Liked by <strong>{currentPost.likedBy.name}</strong>
            </div>
          </article>
          <div className="rating-panel">
            <p>1 = dislike, 5 = like</p>
            <div className="rating-grid">
              {ratingScale.map((value) => (
                <button key={value} onClick={() => ratePost(value)}>
                  {value}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {phase === PHASES.SORT && currentZeepToSort && (
        <section className="card">
          <div className="card-header">
            <p className="eyebrow">Zeep {currentSortIdx + 1} of {randomizedZeeps.length}</p>
            <h2>How would you classify {currentZeepToSort.name}?</h2>
            <p>Based on their posts, do you think they're Glorp, Splink, or neutral?</p>
          </div>
          <div className="sorting-card" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div className="avatar" style={{ backgroundColor: currentZeepToSort.color, margin: '0 auto 1rem' }}>
              {currentZeepToSort.name.charAt(0)}
            </div>
            <h3>{currentZeepToSort.name}</h3>
          </div>
          <div className="pill-row" style={{ maxWidth: '400px', margin: '0 auto' }}>
            {['glorp', 'neutral', 'splink'].map((option) => (
              <button
                key={option}
                className="pill"
                onClick={() => sortZeep(option)}
              >
                {formatAffiliation(option)}
              </button>
            ))}
          </div>
        </section>
      )}

      {phase === PHASES.RESULTS && (
        <section className="card">
          <div className="card-header">
            <p className="eyebrow">Report</p>
            <h2>How well did you sort the feed?</h2>
            <p>Your ratings shape the averages below, paired with the real zeep affiliations.</p>
          </div>
          <div className="results-table">
            <div className="results-row header">
              <span>Zeep</span>
              <span>Your guess</span>
              <span>Actual</span>
              <span>Avg rating</span>
            </div>
            {zeepProfiles.map((zeep) => {
              const avg = averages[zeep.id]
                ? (averages[zeep.id].total / averages[zeep.id].count).toFixed(1)
                : '—'
              return (
                <div key={zeep.id} className="results-row">
                  <div className="zeep-id">
                    <div className="avatar small" style={{ backgroundColor: zeep.color }}>
                      {zeep.name.charAt(0)}
                    </div>
                    <span>{zeep.name}</span>
                  </div>
                  <span className="tag subtle">{formatAffiliation(sorting[zeep.id])}</span>
                  <span className={`tag ${sorting[zeep.id] === zeep.actualAffiliation ? 'match' : 'mismatch'}`}>
                    {formatAffiliation(zeep.actualAffiliation)}
                  </span>
                  <span>{avg}</span>
                </div>
              )
            })}
          </div>
          <button className="ghost-button wide" onClick={resetExperience}>
            Start again
          </button>
        </section>
      )}
    </main>
  )
}

export default App
