import { Card, Button } from "react-bootstrap";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function BookById() {
  const [book, setBook] = useState(null);
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
        navigate("/login"); // Navigate to Sign In page after sign out
      })
      .catch((error) => {
        console.error("Sign out error", error);
      });
  };

  const handleBack = () => {
    navigate("/dashboard/books");
  };

  return (
    <>
      <br />
      {book ? (
        <Card className="mt-4">
          <Card.Body>
            <h2 className="text-center mb-4">Book Details</h2>
            <p>
              <strong>Title:</strong> {book.title}
            </p>
            <p>
              <strong>Author:</strong> {book.author}
            </p>
            <p>
              <strong>Cover:</strong> <br />
              <img
                src={book.coverImageUrl}
                alt={book.title}
                style={{ width: 200, height: 300 }}
              />
            </p>
            <p>
              <strong>Short Description:</strong> {book.shortDescription}
            </p>
            <p>
              <strong>Long Description:</strong> {book.longDescription}
            </p>
            <p>
              <strong>Genre:</strong> {book.genre}
            </p>
            <p>
              <strong>Print Length:</strong> {book.printLength}
            </p>
            <p>
              <strong>Language:</strong> {book.language}
            </p>
            <p>
              <strong>Translator:</strong> {book.translator}
            </p>
            <p>
              <strong>Publisher:</strong> {book.publisher}
            </p>
            <p>
              <strong>Publication Date:</strong> {book.publicationDate}
            </p>
          </Card.Body>
        </Card>
      ) : (
        <p>Loading...</p>
      )}
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
