import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
} from "react-bootstrap";
import InputGroupText from "react-bootstrap/esm/InputGroupText";
import { BsStopFill } from "react-icons/bs";
import { IoMdMic, IoMdTrash } from "react-icons/io";
import { IoStop } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { removeToken } from "../redux/userSlice";

const baseUrl = process.env.REACT_APP_BASE_URL;

const Dashboard = () => {
  const authToken = useSelector((x) => x.user.token);
  const dispatch = useDispatch();

  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);
  const stopManually = useRef(false);

  const [responseValue, setResponseValue] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [speakHistory, setSpeakHistory] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const viewHistory = async () => {
    try {
      const response = await axios.get(`${baseUrl}/chat/viewChat`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (response.data) {
        setChatHistory(response.data.data);
      }
    } catch (error) {
      console.error("Error while view history", error.message);
      if (error.response.status !== 404) {
        alert(
          error.response.data.message ||
            error.response.data.error ||
            error.message ||
            "Something went wrong!"
        );
      }
    }
  };

  useEffect(() => {
    viewHistory();
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition");
      return;
    }

    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = false;
    recog.lang = "en-US";

    recog.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      setInputText((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recog.onerror = (error) => {
      console.error("Speech recognition error:", error);
      setIsListening(false);
    };

    recog.onend = () => {
      if (!stopManually.current) {
        console.log("Restarting recognition...");
        try {
          recog.start();
        } catch (err) {
          console.warn("Restart blocked — recognition still active.");
        }
      } else {
        console.log("Stopped manually.");
      }
    };

    recognitionRef.current = recog;

    return () => {
      recog.abort();
      recognitionRef.current = null;
    };
  }, []);

  const handleStart = () => {
    const recog = recognitionRef.current;
    if (!recog) return;

    if (isListening) {
      console.warn("Already listening...");
      return;
    }

    stopManually.current = false;
    try {
      recog.start();
      setIsListening(true);
      console.log("Started listening...");
    } catch (err) {
      console.warn("Speech recognition already running.");
    }
  };

  const handleStop = () => {
    const recog = recognitionRef.current;
    if (!recog) return;

    stopManually.current = true;
    try {
      recog.stop();
      console.log("Stopped listening...");
    } catch (err) {
      console.warn("Recognition already stopped.");
    }
    setIsListening(false);
  };

  const askQuestion = async (values) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${baseUrl}/chat/question`, values, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (response?.data) {
        setIsLoading(false);
        setResponseValue(response.data.data);
      }
    } catch (error) {
      console.error("Error while asking question", error.message);
      alert(
        error.response.data.message ||
          error.response.data.error ||
          error.message ||
          "Something went wrong!"
      );
    } finally {
      setIsListening(false);
    }
  };

  const speakAloud = () => {
    if (!responseValue) return;
    const utterance = new SpeechSynthesisUtterance(responseValue);
    utterance.lang = "en-US";
    utterance.pitch = 1;
    utterance.rate = 1;
    speechSynthesis.speak(utterance);
  };

  const speakAloudHistory = (value, index) => {
    if (!value) return;

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(value);
    utterance.lang = "en-US";
    utterance.pitch = 1;
    utterance.rate = 1;
    setSpeakHistory(index);

    utterance.onend = () => {
      setSpeakHistory(null);
    };
    speechSynthesis.speak(utterance);
  };

  const stopSpeakHistory = () => {
    setSpeakHistory(null);
    speechSynthesis.cancel();
  };

  const removeHistory = async (value) => {
    const confirmed = window.confirm("Are you sure to delete this Chat?");
    if (!confirmed) return;
    try {
      const response = await axios.delete(
        `${baseUrl}/chat/deleteChat/${value}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.status === 200) {
        setChatHistory((prev) => prev.filter((x) => x._id !== value))
        await viewHistory();
      }
    } catch (error) {
      console.error("Error while removing history", error.message);
      alert(
        error.response.data.message ||
          error.response.data.error ||
          error.message ||
          "Something went wrong!"
      );
    }
  };

   const handleLogout = () => {
    dispatch(removeToken());
  };


  useEffect(() => {
    setResponseValue("");
  }, [inputText]);

  useEffect(() => {
    if (responseValue !== "") {
      viewHistory();
    } else {
      speechSynthesis.cancel();
    }
  }, [responseValue]);

  return (
    <div>
      <Container>
        <Row>
          <Col md={8} className="mt-4">
            <div>
              <InputGroup>
                <Form.Control
                  type="text"
                  name="inputText"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    isListening ? "Listening..." : "Speak something..."
                  }
                />

                <InputGroupText
                  style={{
                    cursor: isListening ? "not-allowed" : "pointer",
                  }}
                  onClick={handleStart}
                  title="Start Listening"
                >
                  <IoMdMic />
                </InputGroupText>

                <InputGroupText
                  style={{
                    cursor: isListening ? "pointer" : "not-allowed",
                    backgroundColor: isListening ? "red" : "",
                  }}
                  onClick={isListening ? handleStop : undefined}
                  title="Stop Listening"
                >
                  <BsStopFill />
                </InputGroupText>
              </InputGroup>
            </div>

            <div>
              <Button
                className="mt-3 me-3"
                onClick={(e) => askQuestion({ question: inputText })}
              >
                Submit
              </Button>
              <Button
                className="mt-3"
                variant="danger"
                onClick={() => setInputText("")}
              >
                Clear
              </Button>
            </div>

            {isLoading ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "200px" }}
              >
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : responseValue ? (
              <div className="w-100 mt-3">
                <Card>
                  <Card.Body>
                    <h5 className="text-start">{inputText}</h5>
                    <p className="text-start">{responseValue}</p>
                    <span style={{ cursor: "pointer" }} onClick={speakAloud}>
                      {<IoMdMic />}
                    </span>
                  </Card.Body>
                </Card>
              </div>
            ) : (
              ""
            )}
          </Col>

          <Col md={4} className="mt-4 mb-4">
            <Card style={{ minHeight: "80vh" }}>
              <Card.Header>Chat History</Card.Header>
              <Card.Body
                style={{
                  overflowY: "auto",
                  maxHeight: "80vh",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                }}
              >
                {chatHistory.length > 0 ? (
                  chatHistory.map((item, index) => (
                    <Card key={index} className="mb-5">
                      <Card.Header className="text-start">
                        {item.query}
                      </Card.Header>
                      <Card.Body className="text-start">
                        {item.response}
                        <div className="text-end">
                          <span>
                            <small className="text-muted">
                              {item.createdAt}
                            </small>
                          </span>
                        </div>
                      </Card.Body>
                      <Card.Footer>
                        {speakHistory === index ? (
                          <Button
                            variant="danger"
                            onClick={stopSpeakHistory}
                            style={{ cursor: "pointer" }}
                          >
                            <IoStop />
                          </Button>
                        ) : (
                          <div className="d-flex justify-content-around">
                            <span
                              onClick={() =>
                                speakAloudHistory(item.response, index)
                              }
                              style={{ cursor: "pointer" }}
                            >
                              <IoMdMic />
                            </span>
                            <span
                              onClick={() => removeHistory(item._id)}
                              style={{ cursor: "pointer" }}
                            >
                              <IoMdTrash />
                            </span>
                          </div>
                        )}
                      </Card.Footer>
                    </Card>
                  ))
                ) : (
                  <p>Your history is Empty! Try searching something.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Button variant="outline-secondary" onClick={handleLogout}>Logout</Button>
      </Container>
    </div>
  );
};

export default Dashboard;
