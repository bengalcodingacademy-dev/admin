import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

const QuizExam = () => {
  const [quizExams, setQuizExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [showQuestions, setShowQuestions] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Form states
  const [quizForm, setQuizForm] = useState({
    courseId: '',
    monthNumber: 1,
    lessonId: '',
    title: '',
    totalMarks: 0,
    durationMinutes: 30,
    isActive: true
  });

  const [questionForm, setQuestionForm] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 1,
    difficulty: 'MEDIUM'
  });

  useEffect(() => {
    loadQuizExams();
    loadCourses();
  }, []);

  const loadQuizExams = async () => {
    try {
      const response = await api.get('/admin/quiz-exams');
      setQuizExams(response.data);
    } catch (error) {
      console.error('Error loading quiz exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await api.get('/admin/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadQuestions = async (quizId) => {
    try {
      const response = await api.get(`/admin/quiz-exams/${quizId}`);
      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean up the form data - remove empty lessonId
      const formData = {
        ...quizForm,
        lessonId: quizForm.lessonId && quizForm.lessonId.trim() !== '' ? quizForm.lessonId : undefined
      };
      
      if (editingQuiz) {
        await api.put(`/admin/quiz-exams/${editingQuiz.id}`, formData);
      } else {
        await api.post('/admin/quiz-exams', formData);
      }
      
      setShowForm(false);
      setEditingQuiz(null);
      setQuizForm({
        courseId: '',
        monthNumber: 1,
        lessonId: '',
        title: '',
        totalMarks: 0,
        durationMinutes: 30,
        isActive: true
      });
      loadQuizExams();
    } catch (error) {
      console.error('Error saving quiz exam:', error);
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      const questionData = {
        ...questionForm,
        quizId: showQuestions,
        options: questionForm.options.filter(opt => opt.trim() !== '')
      };

      if (editingQuestion) {
        await api.put(`/admin/quiz-exams/questions/${editingQuestion.id}`, questionData);
      } else {
        await api.post(`/admin/quiz-exams/${showQuestions}/questions`, questionData);
      }
      
      setShowQuestionForm(false);
      setEditingQuestion(null);
      setQuestionForm({
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        marks: 1,
        difficulty: 'MEDIUM'
      });
      loadQuestions(showQuestions);
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setQuizForm({
      courseId: quiz.courseId,
      monthNumber: quiz.monthNumber,
      lessonId: quiz.lessonId || '',
      title: quiz.title,
      totalMarks: quiz.totalMarks,
      durationMinutes: quiz.durationMinutes,
      isActive: quiz.isActive
    });
    setShowForm(true);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionForm({
      questionText: question.questionText,
      options: question.options,
      correctAnswer: question.correctAnswer,
      marks: question.marks,
      difficulty: question.difficulty
    });
    setShowQuestionForm(true);
  };

  const handleDeleteQuiz = async (id) => {
    if (window.confirm('Are you sure you want to delete this quiz exam?')) {
      try {
        await api.delete(`/admin/quiz-exams/${id}`);
        loadQuizExams();
      } catch (error) {
        console.error('Error deleting quiz exam:', error);
      }
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await api.delete(`/admin/quiz-exams/questions/${id}`);
        loadQuestions(showQuestions);
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
  };

  const toggleQuizActive = async (quiz) => {
    try {
      await api.put(`/admin/quiz-exams/${quiz.id}`, {
        ...quiz,
        isActive: !quiz.isActive
      });
      loadQuizExams();
    } catch (error) {
      console.error('Error updating quiz status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bca-black flex items-center justify-center">
        <div className="text-bca-cyan text-xl">Loading Quiz Exams...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bca-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Quiz Exam Management</h1>
            <p className="text-bca-gray-400">Manage quiz exams and questions for your courses</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-bca-gold text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
          >
            Create Quiz Exam
          </button>
        </div>

        {/* Quiz Exams List */}
        <div className="grid gap-6">
          {quizExams.map((quiz) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-bca-gray-800 rounded-xl p-6 border border-bca-gray-700"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{quiz.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-bca-gray-400">
                    <span>Course: {quiz.course?.title}</span>
                    <span>Month: {quiz.monthNumber}</span>
                    <span>Duration: {quiz.durationMinutes} min</span>
                    <span>Total Marks: {quiz.totalMarks}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      quiz.isActive 
                        ? 'bg-green-900 text-green-300' 
                        : 'bg-red-900 text-red-300'
                    }`}>
                      {quiz.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleQuizActive(quiz)}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      quiz.isActive
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {quiz.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => {
                      setShowQuestions(quiz.id);
                      loadQuestions(quiz.id);
                    }}
                    className="bg-bca-cyan text-black px-3 py-1 rounded text-xs font-medium hover:bg-cyan-400"
                  >
                    Manage Questions
                  </button>
                  <button
                    onClick={() => handleEditQuiz(quiz)}
                    className="bg-bca-gold text-black px-3 py-1 rounded text-xs font-medium hover:bg-yellow-400"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Quiz Stats */}
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="bg-bca-gray-700 p-3 rounded-lg">
                  <div className="text-bca-gray-400">Questions</div>
                  <div className="text-white font-semibold">{quiz.questions?.length || 0}</div>
                </div>
                <div className="bg-bca-gray-700 p-3 rounded-lg">
                  <div className="text-bca-gray-400">Attempts</div>
                  <div className="text-white font-semibold">{quiz.attempts?.length || 0}</div>
                </div>
                <div className="bg-bca-gray-700 p-3 rounded-lg">
                  <div className="text-bca-gray-400">Avg Score</div>
                  <div className="text-white font-semibold">
                    {quiz.analytics?.averageScore?.toFixed(1) || 'N/A'}%
                  </div>
                </div>
                <div className="bg-bca-gray-700 p-3 rounded-lg">
                  <div className="text-bca-gray-400">Highest Score</div>
                  <div className="text-white font-semibold">
                    {quiz.analytics?.highestScore?.toFixed(1) || 'N/A'}%
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quiz Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-bca-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingQuiz ? 'Edit Quiz Exam' : 'Create Quiz Exam'}
              </h2>
              
              <form onSubmit={handleQuizSubmit} className="space-y-4">
                <div>
                  <label className="block text-bca-gray-300 text-sm font-medium mb-2">
                    Course
                  </label>
                  <select
                    value={quizForm.courseId}
                    onChange={(e) => setQuizForm({ ...quizForm, courseId: e.target.value })}
                    className="w-full px-3 py-2 bg-bca-gray-700 border border-bca-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-bca-gold"
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-bca-gray-300 text-sm font-medium mb-2">
                      Month Number
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={quizForm.monthNumber}
                      onChange={(e) => setQuizForm({ ...quizForm, monthNumber: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-bca-gray-700 border border-bca-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-bca-gold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-bca-gray-300 text-sm font-medium mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={quizForm.durationMinutes}
                      onChange={(e) => setQuizForm({ ...quizForm, durationMinutes: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-bca-gray-700 border border-bca-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-bca-gold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-bca-gray-300 text-sm font-medium mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-bca-gray-700 border border-bca-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-bca-gold"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={quizForm.isActive}
                    onChange={(e) => setQuizForm({ ...quizForm, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="isActive" className="text-bca-gray-300">
                    Active
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="bg-bca-gold text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
                  >
                    {editingQuiz ? 'Update' : 'Create'} Quiz Exam
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingQuiz(null);
                    }}
                    className="bg-bca-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-bca-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Questions Management Modal */}
        {showQuestions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-bca-gray-800 rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Manage Questions</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowQuestionForm(true)}
                    className="bg-bca-gold text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
                  >
                    Add Question
                  </button>
                  <button
                    onClick={() => setShowQuestions(null)}
                    className="bg-bca-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-bca-gray-500 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="bg-bca-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-2">
                          Q{index + 1}: {question.questionText}
                        </h4>
                        <div className="text-sm text-bca-gray-400 mb-2">
                          Difficulty: {question.difficulty} | Marks: {question.marks}
                        </div>
                        <div className="space-y-1">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="text-sm text-bca-gray-300">
                              {String.fromCharCode(65 + optIndex)}. {option}
                            </div>
                          ))}
                        </div>
                        <div className="text-sm text-bca-gold mt-2">
                          Correct Answer: {question.correctAnswer}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditQuestion(question)}
                          className="bg-bca-cyan text-black px-3 py-1 rounded text-xs font-medium hover:bg-cyan-400"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Question Form Modal */}
        {showQuestionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-bca-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingQuestion ? 'Edit Question' : 'Add Question'}
              </h2>
              
              <form onSubmit={handleQuestionSubmit} className="space-y-4">
                <div>
                  <label className="block text-bca-gray-300 text-sm font-medium mb-2">
                    Question Text
                  </label>
                  <textarea
                    value={questionForm.questionText}
                    onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                    className="w-full px-3 py-2 bg-bca-gray-700 border border-bca-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-bca-gold"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-bca-gray-300 text-sm font-medium mb-2">
                    Options
                  </label>
                  {questionForm.options.map((option, index) => (
                    <input
                      key={index}
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...questionForm.options];
                        newOptions[index] = e.target.value;
                        setQuestionForm({ ...questionForm, options: newOptions });
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      className="w-full px-3 py-2 bg-bca-gray-700 border border-bca-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-bca-gold mb-2"
                    />
                  ))}
                </div>

                <div>
                  <label className="block text-bca-gray-300 text-sm font-medium mb-2">
                    Correct Answer
                  </label>
                  <input
                    type="text"
                    value={questionForm.correctAnswer}
                    onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                    placeholder="Enter the correct answer"
                    className="w-full px-3 py-2 bg-bca-gray-700 border border-bca-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-bca-gold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-bca-gray-300 text-sm font-medium mb-2">
                      Marks
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={questionForm.marks}
                      onChange={(e) => setQuestionForm({ ...questionForm, marks: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-bca-gray-700 border border-bca-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-bca-gold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-bca-gray-300 text-sm font-medium mb-2">
                      Difficulty
                    </label>
                    <select
                      value={questionForm.difficulty}
                      onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                      className="w-full px-3 py-2 bg-bca-gray-700 border border-bca-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-bca-gold"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="bg-bca-gold text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
                  >
                    {editingQuestion ? 'Update' : 'Add'} Question
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuestionForm(false);
                      setEditingQuestion(null);
                    }}
                    className="bg-bca-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-bca-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizExam;
