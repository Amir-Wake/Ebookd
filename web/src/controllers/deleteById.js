import { Card, Button } from "react-bootstrap";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function DeleteById() {
  const [book, setBook] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();
  const bookApi = process.env.REACT_APP_BOOKS_API;

  useEffect(() => {
    axios
      .get(`${bookApi}${id}`)
      .then((response) => {
        setBook(response.data);
      })
      .catch((error) => {
        console.error("Error fetching book", error);
      });
  }, [id]);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        console.error("Sign out error", error);
      });
  };

  const handleBack = () => {
    navigate("/dashboard/delete");
  };

  const handleDelete = async () => {
    const token = await auth.currentUser.getIdToken();
    
    axios
      .delete(`https://booksroutes-udaeuh6qca-uc.a.run.app/books/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }})
      .then((response) => {
        console.log("Book deleted successfully", response.data);
        navigate("/dashboard/delete");
      })
      .catch((error) => {
        console.error("Error deleting book", error);
      });
  };

  return (
    <>
      <br />
      <Card className="mt-4">
        <Card.Body>
          <h2 className="text-center mb-4">Delete Book</h2>
          <p>Are you sure you want to delete the book titled "{book.title}"?</p>
          <Button
            className="w-100 mt-3"
            onClick={handleDelete}
            style={{ backgroundColor: "red", borderColor: "red" }}
          >
            Delete
          </Button>
        </Card.Body>
      </Card>
      <Button className="w-50 mt-3" onClick={handleBack}>
        Back to Books
      </Button>
      <Button
        className="w-50 mt-3"
        style={{ backgroundColor: "red", borderColor: "red" }}
        onClick={handleSignOut}
      >
        Sign Out
      </Button>
      <br />
      <br />
    </>
  );
}
