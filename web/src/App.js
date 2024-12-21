import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import Dashboard from "./Dashboard";
import AccountPending from "./AccountPending";
import { Container } from "react-bootstrap";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import Books from "./booksCrud/books";
import AddBook from "./booksCrud/addBook";
import BookById from "./booksCrud/bookById";
import UpdateBooks from "./booksCrud/updateBooks";
import UpdateById from "./booksCrud/updateById";
import DeleteBooks from "./booksCrud/deleteBooks";
import DeleteById from "./booksCrud/deleteById";

function App() {
  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Router>
          <AuthProvider>
            <Routes>
              <Route
                path="/signup"
                element={
                  <PublicRoute>
                    <Signup />
                  </PublicRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/dashboard/books"
                element={
                  <PrivateRoute>
                    <Books />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/books/:id"
                element={
                  <PrivateRoute>
                    <BookById />
                  </PrivateRoute>
                }
              />
                            <Route
                path="/dashboard/update"
                element={
                  <PrivateRoute>
                    <UpdateBooks />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/update/:id"
                element={
                  <PrivateRoute>
                    <UpdateById />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/delete"
                element={
                  <PrivateRoute>
                    <DeleteBooks />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/delete/:id"
                element={
                  <PrivateRoute>
                    <DeleteById />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/addbook"
                element={
                  <PrivateRoute>
                    <AddBook />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route path="/account-pending" element={<AccountPending />} />
            </Routes>
          </AuthProvider>
        </Router>
      </div>
    </Container>
  );
}

export default App;
