import { Card, Button, Form, ProgressBar } from "react-bootstrap";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import axios from "axios";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

export default function AddBook() {
  const apiKey = process.env.REACT_APP_GOOGLE_VISION_API_KEY;
  const apiUrl = process.env.REACT_APP_GOOGLE_VISION_API_URL;
  const bookApi = process.env.REACT_APP_BOOKS_API;
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [printLength, setPrintLength] = useState("");
  const [language, setLanguage] = useState("");
  const [publisher, setPublisher] = useState("");
  const [translator, setTranslator] = useState("");
  const [publicationDate, setPublicationDate] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [epubFile, setEpubFile] = useState(null);
  const [genre, setGenre] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();
  const storage = getStorage();
  const colorApiUri = `${apiUrl}${apiKey}`;

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

  const handleEpubChange = (e) => {
    if (e.target.files[0]) {
      setEpubFile(e.target.files[0]);
    }
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let coverImageUrl = "";
    let fileUrl = "";
    let coverDominantColor = "";

    if (coverImage) {
      const fileExtension = coverImage.name.split(".").pop();
      const storageRef = ref(storage, `books/${title}/cover.${fileExtension}`);
      const uploadTask = uploadBytesResumable(storageRef, coverImage);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error", error);
        },
        async () => {
          coverImageUrl = await getDownloadURL(uploadTask.snapshot.ref);
        }
      );

      await uploadTask.then(async () => {
        coverImageUrl = await getDownloadURL(uploadTask.snapshot.ref);
      });
      if (coverImageUrl) {
        console.log("Cover Image URL:", coverImageUrl);
      }
    }

    if (epubFile) {
      const fileExtension = epubFile.name.split(".").pop();
      const storageRef = ref(storage, `books/${title}/book.${fileExtension}`);
      const uploadTask = uploadBytesResumable(storageRef, epubFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error", error);
        },
        async () => {
          fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
        }
      );

      await uploadTask.then(async () => {
        fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
      });
    }

    const genreArray = genre.split(",").map((g) => g.trim().toLowerCase());

    if (coverImageUrl) {
      const requestData = {
        requests: [
          {
            image: { source: { imageUri: coverImageUrl } },
            features: [{ type: "IMAGE_PROPERTIES", maxResults: 10 }],
          },
        ],
      };

      await axios
        .post(colorApiUri, requestData)
        .then((response) => {
          const colors =
            response.data.responses[0].imagePropertiesAnnotation.dominantColors
              .colors;
          if (colors.length > 0) {
            const highestPixelFractionColor = colors.reduce((prev, current) =>
              prev.pixelFraction > current.pixelFraction ? prev : current
            );
            const rgbString = `rgb(${highestPixelFractionColor.color.red},${highestPixelFractionColor.color.green},${highestPixelFractionColor.color.blue})`;
            coverDominantColor = rgbString;
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }

    const bookData = {
      title,
      author,
      shortDescription,
      longDescription,
      printLength,
      language,
      publisher,
      translator,
      publicationDate,
      coverImageUrl,
      coverDominantColor,
      fileUrl,
      genre: genreArray,
      createdDate: new Date().toISOString(),
    };
    const token = await auth.currentUser.getIdToken();
    axios
      .post(bookApi, bookData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          setUploadProgress(progress);
        },
      })
      .then(() => {
        navigate("/dashboard");
      })
      .catch((error) => {
        console.error("Error adding book", error);
      });
  };

  return (
    <>
      <br />
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Add Book</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group id="title">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group id="author">
              <Form.Label>Author</Form.Label>
              <Form.Control
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group id="shortDescription">
              <Form.Label>Short Description</Form.Label>
              <Form.Control
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group id="longDescription">
              <Form.Label>Long Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={longDescription}
                onChange={(e) => setLongDescription(e.target.value)}
                required
              />
              <Form.Group id="genre">
                <Form.Label>Genre (separated by commas)</Form.Label>
                <Form.Control
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  required
                />
              </Form.Group>
            </Form.Group>
            <Form.Group id="printLength">
              <Form.Label>Print Length</Form.Label>
              <Form.Control
                type="text"
                value={printLength}
                onChange={(e) => setPrintLength(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group id="language">
              <Form.Label>Language</Form.Label>
              <Form.Control
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group id="publisher">
              <Form.Label>Publisher</Form.Label>
              <Form.Control
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group id="translator">
              <Form.Label>Translator</Form.Label>
              <Form.Control
                type="text"
                value={translator}
                onChange={(e) => setTranslator(e.target.value)}
              />
            </Form.Group>
            <Form.Group id="publicationDate">
              <Form.Label>Publication Date</Form.Label>
              <Form.Control
                type="date"
                value={publicationDate}
                onChange={(e) => setPublicationDate(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group id="coverImage">
              <Form.Label>Cover Image</Form.Label>
              <Form.Control type="file" onChange={handleImageChange} />
            </Form.Group>
            <Form.Group id="epubFile">
              <Form.Label>File</Form.Label>
              <Form.Control type="file" onChange={handleEpubChange} />
            </Form.Group>
            <Button className="w-100 mt-3" type="submit">
              Add Book
            </Button>
          </Form>
          {uploadProgress > 0 && (
            <ProgressBar
              now={uploadProgress}
              label={`${Math.round(uploadProgress)}%`}
              className="mt-3"
            />
          )}
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
