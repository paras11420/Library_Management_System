// src/pages/Books.jsx
import React, { useEffect, useState } from "react";
import API from "../api";
import { borrowBook, reserveBook } from "../services/bookService";
import SearchBar from "../components/SearchBar";

function Books() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/books/")
      .then((response) => {
        console.log("Books API response:", response.data);
        // Check if response.data is an array or an object with an 'available_books' key.
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.available_books || [];
        setBooks(data);
        setFilteredBooks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching books:", err.response || err);
        setError("Error fetching books");
        setLoading(false);
      });
  }, []);

  const handleSearch = (query) => {
    const filtered = books.filter((book) =>
      book.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredBooks(filtered);
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <p>Loading books...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1>Available Books</h1>
      <SearchBar onSearch={handleSearch} />
      {filteredBooks.length > 0 ? (
        <ul className="list-group">
          {filteredBooks.map((book) => (
            <li
              key={book.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              {book.title} –{" "}
              <span className="badge bg-secondary">
                {book.available_copies} copies
              </span>
              <div>
                <button
                  className="btn btn-success me-2 btn-sm"
                  onClick={() => {
                    borrowBook(book.id)
                      .then((res) => alert(res.data.message))
                      .catch((err) => {
                        console.error("Borrow error:", err.response || err);
                        alert("Error borrowing the book");
                      });
                  }}
                >
                  Borrow
                </button>
                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => {
                    reserveBook(book.id)
                      .then((res) => alert(res.data.message))
                      .catch((err) => {
                        console.error("Reserve error:", err.response || err);
                        alert("Error reserving the book");
                      });
                  }}
                >
                  Reserve
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No books found.</p>
      )}
    </div>
  );
}

export default Books;
