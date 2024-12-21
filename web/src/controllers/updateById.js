import { Card, Button, Form } from "react-bootstrap";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function UpdateById() {
  const [book, setBook] = useState({
    title: "",
    author: "",
    shortDescription: "",
    longDescription: "",
    printLength: "",
    language: "",
    translator: "",
    publisher: "",
    publicationDate: "",
    coverImageUrl: "",
    genre: "",
    fileUrl: "",
  });
  const navigate = useNavigate();
  const { id } = useParams();
  const [coverImage, setCoverImage] = useState(null);
  const [file, setFile] = useState(null);
  const storage = getStorage();
  const bookApi = process.env.REACT_APP_BOOKS_API;

  useEffect(() => {
    axios
      .get(`${bookApi}${id}`)
      .then((response) => {
        const data = response.data;
        setBook(data);
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

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let coverImageUrl = book.coverImageUrl;
    let fileUrl = book.fileUrl;

    if (coverImage) {
      const fileExtension = coverImage.name.split(".").pop();
      const storageRef = ref(
        storage,
        `books/${book.title}/cover.${fileExtension}`
      );
      await uploadBytes(storageRef, coverImage);
      coverImageUrl = await getDownloadURL(storageRef);
    }

    if (file) {
      const fileExtension = file.name.split(".").pop();
      const storageRef = ref(
        storage,
        `books/${book.title}/file.${fileExtension}`
      );
      await uploadBytes(storageRef, file);
      fileUrl = await getDownloadURL(storageRef);
    }

    const updatedBookData = {
      ...book,
      coverImageUrl,
      fileUrl,
      genre:
        typeof book.genre === "string" && book.genre.length > 0
          ? book.genre.split(",").map((g) => g.trim().toLowerCase())
          : book.genre,
    };

    const token = await auth.currentUser.getIdToken();

    axios
      .put(
        `https://booksroutes-udaeuh6qca-uc.a.run.app/books/${id}`,
        updatedBookData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        navigate(`/dashboard/update`);
      })
      .catch((error) => {
        console.error("Error updating book", error);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook((prevBook) => ({
      ...prevBook,
      [name]: value,
    }));
  };

  const handleBack = () => {
    navigate("/dashboard/update");
  };

  return (
    <>
      <br />
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Update Book</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group id="title">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={book.title}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group id="author">
              <Form.Label>Author</Form.Label>
              <Form.Control
                type="text"
                name="author"
                value={book.author}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group id="coverImage">
              <Form.Label>Cover Image</Form.Label>
              <Form.Control type="file" onChange={handleImageChange} />
              <img
                src={book.coverImageUrl}
                alt={book.title}
                style={{ width: 200, height: 300 }}
              />
            </Form.Group>
            <Form.Group id="file">
              <Form.Label>File</Form.Label>
              <Form.Control type="file" onChange={handleFileChange} />
            </Form.Group>
            <Form.Group id="shortDescription">
              <Form.Label>Short Description</Form.Label>
              <Form.Control
                type="text"
                name="shortDescription"
                value={book.shortDescription}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group id="longDescription">
              <Form.Label>Long Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="longDescription"
                value={book.longDescription}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group id="genre">
              <Form.Label>Genre (comma separated)</Form.Label>
              <Form.Control
                type="text"
                name="genre"
                value={book.genre}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group id="printLength">
              <Form.Label>Print Length</Form.Label>
              <Form.Control
                type="text"
                name="printLength"
                value={book.printLength}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group id="language">
              <Form.Label>Language</Form.Label>
              <Form.Control
                type="text"
                name="language"
                value={book.language}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group id="publisher">
              <Form.Label>Publisher</Form.Label>
              <Form.Control
                type="text"
                name="publisher"
                value={book.publisher}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group id="translator">
              <Form.Label>Translator</Form.Label>
              <Form.Control
                type="text"
                name="translator"
                value={book.translator}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group id="publicationDate">
              <Form.Label>Publication Date</Form.Label>
              <Form.Control
                type="date"
                name="publicationDate"
                value={book.publicationDate}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Button className="w-100 mt-3" type="submit">
              Update Book
            </Button>
          </Form>
        </Card.Body>
      </Card>
      <Button
        className="w-45 mt-3 "
        style={{ marginRight: "10px" }}
        onClick={handleBack}
      >
        Back to Books
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
