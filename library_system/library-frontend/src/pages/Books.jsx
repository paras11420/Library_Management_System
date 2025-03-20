// src/pages/Books.jsx
import React, { useEffect, useState } from "react";
import API from "../api";
import SearchBar from "../components/SearchBar.jsx";
import BookList from "../components/BookList.jsx";
import BookForm from "../components/BookForm.jsx";
import { toast } from "react-toastify";

function Books() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);

  const [showForm, setShowForm] = useState(false);
  const role = localStorage.getItem("role")?.toLowerCase() || "member";

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = () => {
    setLoading(true);
    API.get("/books/")
      .then((response) => {
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
  };

  const handleSearch = (query) => {
    const filtered = books.filter((book) =>
      book.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredBooks(filtered);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  const handleAddBook = async (form) => {
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("author", form.author);
    formData.append("isbn", form.isbn);
    formData.append("total_quantity", form.quantity); // Backend expects total_quantity
    if (form.cover_image) {
      formData.append("cover_image", form.cover_image);
    }

    try {
      await API.post("/books/", formData);
      toast.success("Book added successfully!");
      setShowForm(false);
      fetchBooks(); // Refresh book list
    } catch (err) {
      console.error("Failed to add book:", err);
      toast.error("Failed to add book!");
    }
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

      {/* Add Book Button - Visible only to Admin or Librarian */}
      {(role === "admin" || role === "librarian") && (
        <div className="mb-3">
          <button
            className="btn btn-success"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "Add New Book"}
          </button>
        </div>
      )}

      {/* Book Form (Hidden/Shown based on toggle) */}
      {showForm && <BookForm onSubmit={handleAddBook} />}

      <SearchBar onSearch={handleSearch} />

      {filteredBooks.length > 0 ? (
        <>
          <BookList books={filteredBooks.slice(0, visibleCount)} role={role} />
          {visibleCount < filteredBooks.length && (
            <button className="btn btn-secondary mt-3" onClick={handleLoadMore}>
              Load More
            </button>
          )}
        </>
      ) : (
        <p>No books found.</p>
      )}
    </div>
  );
}

export default Books;
