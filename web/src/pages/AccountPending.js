import React from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function AccountPending() {
  return (
    <Card>
      <Card.Body>
        <h2 className="text-center mb-4">Account Pending</h2>
        <p className="text-center">
          Your account has been created successfully. It will be active soon.
        </p>
        <div className="w-100 text-center mt-2">
          <Link to="/login">Go to Login</Link>
        </div>
      </Card.Body>
    </Card>
  );
}
