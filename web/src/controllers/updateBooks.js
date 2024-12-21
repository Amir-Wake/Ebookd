import { Card, Button } from "react-bootstrap";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import debounce from "lodash.debounce";

export default function UpdateBooks() {
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const bookApi = process.env.REACT_APP_BOOKS_API;

  useEffect(() => {
    fetchBooks(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const fetchBooks = (page, search) => {
    axios
      .get(bookApi, {
        params: {
          page: page,
          pageSize: 10,
          search: search,
        },
      })
      .then((response) => {
        if (page === 1) {
          setBooks(response.data); // Reset books if it's the first page
        } else {
          setBooks((prevBooks) => [...prevBooks, ...response.data]);
        }
      })
      .catch((error) => {
        console.error("Error fetching books", error);
      });
  };

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
    navigate("/dashboard");
  };

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 300),
    []
  );

  const handleSearch = (event) => {
    debouncedSearch(event.target.value);
  };

  return (
    <>
      <br />
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Update Books</h2>
          <input
            type="text"
            placeholder="Search books..."
            onChange={handleSearch}
            style={{ width: "100%", marginBottom: "20px", padding: "10px" }}
          />
          <ul
            className="book-list"
            style={{ listStyleType: "none", padding: 0 }}
          >
            {books.map((book, index) => (
              <li key={`${book.id}-${index}`}>
                <Link
                  to={`/dashboard/update/${book.id}`}
                  style={{ textDecoration: "none" }}
                >
                  {book.title.length > 45
                    ? book.title.substring(0, 40) + "..."
                    : book.title}
                </Link>
              </li>
            ))}
          </ul>
        </Card.Body>
      </Card>
      <Button
        className="w-45 mt-3 "
        style={{ marginRight: "10px" }}
        onClick={handleBack}
      >
        Back to Dashboard
      </Button>
      <Button
        className="w-50 mt-3"
        style={{
          backgroundColor: "red",
          borderColor: "red",
          marginLeft: "20px",
        }}
        onClick={handleSignOut}
      >
        Sign Out
      </Button>
      <br />
      <br />
    </>
  );
}
