// src/pages/Borrowed.jsx
import React, { useEffect, useState } from "react";
import API from "../api";
import BorrowedBooks from "../components/BorrowedBooks";

function Borrowed() {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBorrowedBooks = () => {
    API.get("/books/borrowed/")
      .then((response) => {
        console.log("Borrowed Books Response:", response.data);
        setBorrowedBooks(response.data.borrowed_books);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching borrowed books:", err.response || err);
        setError("Error fetching borrowed books");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  if (loading) {
    return <div className="container mt-4">Loading borrowed books...</div>;
  }

  if (error) {
    return <div className="container mt-4 text-danger">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h1>Borrowed Books</h1>
      <BorrowedBooks books={borrowedBooks} refreshData={fetchBorrowedBooks} />
    </div>
  );
}

export default Borrowed;
