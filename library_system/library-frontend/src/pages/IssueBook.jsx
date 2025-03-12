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

  useEffect(() => {
    // Fetch all users (ensure backend returns { users: [...] })
    API.get("/users/")
      .then((res) => setUsers(res.data.users || []))
      .catch((err) => console.error("Error fetching users:", err));

    // Fetch available books (ensure backend returns { available_books: [...] })
    API.get("/books/")
      .then((res) => setBooks(res.data.available_books || []))
      .catch((err) => console.error("Error fetching books:", err));
  }, []);

  const handleIssueBook = () => {
    if (!selectedUser || !selectedBook || !dueDate) {
      setMessage("Please select a user, a book, and a due date.");
      return;
    }

    // Approach 1: Use the existing borrow endpoint: /books/<book_id>/borrow/
    API.post(`/books/${selectedBook}/borrow/`, {
      user_id: selectedUser,
      due_date: dueDate,
    })
      .then((res) => {
        // The backend returns something like { message, due_date } in the response
        setMessage(res.data.message || "Book issued successfully!");
      })
      .catch((err) => {
        console.error("Error issuing book:", err.response || err);
        setMessage("Failed to issue the book.");
      });
  };

  return (
    <div className="container mt-4">
      <h2>Issue a Book</h2>
      {message && <p>{message}</p>}

      <div className="mb-3">
        <label className="form-label">User</label>
        <select
          className="form-control"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">Select a user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Book</label>
        <select
          className="form-control"
          value={selectedBook}
          onChange={(e) => setSelectedBook(e.target.value)}
        >
          <option value="">Select a book</option>
          {books.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Due Date</label>
        <input
          type="date"
          className="form-control"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <button className="btn btn-primary" onClick={handleIssueBook}>
        Issue Book
      </button>
    </div>
  );
}

export default IssueBook;
