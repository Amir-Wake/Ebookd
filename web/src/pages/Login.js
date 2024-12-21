import React, { useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const signin = (event) => {
    event.preventDefault();
    setLoading(true);
    setError(""); 
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        setLoading(false);
        navigate("/dashboard");
      })
      .catch((error) => {
        if (
          error.code === "auth/wrong-password" ||
          error.code === "auth/user-not-found" ||
          error.code === "auth/invalid-credential" ||
          error.code === "auth/invalid-email" ||
          error.code === "auth/user-disabled"
        ) {
          setError("Email or password is incorrect");
        } else {
          setError(error.message);
        }
        setLoading(false);
      });
  };

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Sign In</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={signin}>
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
            <br />
            <Button disabled={loading} className="w-100" type="submit">
              Sign In
            </Button>
          </Form>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        Need an account? <Link to="/signup">Sign Up</Link>
      </div>
    </>
  );
}
