import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavigationBar from "./components/Navbar";
import Home from "./pages/Home";
import Books from "./pages/Books";
import Borrowed from "./pages/Borrowed";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import IssueBook from "./pages/IssueBook";
import UsersPage from "./pages/UsersPage";
import BookForm from "./components/BookForm";
import ReservationQueue from "./pages/ReservationQueue";

// Toastify imports
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  // Handler for adding a new book
  const handleAddBook = async (formData) => {
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    console.log("📨 Sending formData:");
    for (let pair of data.entries()) {
      console.log(pair[0] + ": ", pair[1]);
    }

    try {
      const response = await fetch("http://localhost:8000/api/books/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          // Let the browser set the Content-Type header for FormData automatically
        },
        body: data,
      });

      const result = await response.json();
      console.log("📦 Server response:", result);

      if (response.ok) {
        toast.success("Book added successfully!");
      } else {
        toast.error(result?.detail || "Failed to add book.");
      }
    } catch (error) {
      console.error("Error adding book:", error);
      toast.error("Something went wrong!");
    }
  };

  return (
    <>
      <Router>
        <NavigationBar />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<Books />} />
            <Route path="/borrowed" element={<Borrowed />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/register" element={<Register />} />
            <Route path="/issue-book" element={<IssueBook />} />
            <Route path="/users" element={<UsersPage />} />
            <Route
              path="/books/add"
              element={<BookForm onSubmit={handleAddBook} />}
            />
            <Route
              path="/reservations/:bookId"
              element={<ReservationQueue />}
            />
            {/* Optional: Route for editing a book */}
            {/* <Route path="/books/edit/:id" element={<EditBook />} /> */}
          </Routes>
        </div>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
