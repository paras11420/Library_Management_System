import React, { useEffect, useState } from "react";
import BookList from "../components/BookList";
import SearchBar from "../components/SearchBar";
import API from "../api";

function Books() {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/books/")
      .then((response) => {
        // Expecting response.data.available_books to be an array
        setBooks(response.data.available_books);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching books:", err);
        setError("Error fetching books");
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1>Books</h1>
      <SearchBar
        onSearch={(query) => {
          /* implement search if needed */
        }}
      />
      {loading && <p>Loading books...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && !error && <BookList books={books} />}
    </div>
  );
}

export default Books;
