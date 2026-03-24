import React, { useEffect, useState } from "react";

const QuizApp = () => {
  const [questionData, setQuestionData] = useState(null);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [quizEnd, setQuizEnd] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const fetchQuestion = () => {
    fetch("http://localhost:5000/question")
      .then((res) => res.json())
      .then((data) => {
        setQuestionData(data);
        setSelectedOption(null);
      });
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  const handleAnswer = (option) => {
    setSelectedOption(option);

    fetch("http://localhost:5000/answer", {
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

  if (quizEnd) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>🎉 Quiz Finished</h2>
          <p style={styles.score}>Your Score: {score}</p>
        </div>
      </div>
    );
  }

  if (!questionData) return <p>Loading...</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Azure Quiz App</h1>

      <div style={styles.card}>
        <p style={styles.question}>{questionData.question}</p>

        <div style={styles.optionsGrid}>
          {questionData.options.map((option) => {
            let buttonStyle = styles.button;

            if (selectedOption) {
              if (option === selectedOption) {
                buttonStyle = {
                  ...styles.button,
                  backgroundColor:
                    option === result?.correctAnswer ? "#4CAF50" : "#f44336",
                };
              } else if (option === result?.correctAnswer) {
                buttonStyle = {
                  ...styles.button,
                  backgroundColor: "#4CAF50",
                };
              } else {
                buttonStyle = {
                  ...styles.button,
                  opacity: 0.6,
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
            {result.correct ? "✅ Correct!" : "❌ Wrong!"}
          </p>
        )}

        <p style={styles.score}>Score: {score}</p>
      </div>
    </div>
  );
};

// ----------------------------
// Styles object
// ----------------------------

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #e3f2fd, #ffffff)",
    fontFamily: "Segoe UI, Arial",
  },
  title: {
    color: "#0078D4",
    marginBottom: "20px",
  },
  card: {
    background: "#ffffff",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    width: "60%",
    textAlign: "center",
  },
  question: {
    fontSize: "20px",
    marginBottom: "20px",
    fontWeight: "500",
  },
  optionsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#0078D4",
    color: "white",
    cursor: "pointer",
    transition: "0.3s",
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
};

export default QuizApp;