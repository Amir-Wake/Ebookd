import React, { useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const signup = (event) => {
    event.preventDefault();
    if (password !== passwordConfirm) {
      return setError("Passwords do not match");
    }
    if (password.length < 6) {
      return setError("Password should be at least 6 characters");
    }
    setLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        signOut(auth) // Sign out the user immediately after account creation
          .then(() => {
            setLoading(false);
            navigate("/account-pending"); // Navigate to the temporary page
          })
          .catch((error) => {
            setError(error.message);
            setLoading(false);
          });
      })
      .catch((error) => {
          navigate("/account-pending"); // Navigate to the temporary page
        setLoading(false);
      });
  };

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Sign Up</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={signup}>
            <Form.Group id="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group id="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group id="password-confirm">
              <Form.Label>Password Confirmation</Form.Label>
              <Form.Control
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
              />
            </Form.Group>
            <br />
            <Button disabled={loading} className="w-100" type="submit">
              Sign Up
            </Button>
          </Form>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        Already have an account? <Link to="/login">Log In</Link>
      </div>
    </>
  );
}