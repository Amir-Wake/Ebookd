const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const db = admin.firestore();
const storage = admin.storage().bucket();

const app = express();

app.use(express.json());
app.use(cors());

app.get("/books/:id/reviews", async (req, res) => {
  try {
    const bookId = req.params.id;
    const snapshot = await db
        .collection("reviews")
        .where("bookId", "==", bookId)
        .orderBy("createdDate", "desc")
        .limit(5)
        .get();
    const reviews = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const createdDate = data.createdDate.toDate();
      const formattedDate = createdDate.toLocaleString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      reviews.push({id: doc.id, ...data, createdDate: formattedDate});
    });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

app.get("/books/:bookId/:userId", async (req, res) => {
  try {
    const bookId = req.params.bookId;
    const userId = req.params.userId;
    const snapshot = await db
        .collection("reviews")
        .where("bookId", "==", bookId)
        .where("userId", "==", userId)
        .get();
    const reviews = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const createdDate = data.createdDate.toDate();
      const formattedDate = createdDate.toLocaleString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      reviews.push({id: doc.id, ...data, createdDate: formattedDate});
    });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

app.delete("/books/:bookId/reviews/:reviewId", async (req, res) => {
  try {
    const {bookId, reviewId} = req.params;
    const reviewDoc = await db.collection("reviews")
        .doc(reviewId).get().limit(5);
    if (!reviewDoc.exists) {
      return res.status(404).json({error: "Review not found"});
    }

    if (reviewDoc.data().bookId !== bookId) {
      return res.status(404).json({error: "Review not found"});
    }

    const reviewData = reviewDoc.data();
    const bookDoc = await db.collection("books").doc(bookId).get();
    if (!bookDoc.exists) {
      return res.status(404).json({error: "Book not found"});
    }

    await db.runTransaction(async (transaction) => {
      const bookRef = db.collection("books").doc(bookId);
      const bookData = bookDoc.data();

      const newReviewCount = (bookData.reviewCount || 0) - 1;
      let newAverageRating = 0;

      if (newReviewCount > 0) {
        newAverageRating =
          ((bookData.averageRating || 0) * (bookData.reviewCount || 0) -
           reviewData.rating) /
          newReviewCount;
      }

      transaction.update(bookRef, {
        reviewCount: newReviewCount,
        averageRating: newAverageRating,
      });

      transaction.delete(db.collection("reviews").doc(reviewId));
    });

    res.status(204).end();
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

app.post("/books/:id/reviews", async (req, res) => {
  try {
    const bookId = req.params.id;
    const {rating, comment, userId, title} = req.body;

    if (!rating || !userId ) {
      return res.status(400).json({error: "Missing required fields"});
    }

    const review = {
      rating,
      comment,
      userId,
      title,
      createdDate: admin.firestore.FieldValue.serverTimestamp(),
    };

    const bookDoc = await db.collection("books").doc(bookId).get();
    if (!bookDoc.exists) {
      return res.status(404).json({error: "Book not found"});
    }

    await db.runTransaction(async (transaction) => {
      const bookRef = db.collection("books").doc(bookId);
      const reviewRef = db.collection("reviews").doc();

      transaction.set(reviewRef, {bookId, ...review});

      const bookData = bookDoc.data();
      const newReviewCount = (bookData.reviewCount || 0) + 1;
      const newAverageRating =
        ((bookData.averageRating || 0) * (bookData.reviewCount || 0) + rating) /
        newReviewCount;

      transaction.update(bookRef, {
        reviewCount: newReviewCount,
        averageRating: newAverageRating,
      });
    });

    res.status(201).json({message: "Review added successfully"});
  } catch (error) {
    console.error("Error posting review:", error);
    res.status(500).json({error: error.message});
  }
});
module.exports = app;
