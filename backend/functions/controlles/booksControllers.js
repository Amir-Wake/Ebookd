const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const generateKeywords = require("../services/generateKeywords");

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage().bucket();

const app = express();
app.use(express.json());
app.use(cors());

app.get("/books", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const searchTerm = req.query.search ? req.query.search.toLowerCase() : "";
    const offset = (page - 1) * pageSize;

    let query = db
        .collection("books")
        .orderBy("createdDate", "desc")
        .offset(offset)
        .limit(pageSize);

    if (searchTerm) {
      query = db
          .collection("books")
          .where("keywords", "array-contains", searchTerm);
    }

    const snapshot = await query.get();
    const books = [];

    snapshot.forEach((doc) => {
      books.push({id: doc.id, ...doc.data()});
    });

    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

app.get("/books/:id", async (req, res) => {
  try {
    const bookId = req.params.id;
    const bookDoc = await db.collection("books").doc(bookId).get();
    if (!bookDoc.exists) {
      return res.status(404).json({error: "Book not found"});
    }
    res.status(200).json(bookDoc.data());
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

app.get("/newest", async (req, res) => {
  try {
    const snapshot = await db
        .collection("books")
        .orderBy("createdDate", "desc")
        .limit(4)
        .get();
    const newBooks = [];

    snapshot.forEach((doc) => {
      newBooks.push({id: doc.id, ...doc.data()});
    });

    res.status(200).json(newBooks);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

app.get("/books/genre/:genre", async (req, res) => {
  try {
    const genre = req.params.genre.toLowerCase();
    const snapshot = await db
        .collection("books")
        .where("genre", "array-contains", genre)
        .limit(8)
        .get();
    const books = [];

    snapshot.forEach((doc) => {
      books.push({id: doc.id, ...doc.data()});
    });

    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

const checkAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    if (userDoc.exists && userDoc.data().role === "admin") {
      next();
    } else {
      res.status(403).json({error: "Forbidden"});
    }
  } catch (error) {
    res.status(401).json({error: "Unauthorized"});
  }
};

app.post("/books", checkAdmin, async (req, res) => {
  try {
    const {title, author, ...rest} = req.body;
    const keywords = generateKeywords(title, author);
    const newBook = await db
        .collection("books")
        .add({title, author, keywords, ...rest});
    res.status(201).json({id: newBook.id});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

app.delete("/books/:id", checkAdmin, async (req, res) => {
  try {
    const bookId = req.params.id;
    const bookDoc = await db.collection("books").doc(bookId).get();
    if (!bookDoc.exists) {
      return res.status(404).json({error: "Book not found"});
    }

    const bookTitle = bookDoc.data().title;
    const [files] = await storage.getFiles({prefix: `books/${bookTitle}/`});
    for (const file of files) {
      await file.delete();
    }
    await db.collection("books").doc(bookId).delete();

    res.status(204).end();
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

app.put("/books/:id", checkAdmin, async (req, res) => {
  try {
    const {title, author, ...rest} = req.body;
    const keywords = generateKeywords(title, author);
    await db
        .collection("books")
        .doc(req.params.id)
        .update({title, author, keywords, ...rest});
    res.status(204).end();
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});
module.exports = app;
