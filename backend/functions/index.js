const functions = require("firebase-functions/v2/https");

const booksRoutes = require("./booksRoutes");
exports.booksroutes = functions.onRequest(booksRoutes);

const userAuth = require("./userAuth");
exports.deleteUserDoc = userAuth.deleteUserDoc;
exports.addUserRole = userAuth.addUserRole;
