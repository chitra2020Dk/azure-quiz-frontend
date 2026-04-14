import React, { useEffect, useState } from "react";

const API_URL = "https://quizgo-app-apajc5dgeje5ageh.westeurope-01.azurewebsites.net";

const QuizApp = () => {
  const [questionData, setQuestionData] = useState(null);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [quizEnd, setQuizEnd] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  // NEW STATES
  const [quizStarted, setQuizStarted] = useState(false);
  const [pin, setPin] = useState("");

  const fetchQuestion = () => {
    fetch(`${API_URL}/question`)
      .then((res) => res.json())
      .then((data) => {
        setQuestionData(data);
        setSelectedOption(null);
      });
  };

  useEffect(() => {
    if (quizStarted) {
      fetchQuestion();
    }
  }, [quizStarted]);

  const handleAnswer = (option) => {
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
          setTimeout(() => setQuizEnd(true), 1200);
        }
      });
  };

  // 🎯 PIN SCREEN
  if (!quizStarted) {
    return (
      <div style={styles.container}>
        <h1 style={{ fontSize: "40px" }}>🎯 Enter Quiz PIN</h1>

        <input
          type="text"
          placeholder="Enter PIN (1234)"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          style={styles.input}
        />

        <button
          onClick={() => {
            if (pin === "1234") {
              setQuizStarted(true);
            } else {
              alert("❌ Wrong PIN");
            }
          }}
          style={styles.startButton}
        >
          Start Quiz 🚀
        </button>
      </div>
    );
  }

  // 🎉 QUIZ END
  if (quizEnd) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>🎉 Quiz Finished</h2>
          <h1>🔥 Score: {score}</h1>
        </div>
      </div>
    );
  }

  if (!questionData) return <p>Loading...</p>;

  const colors = ["#ff4d4d", "#4CAF50", "#2196F3", "#FFC107"];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🚀 Azure Quiz App</h1>

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
    background:
      "linear-gradient(135deg, #ff0080, #7928ca, #2afadf)",
    fontFamily: "Segoe UI, Arial",
    color: "white",
  },
  title: {
    marginBottom: "20px",
    fontSize: "32px",
  },
  card: {
    background: "#ffffff",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    width: "60%",
    textAlign: "center",
    color: "black",
  },
  question: {
    fontSize: "22px",
    marginBottom: "20px",
    fontWeight: "600",
  },
  optionsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  button: {
    padding: "15px",
    borderRadius: "12px",
    border: "none",
    fontSize: "16px",
    fontWeight: "bold",
    color: "white",
    cursor: "pointer",
  },
  correct: {
    color: "green",
    fontWeight: "bold",
    marginTop: "15px",
  },
  wrong: {
    color: "red",
    fontWeight: "bold",
    marginTop: "15px",
  },
  score: {
    marginTop: "15px",
    fontWeight: "bold",
  },
  input: {
    padding: "12px",
    fontSize: "18px",
    borderRadius: "10px",
    border: "none",
    marginBottom: "10px",
    textAlign: "center",
  },
  startButton: {
    padding: "12px 20px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#4CAF50",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default QuizApp;