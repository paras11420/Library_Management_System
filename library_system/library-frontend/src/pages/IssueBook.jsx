// src/pages/IssueBook.jsx
import React, { useEffect, useState } from "react";
import API from "../api";

function IssueBook() {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedBook, setSelectedBook] = useState("");
  const [dueDate, setDueDate] = useState(""); // Format: YYYY-MM-DD
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch all users
    API.get("/users/")
      .then((res) => setUsers(res.data.users || []))
      .catch((err) => {
        console.error("Error fetching users:", err);
        setError("Failed to load users.");
      });

    // Fetch available books
    API.get("/books/")
      .then((res) => {
        // If your backend returns { available_books: [...] }
        // or you might have to handle an array directly
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.available_books || [];
        setBooks(data);
      })
      .catch((err) => {
        console.error("Error fetching books:", err);
        setError("Failed to load books.");
      });
  }, []);

  const handleIssueBook = async () => {
    if (!selectedUser || !selectedBook || !dueDate) {
      setMessage("");
      setError("Please select a user, a book, and a due date.");
      return;
    }

    try {
      // The existing borrow endpoint: /books/<book_id>/borrow/
      const response = await API.post(`/books/${selectedBook}/borrow/`, {
        user_id: selectedUser,
        due_date: dueDate,
      });
      setError("");
      setMessage(response.data.message || "Book issued successfully!");
    } catch (err) {
      console.error("Error issuing book:", err.response || err);
      setMessage("");
      setError(err.response?.data?.message || "Failed to issue the book.");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">Issue a Book</h4>
        </div>
        <div className="card-body">
          {/* Show success or error messages */}
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="form-group mb-3">
            <label className="form-label">User</label>
            <select
              className="form-control"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">-- Select User --</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Book</label>
            <select
              className="form-control"
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
            >
              <option value="">-- Select a Book --</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              className="form-control"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <small className="form-text text-muted">
              Leave blank for default (14 days from now).
            </small>
          </div>

          <div className="d-grid">
            <button className="btn btn-success" onClick={handleIssueBook}>
              Issue Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IssueBook;
