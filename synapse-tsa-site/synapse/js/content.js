/* ==========================================================================
   content.js — quiz questions and activity data for the three modules.
   Edit the text here to change questions without touching any logic.
   "answer" is the index (starting at 0) of the correct option.
   ========================================================================== */
window.SYNAPSE_CONTENT = {
  quizzes: {
    fundamentals: [
      {
        q: 'How is machine learning related to artificial intelligence?',
        options: ['They are two unrelated technologies', 'Machine learning is a branch of AI where systems learn patterns from data', 'AI is a branch of machine learning', 'Machine learning only refers to robots'],
        answer: 1,
        why: 'AI is the big field. Machine learning is one way to build AI: instead of writing every rule, we let the computer find patterns in examples.'
      },
      {
        q: 'A spam filter is trained on thousands of emails already labeled "spam" or "not spam." What kind of learning is this?',
        options: ['Supervised learning', 'Unsupervised learning', 'Reinforcement learning', 'No learning is involved'],
        answer: 0,
        why: 'Labeled examples (input + correct answer) are the signature of supervised learning.'
      },
      {
        q: 'How does a large language model (LLM) produce a response?',
        options: ['It looks up the answer in a database of verified facts', 'It copies a matching web page', 'It repeatedly predicts a likely next piece of text based on patterns learned in training', 'A human writes each answer in real time'],
        answer: 2,
        why: 'LLMs generate text one token at a time by predicting what is likely to come next. That is powerful, but it is not the same as checking facts.'
      },
      {
        q: 'What does it mean when an AI "hallucinates"?',
        options: ['It shows images on the screen', 'It confidently produces information that is false or made up', 'It refuses to answer', 'It runs out of memory'],
        answer: 1,
        why: 'Because LLMs predict plausible text, they can produce fluent answers, quotes, or citations that are simply wrong.'
      },
      {
        q: 'Why can an AI system be biased?',
        options: ['Computers have personal opinions', 'Its training data can reflect gaps and unfair patterns from the real world', 'Bias only happens when the code has a typo', 'AI systems cannot be biased'],
        answer: 1,
        why: 'A model learns from its data. If some groups are under-represented or past decisions were unfair, the model can repeat those patterns.'
      }
    ],
    tools: [
      {
        q: 'Which prompt is most likely to get a useful study response?',
        options: ['"history"', '"Tell me about the Civil War."', '"Act as a history tutor. I\'m a 10th grader reviewing causes of the Civil War for a test. Explain the three biggest causes in a short bulleted list, then ask me one question to check my understanding."', '"Write my history essay."'],
        answer: 2,
        why: 'It includes a role, a clear task, context about you, and a format. Specific prompts get specific, useful answers.'
      },
      {
        q: 'An AI chatbot gives you a citation for a journal article. What should you do next?',
        options: ['Paste it into your bibliography right away', 'Search for the article yourself to confirm it exists and says what the AI claims', 'Ask the same chatbot if it is sure', 'Assume it is fine because it looks professional'],
        answer: 1,
        why: 'AI tools sometimes invent realistic-looking sources. Only the original source can confirm a citation.'
      },
      {
        q: 'What is the best way to use AI as a study partner the night before a test?',
        options: ['Have it write a cheat sheet to bring into the test', 'Ask it to quiz you on the material and explain the questions you miss', 'Ask it to predict the exact test questions', 'Skip studying because AI can answer anything'],
        answer: 1,
        why: 'Practice questions plus explanations make your brain do the work. That is active recall, one of the most effective study methods.'
      },
      {
        q: 'Before using an AI tool for a school assignment, what should you check?',
        options: ['Only whether the tool is free', 'Your teacher\'s or school\'s AI policy, and the tool\'s age requirements and terms', 'Whether your friends use it', 'Nothing. Any tool is allowed'],
        answer: 1,
        why: 'Policies differ by class and assignment, and many AI tools have age limits or require parent permission for users under 18.'
      },
      {
        q: 'In prompting, what does "iteration" mean?',
        options: ['Giving up after the first answer', 'Refining your request with follow-up prompts based on what the AI gave you', 'Asking the same question in a new chat', 'Making the prompt as short as possible'],
        answer: 1,
        why: 'Great results usually come from a conversation: review the output, then ask for changes, more detail, or a different format.'
      }
    ],
    ethics: [
      {
        q: 'Your teacher says no AI is allowed on an essay. What should you do?',
        options: ['Use AI but rewrite the words so it cannot be detected', 'Follow the rule, and ask the teacher if you are unsure whether a tool (like spell-check) counts', 'Use AI only for the conclusion', 'Have a friend use AI for you'],
        answer: 1,
        why: 'Your teacher\'s policy for that assignment is the rule. When in doubt, ask first. That is what academic integrity looks like.'
      },
      {
        q: 'Which of these should you NOT type into a public AI chatbot?',
        options: ['A question about how volcanoes form', 'Your home address, passwords, or a classmate\'s personal information', 'A request to explain a math concept', 'A practice quiz request'],
        answer: 1,
        why: 'Anything you enter may be stored or used to improve the service. Keep private information about you and others out.'
      },
      {
        q: 'What does it mean to disclose AI use on an assignment?',
        options: ['Hiding that you used AI', 'Clearly stating which AI tool you used and how you used it', 'Deleting your chat history', 'Only telling your friends'],
        answer: 1,
        why: 'Disclosure (and citation, when required) lets your teacher see what is your thinking and what came from a tool.'
      },
      {
        q: 'What is a deepfake?',
        options: ['A very detailed photo', 'AI-generated or AI-altered media that realistically shows someone saying or doing something they did not', 'A type of computer virus', 'A fake social media account with no posts'],
        answer: 1,
        why: 'Deepfakes can damage reputations and spread misinformation. Making one of a real person without consent can be harmful and in some places illegal.'
      },
      {
        q: 'What does "human in the loop" mean?',
        options: ['A person reviews AI output and stays responsible for the final decision', 'A human is trapped inside the computer', 'The AI makes every decision on its own', 'Only programmers can use AI'],
        answer: 0,
        why: 'AI can assist, but people should check its work and remain accountable, especially for decisions that affect others.'
      }
    ]
  },

  // Fundamentals activity: match each scenario to a type of machine learning.
  sorter: {
    options: [{ label: 'Supervised' }, { label: 'Unsupervised' }, { label: 'Reinforcement' }],
    items: [
      { text: 'An app learns to recognize dog breeds from 50,000 photos that are each labeled with the breed.', answer: 0, hint: 'Are the examples labeled with the correct answer?', why: 'Labeled photos mean the model is learning from examples with answers: supervised.' },
      { text: 'A store groups customers by shopping habits without being told what the groups should be.', answer: 1, hint: 'Nobody told the system what the right groups are.', why: 'Finding hidden groups in unlabeled data is unsupervised learning (clustering).' },
      { text: 'A robot learns to walk by trying moves and getting a reward each time it stays upright longer.', answer: 2, hint: 'Think trial, error, and rewards.', why: 'Learning from rewards and penalties over many attempts is reinforcement learning.' },
      { text: 'A model predicts house prices after studying past sales with their final selling prices.', answer: 0, hint: 'Each past sale comes with the "right answer" attached.', why: 'Past sales with known prices are labeled examples, so this is supervised learning.' },
      { text: 'A game-playing AI improves by playing millions of matches against itself and keeping strategies that win.', answer: 2, hint: 'Winning acts like a reward signal.', why: 'Wins and losses act as rewards, which is reinforcement learning.' },
      { text: 'A tool scans thousands of unlabeled news articles and discovers common topics on its own.', answer: 1, hint: 'The articles have no labels.', why: 'Discovering structure (topics) in unlabeled text is unsupervised learning.' }
    ]
  },

  // Ethics activity: rate how most school AI policies would view each situation.
  judge: {
    options: [{ label: 'Green: OK', tone: 'green' }, { label: 'Yellow: Ask first', tone: 'yellow' }, { label: 'Red: Not OK', tone: 'red' }],
    items: [
      { text: 'After reading the textbook, you ask an AI to explain photosynthesis a different way because the chapter was confusing.', answer: 0, hint: 'Is the AI doing your thinking, or helping you understand?', why: 'Using AI as a tutor to understand material you are already studying is usually encouraged.' },
      { text: 'You paste your essay prompt into a chatbot and turn in what it writes as your own work.', answer: 2, hint: 'Whose work is it really?', why: 'Submitting AI-written work as your own is plagiarism under nearly every academic integrity policy.' },
      { text: 'You want to use an AI grammar checker on a graded English essay, but the assignment sheet doesn\'t mention AI.', answer: 1, hint: 'When the rules are unclear, what is the safest move?', why: 'Policies differ: some teachers allow grammar tools, others count them as AI help. Ask before you use it.' },
      { text: 'You upload a classmate\'s photo to an AI app to make a funny edited version to post online.', answer: 2, hint: 'Did your classmate agree?', why: 'Altering and sharing someone\'s image without consent can be hurtful, a privacy violation, and a form of harassment.' },
      { text: 'You ask an AI to quiz you with practice questions before your biology test.', answer: 0, hint: 'Who is doing the learning here?', why: 'Self-quizzing with AI builds your own knowledge, which is a great, honest use.' },
      { text: 'You use AI to brainstorm project topics for a class that allows AI for brainstorming, and you note it in your process log.', answer: 0, hint: 'Is it allowed, and is it disclosed?', why: 'Allowed + disclosed + your own final work = responsible use.' },
      { text: 'You use AI to answer the questions on a take-home test.', answer: 2, hint: 'What is a test supposed to measure?', why: 'Tests measure what you know. Using AI on them, unless the teacher explicitly allows it, is cheating.' }
    ]
  },

  // Fundamentals lesson 3 demo: a toy next-word predictor (made-up example numbers).
  nextWord: {
    prompt: 'The students opened their',
    words: [
      { w: 'books', p: 0.36 }, { w: 'laptops', p: 0.24 }, { w: 'notebooks', p: 0.16 },
      { w: 'eyes', p: 0.10 }, { w: 'lockers', p: 0.07 }, { w: 'minds', p: 0.05 }, { w: 'umbrellas', p: 0.02 }
    ]
  }
};
