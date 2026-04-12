const { generateQuizWithAI } = require('../services/quiz.service');
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const User = require('../models/User');

const generateQuiz = async (req, res) => {
  try {
    const { topic, skillLevel = 'Beginner', numQuestions = 5 } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    // Call service to get the JSON from Gemini
    const aiQuiz = await generateQuizWithAI(topic, skillLevel, numQuestions);

    // Save to DB
    const newQuiz = new Quiz({
      quiz_title: aiQuiz.quiz_title,
      topic,
      skillLevel,
      total_questions: aiQuiz.total_questions,
      questions: aiQuiz.questions
    });

    await newQuiz.save();

    // Transform for the frontend QuizSession.jsx format
    const transformedQuestions = newQuiz.questions.map(q => ({
      question: q.question,
      options: [q.options.A, q.options.B, q.options.C, q.options.D],
      // We don't send the correct_answer to the frontend here for security
    }));

    res.status(200).json({
      quizId: newQuiz._id,
      topic: newQuiz.topic,
      skillLevel: newQuiz.skillLevel,
      questions: transformedQuestions,
      total_questions: newQuiz.total_questions
    });

  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ error: 'Failed to generate quiz from AI. Please try again.' });
  }
};

const Progress = require('../models/Progress'); // Added progress model

const evaluateQuiz = async (req, res) => {
  try {
    const { userEmail, uid, quizId, answers } = req.body;

    if (!quizId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Quiz ID and answers array are required' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    let score = 0;
    const evaluation = [];

    quiz.questions.forEach((q, index) => {
      const userAnswerString = answers[index];
      let userAnswerLetter = null;

      if (userAnswerString === q.options.A) userAnswerLetter = 'A';
      else if (userAnswerString === q.options.B) userAnswerLetter = 'B';
      else if (userAnswerString === q.options.C) userAnswerLetter = 'C';
      else if (userAnswerString === q.options.D) userAnswerLetter = 'D';

      const isCorrect = userAnswerLetter === q.correct_answer;
      if (isCorrect) score += 1;

      const correctAnswerString = q.options[q.correct_answer];

      evaluation.push({
        question_id: q.id || (index + 1),
        question: q.question,
        userAnswer: userAnswerString,
        correctAnswer: correctAnswerString,
        isCorrect,
        explanation: q.explanation
      });
    });

    const totalQuestions = quiz.total_questions || quiz.questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    const pointsEarned = score * 10;

    // Save Result
    const newResult = new QuizResult({
      userEmail,
      quizId,
      score,
      total: totalQuestions,
      percentage,
      pointsEarned,
      evaluation
    });
    
    await newResult.save();

    // Update User Progress [SKILL STRENGTH RADAR]
    if (uid) {
      const userProgress = await Progress.findOne({ uid });
      if (userProgress) {
        // Normalize topic e.g. "React Hooks" -> "react"
        const skillKey = quiz.topic.toLowerCase().split(' ')[0].replace(/[^a-z]/g, '');
        
        // Calculate boost: max 20 points per quiz session
        const boost = Math.round((score / totalQuestions) * 15); 
        
        const currentVal = userProgress.skillStrength.get(skillKey) || 0;
        userProgress.skillStrength.set(skillKey, Math.min(100, currentVal + boost));
        
        await userProgress.save();
      }
    }

    // Update User Points 
    if (userEmail && userEmail !== 'anonymous') {
      await User.findOneAndUpdate(
        { email: userEmail },
        { $inc: { points: pointsEarned } },
        { new: true }
      );
    }

    res.status(200).json({
      score,
      totalQuestions,
      percentage,
      pointsEarned,
      evaluation
    });

  } catch (error) {
    console.error('Error evaluating quiz:', error);
    res.status(500).json({ error: 'Failed to evaluate quiz submissions.' });
  }
};

module.exports = {
  generateQuiz,
  evaluateQuiz
};
