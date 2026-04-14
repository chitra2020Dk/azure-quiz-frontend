import React, { useEffect, useState } from "react";

const API_URL = "https://quizgo-app-apajc5dgeje5ageh.westeurope-01.azurewebsites.net";

const QuizApp = () => {
  const [questionData, setQuestionData] = useState(null);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [quizEnd, setQuizEnd] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  // NEW FEATURES
  const [quizStarted, setQuizStarted] = useState(false);
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [time, setTime] = useState(10);

  // ✅ ADDED: results history
  const [results, setResults] = useState([]);

  const fetchQuestion = () => {
    fetch(`${API_URL}/question`)
      .then((res) => res.json())
      .then((data) => {
        setQuestionData(data);
        setSelectedOption(null);
        setTime(10);
      });
  };

  useEffect(() => {
    if (quizStarted) {
      fetchQuestion();
    }
  }, [quizStarted]);

  // ⏱ TIMER
  useEffect(() => {
    if (!quizStarted || quizEnd || !questionData) return;

    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev === 1) {
          handleAnswer("");
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [questionData]);

  const handleAnswer = (option) => {
    if (selectedOption) return;

    setSelectedOption(option);

    fetch(`${API_URL}/answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ answer: option }),
    })
      .then((res) => res.json())
      .then((data) => {
        setResult(data);

        if (data.correct) {
          setScore((prev) => prev + 1);
        }

        if (data.nextQuestionAvailable) {
          setTimeout(() => {
            setResult(null);
            fetchQuestion();
          }, 1200);
        } else {
          // ✅ ADDED: store result before ending quiz
          setTimeout(() => {
            setResults((prev) => [
              ...prev,
              { name: name, score: score }
            ]);
            setQuizEnd(true);
          }, 1200);
        }
      });
  };

  // 🔄 RESTART
  const restartQuiz = () => {
    setScore(0);
    setQuizEnd(false);
    setQuizStarted(false);
    setName("");
    setPin("");
  };

  // 🎯 LOGIN SCREEN
  if (!quizStarted) {
    return (
      <div style={styles.container}>
        <h1>🎯 Enter Quiz</h1>

        <input
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Enter PIN (1234)"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          style={styles.input}
        />

        <button
          onClick={() => {
            if (pin === "1234" && name) {
              setQuizStarted(true);
            } else {
              alert("Enter valid name & PIN");
            }
          }}
          style={styles.startButton}
        >
          Start Quiz 🚀
        </button>
      </div>
    );
  }

  // 🎉 QUIZ END SCREEN
  if (quizEnd) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>🎉 Quiz Finished</h2>
          <h3>👤 {name}</h3>
          <h1>🔥 Score: {score}</h1>

          <h3>📊 All Players Results</h3>

          {results.map((r, index) => (
            <p key={index}>
              👤 {r.name} — 🔥 {r.score}
            </p>
          ))}

          <button onClick={restartQuiz} style={styles.startButton}>
            🔄 Restart
          </button>
        </div>
      </div>
    );
  }

  if (!questionData) return <p>Loading...</p>;

  const colors = ["#ff4d4d", "#4CAF50", "#2196F3", "#FFC107"];

  return (
    <div style={styles.container}>
      <h2>👤 Player: {name}</h2>
      <h2>⏱ Time: {time}s</h2>

      <div style={styles.card}>
        <p style={styles.question}>{questionData.question}</p>

        <div style={styles.optionsGrid}>
          {questionData.options.map((option, index) => {
            let buttonStyle = {
              ...styles.button,
              backgroundColor: colors[index],
            };

            if (selectedOption) {
              if (option === selectedOption) {
                buttonStyle = {
                  ...buttonStyle,
                  backgroundColor:
                    option === result?.correctAnswer ? "#4CAF50" : "#f44336",
                };
              } else if (option === result?.correctAnswer) {
                buttonStyle = {
                  ...buttonStyle,
                  backgroundColor: "#4CAF50",
                };
              } else {
                buttonStyle = {
                  ...buttonStyle,
                  opacity: 0.5,
                };
              }
            }

            return (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                style={buttonStyle}
                disabled={!!selectedOption}
              >
                {option}
              </button>
            );
          })}
        </div>

        {result && (
          <p style={result.correct ? styles.correct : styles.wrong}>
            {result.correct ? "🎉 Correct!" : "❌ Wrong!"}
          </p>
        )}

        <h3 style={styles.score}>🔥 Score: {score}</h3>
      </div>
    </div>
  );
};

// 🎨 STYLES
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #ff0080, #7928ca, #2afadf)",
    fontFamily: "Segoe UI, Arial",
    color: "white",
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "20px",
    width: "60%",
    textAlign: "center",
    color: "black",
  },
  question: {
    fontSize: "22px",
    marginBottom: "20px",
  },
  optionsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  button: {
    padding: "15px",
    borderRadius: "10px",
    border: "none",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
  correct: { color: "green", marginTop: "10px" },
  wrong: { color: "red", marginTop: "10px" },
  score: { marginTop: "10px" },
  input: {
    padding: "10px",
    margin: "5px",
    borderRadius: "8px",
    border: "none",
  },
  startButton: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#4CAF50",
    color: "white",
    cursor: "pointer",
    marginTop: "10px",
  },
};

export default QuizApp;