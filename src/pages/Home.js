import { Formik } from "formik";
import React, { useState } from "react";
import { Button, Card, Col, Form, InputGroup, Row, Spinner } from "react-bootstrap";
import InputGroupText from "react-bootstrap/esm/InputGroupText";
import * as Yup from "yup";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToken } from "../redux/userSlice";

const registerValidationSchema = Yup.object({
  userName: Yup.string().required("Username is required"),
  email: Yup.string().required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const loginValidationSchema = Yup.object({
  email: Yup.string().required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const baseUrl = process.env.REACT_APP_BASE_URL;
const Home = () => {
  const [viewRegPassword, setViewRegPassword] = useState(false);
  const [viewLogPassword, setViewLogPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [regLoading, setRegLoading] = useState(false);
  const [logLoading, setLogLoading] = useState(false);

  const handleRegister = async (values, resetForm) => {
    try {
      setRegLoading(true)
      const response = await axios.post(`${baseUrl}/user/register`, values);

      alert(response.data.message || "Login successful!");
      setRegLoading(false)
      resetForm();
    } catch (error) {
      console.error("Error while registering user", error.message);
      alert(
        error.response.data.message ||
          error.response.data.error ||
          error.message ||
          "Something went wrong!"
      );
    } finally {
      setRegLoading(false)
    }
  };

  const handleLogin = async (values, resetForm) => {
    try {
       setLogLoading(true)
      const response = await axios.post(`${baseUrl}/user/login`, values);
      alert(response.data.message || "Login successful!");
      resetForm();

      dispatch(addToken(response.data.token))
       setLogLoading(false)
      navigate("/dashboard");
    } catch (error) {
      console.error("Error while login", error.message);
      alert(
        error.response.data.message ||
          error.response.data.error ||
          error.message ||
          "Something went wrong!"
      );
    } finally {
      setLogLoading(false)
    }
  };
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <Row className="justify-content-center align-items-center">
        <Col>
          <Card>
            <Card.Body>
              <Formik
                initialValues={{
                  userName: "",
                  email: "",
                  password: "",
                }}
                validationSchema={registerValidationSchema}
                onSubmit={(values, { resetForm }) => {
                  handleRegister(values, resetForm);
                }}
              >
                {({
                  handleSubmit,
                  handleChange,
                  handleBlur,
                  errors,
                  values,
                  touched,
                }) => (
                  <Form onSubmit={handleSubmit}>
                    <h5>Sign Up</h5>
                    <hr />
                    <Form.Group>
                      <Form.Label className="d-flex justify-content-start">
                        Username
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="userName"
                        value={values.userName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.userName && errors.userName}
                      />
                      {touched.userName && errors.userName && (
                        <p className="text-danger">{errors.userName}</p>
                      )}
                    </Form.Group>

                    <Form.Group className="mt-2">
                      <Form.Label className="d-flex justify-content-start">
                        Email
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.email && errors.email}
                      />
                      {touched.email && errors.email && (
                        <p className="text-danger">{errors.email}</p>
                      )}
                    </Form.Group>

                    <Form.Group className="mt-2">
                      <Form.Label className="d-flex justify-content-start">
                        Password
                      </Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={viewRegPassword ? "text" : "password"}
                          name="password"
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.password && errors.password}
                        />
                        <InputGroupText
                          style={{ cursor: "pointer" }}
                          onClick={() => setViewRegPassword((prev) => !prev)}
                        >
                          {viewRegPassword ? <IoMdEye /> : <IoMdEyeOff />}
                        </InputGroupText>
                      </InputGroup>
                      {touched.password && errors.password && (
                        <p className="text-danger">{errors.password}</p>
                      )}
                    </Form.Group>

                    <Button type="submit" className="w-100 mt-4" disabled={regLoading}>
                      {regLoading ? <Spinner size="sm" animation="border" /> : "Save"} 
                    </Button>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card>
            <Card.Body>
              <Formik
                initialValues={{
                  userName: "",
                  email: "",
                  password: "",
                }}
                validationSchema={loginValidationSchema}
                onSubmit={(values, { resetForm }) => {
                  handleLogin(values, resetForm);
                }}
              >
                {({
                  handleSubmit,
                  handleChange,
                  handleBlur,
                  errors,
                  values,
                  touched,
                }) => (
                  <Form onSubmit={handleSubmit}>
                    <h5>Sign In</h5>
                    <hr />

                    <Form.Group className="mt-2">
                      <Form.Label className="d-flex justify-content-start">
                        Email
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.email && errors.email}
                      />
                      {touched.email && errors.email && (
                        <p className="text-danger">{errors.email}</p>
                      )}
                    </Form.Group>

                    <Form.Group className="mt-2">
                      <Form.Label className="d-flex justify-content-start">
                        Password
                      </Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={viewLogPassword ? "text" : "password"}
                          name="password"
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.password && errors.password}
                        />
                        <InputGroupText
                          style={{ cursor: "pointer" }}
                          onClick={() => setViewLogPassword((prev) => !prev)}
                        >
                          {viewLogPassword ? <IoMdEye /> : <IoMdEyeOff />}
                        </InputGroupText>
                      </InputGroup>
                      {touched.password && errors.password && (
                        <p className="text-danger">{errors.password}</p>
                      )}
                    </Form.Group>

                    <Button type="submit" className="w-100 mt-4" disabled={logLoading}>
                      {logLoading ? <Spinner size="sm" animation="border" /> : "Submit"}
                    </Button>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
