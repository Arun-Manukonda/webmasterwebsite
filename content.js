/* ==========================================================================
   content.js — checkpoint quizzes and challenge data for each trail.
   "answer" is the index (starting at 0) of the correct option.
   ========================================================================== */
window.WAYFINDER_CONTENT = {
  quizzes: {
    think: [
      { q: 'Which of these is the best everyday example of AI?',
        options: ['A calculator adding two numbers', 'A light switch', 'A photo app that recognizes faces and groups them', 'A printed bus schedule'],
        answer: 2, why: 'Recognizing faces requires learning patterns from data. A calculator follows fixed rules written by a programmer.' },
      { q: 'In machine learning, what does the computer receive during training?',
        options: ['Only a list of rules', 'Lots of examples, often with the correct answers', 'A finished program', 'Nothing. It learns on its own from the internet'],
        answer: 1, why: 'Machine learning flips programming around: give it examples plus answers, and it works out the patterns (the "rules") itself.' },
      { q: 'What happens to a neural network\'s weights during training?',
        options: ['They are deleted', 'They are adjusted little by little to reduce errors', 'They are set once and never change', 'They are typed in by hand'],
        answer: 1, why: 'Training repeatedly nudges the weights so the network\'s guesses get closer to the right answers.' },
      { q: 'A language model breaks text into small pieces before predicting. What are those pieces called?',
        options: ['Pixels', 'Tokens', 'Cookies', 'Neurons'],
        answer: 1, why: 'Tokens are words or parts of words. The model predicts one token at a time.' },
      { q: 'In the "Teach the Machine" challenge, why did more examples usually help?',
        options: ['More examples make the computer faster', 'More examples give a clearer picture of each group, so predictions improve', 'More examples always make the model 100% accurate', 'They don\'t help at all'],
        answer: 1, why: 'More (and more varied) examples help a model draw better boundaries, though it still is never perfect.' }
    ],
    use: [
      { q: 'In the GOAL prompting method, what does the "O" stand for?',
        options: ['Output', 'Own context', 'Opinion', 'Organize'],
        answer: 1, why: 'G = Goal, O = Own context, A = Ask for a format, L = Limits. Your own context (grade, class, what you already know) makes answers fit you.' },
      { q: 'You need to understand a hard reading. Which use of AI best supports learning?',
        options: ['Ask AI to write your reading response', 'Read it first, then ask AI to explain the confusing parts and quiz you', 'Skip the reading and ask for a summary only', 'Copy a summary into your notes without reading'],
        answer: 1, why: 'You do the reading and thinking; AI fills gaps and checks understanding.' },
      { q: 'What is "lateral reading"?',
        options: ['Reading a page sideways', 'Leaving the page to check what other trusted sources say about a claim', 'Reading only the first line of each paragraph', 'Reading faster'],
        answer: 1, why: 'Fact-checkers open new tabs to see what independent, reliable sources say instead of trusting a single page or chatbot.' },
      { q: 'An AI answer includes a very specific statistic with a source you can\'t find anywhere. What\'s most likely?',
        options: ['The source is secret', 'The AI may have invented (hallucinated) it', 'It must be true because it\'s specific', 'The internet is broken'],
        answer: 1, why: 'Specific-sounding details are not proof. If a source can\'t be found, treat the claim as unverified.' },
      { q: 'Which tool is best suited for turning a recorded lecture into text?',
        options: ['An image generator', 'A speech-to-text (transcription) tool', 'A spreadsheet', 'A music app'],
        answer: 1, why: 'Speech-to-text tools are accessibility tools that turn spoken words into written text.' }
    ],
    right: [
      { q: 'In a 2024 Pew Research Center survey, which school use of ChatGPT did the most teens say was acceptable?',
        options: ['Writing essays', 'Solving math problems', 'Researching new topics', 'Taking tests'],
        answer: 2, why: '54% of teens said researching new topics was acceptable, compared with 29% for math problems and 18% for writing essays.' },
      { q: 'Why might an AI system work better for some groups of people than others?',
        options: ['Because AI chooses favorites', 'Because some groups were under-represented in its training data', 'Because of bad internet', 'This never happens'],
        answer: 1, why: 'When training data has fewer examples of some groups, the model usually learns less about them and makes more errors.' },
      { q: 'Which is the safest thing to type into a public chatbot?',
        options: ['Your school login and password', 'A friend\'s phone number', 'A general question about the water cycle', 'Your home address'],
        answer: 2, why: 'General questions are fine. Logins, addresses, and other people\'s information should stay private.' },
      { q: 'About how much of the world\'s electricity did data centers use in 2024, according to the International Energy Agency?',
        options: ['About 1.5%', 'About 25%', 'About 50%', 'Less than 0.01%'],
        answer: 0, why: 'The IEA estimates data centers used about 415 TWh, roughly 1.5% of global electricity, and expects that to grow quickly.' },
      { q: 'Your teacher allows AI for brainstorming. What should you do with your final project?',
        options: ['Nothing special', 'Include a short statement explaining how you used AI', 'Hide that you used AI', 'Let AI write the final version too'],
        answer: 1, why: 'Being transparent about AI use, even when it\'s allowed, is part of academic integrity.' }
    ]
  },

  // Trail 3 challenge: decide what is safe to share with a public AI tool.
  privacy: {
    options: [{ label: 'Safe to share', tone: 'green' }, { label: 'Keep it out', tone: 'red' }],
    items: [
      { text: 'A practice algebra problem from your textbook.', answer: 0, hint: 'Does it reveal anything about a real person?', why: 'Textbook problems contain no personal information.' },
      { text: 'Your home address, so the AI can plan a walking route to school.', answer: 1, hint: 'Would you post this publicly?', why: 'Your address is personal information. Use a map app with location settings you control instead.' },
      { text: 'A screenshot of your group chat, so AI can summarize what your friends said.', answer: 1, hint: 'Did your friends agree to share their messages?', why: 'Your friends\' messages are their private information, and they didn\'t consent.' },
      { text: 'A paragraph from your own essay draft (no names) to get feedback, when your teacher allows it.', answer: 0, hint: 'Is it yours, and is it allowed?', why: 'Your own work, with no personal details, shared with permission, is a reasonable use.' },
      { text: 'Your school portal password so an AI agent can check your grades.', answer: 1, hint: 'Who should know your passwords?', why: 'Never share passwords with any app or chatbot. It puts your accounts at risk.' },
      { text: 'A classmate\'s photo, so you can turn it into a meme.', answer: 1, hint: 'Think about consent.', why: 'Using someone\'s image without permission can be hurtful and is a form of harassment.' },
      { text: 'Your own handwritten class notes about the Civil War, to turn into flashcards.', answer: 0, hint: 'Is there anything private in them?', why: 'Your own study notes are safe to use for study tools.' }
    ]
  },

  // Trail 2 challenge: an AI answer with some invented claims.
  // fake: true marks the claims a student should flag.
  hunt: {
    question: 'Tell me about the invention of the telephone.',
    claims: [
      { text: 'Alexander Graham Bell was born in Edinburgh, Scotland, in 1847.', fake: false },
      { text: 'He received a U.S. patent for the telephone in 1876.', fake: false },
      { text: 'Bell came up with the idea while working as a lighthouse keeper in Maine.', fake: true,
        note: 'False. Bell worked in Boston as a teacher of deaf students and a professor of vocal physiology.' },
      { text: 'His first successful call was to his assistant, Thomas Watson.', fake: false },
      { text: 'According to a 2019 study by Smith and Lee in the Journal of Telephone History, that first call lasted 47 minutes.', fake: true,
        note: 'Invented. This study and journal can\'t be found. It\'s a classic hallucinated citation with a suspiciously precise number.' },
      { text: 'By 1880, more than half of American homes had a telephone.', fake: true,
        note: 'False. Telephones spread slowly; most American homes did not have one until well into the 1900s.' },
      { text: 'Bell later served as president of the National Geographic Society.', fake: false }
    ]
  }
};
