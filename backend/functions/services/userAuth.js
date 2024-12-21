const functions = require("firebase-functions");
const admin = require("firebase-admin");


exports.deleteUserDoc = functions.auth.user().onDelete(async (user) => {
  const userRef = admin.firestore().collection("users").doc(user.uid);
  await userRef.delete();
});

exports.addUserRole = functions.auth.user().onCreate(async (user) => {
  const userRef = admin.firestore().collection("users").doc(user.uid);
  await userRef.set({
    email: user.email,
    role: "user",
  });
});
