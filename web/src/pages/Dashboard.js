import React, { useState, useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import { auth, getUserRole } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getUserRole(auth.currentUser).then(setRole);
  }, []);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        console.error("Sign out error", error);
      });
  };

  const handleBooks = () => {
    navigate("/dashboard/books");
  };
  const handleAddBook = () => {
    navigate("/dashboard/addBook");
  };
  const handleUpdate = () => {
    navigate("/dashboard/update");
  };
  const handleDelete = () => {
    navigate("/dashboard/delete");
  };

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Dashboard</h2>
          <Button className="w-100 mt-3" onClick={handleBooks}>
            View books
          </Button>
          {role === "admin" && (
            <>
              <Button className="w-100 mt-3" onClick={handleAddBook}>
                Add a book
              </Button>
              <Button className="w-100 mt-3" onClick={handleUpdate}>
                Edit a book
              </Button>
              <Button className="w-100 mt-3" onClick={handleDelete}>
                Delete a book
              </Button>
            </>
          )}
        </Card.Body>
      </Card>
      <Button
        className="w-50 mt-3"
        style={{ backgroundColor: "red", borderColor: "red" }}
        onClick={handleSignOut}
      >
        Sign Out
      </Button>
    </>
  );
}
