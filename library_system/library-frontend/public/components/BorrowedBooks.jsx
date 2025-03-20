// src/components/BorrowedBooks.jsx
import React, { useState } from "react";
import { Table, Button } from "react-bootstrap";
import { returnBook } from "../services/bookService";

function BorrowedBooks({ books, refreshData }) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter the books based on search query
  const filteredBooks = books.filter((record) => {
    const query = searchQuery.toLowerCase();
    return (
      record.book_title.toLowerCase().includes(query) ||
      record.user_name.toLowerCase().includes(query)
    );
  });

  const handleReturn = (borrowedBookId) => {
    console.log("Returning BorrowedBook with ID:", borrowedBookId);
    returnBook(borrowedBookId)
      .then((res) => {
        alert(res.data.message);
        refreshData(); // Refresh the list after returning
      })
      .catch((err) => {
        console.error("Return error:", err.response || err);
        alert("Error returning the book");
      });
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by book title or borrower..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Book Title</th>
            <th>Borrowed By</th>
            <th>Due Date</th>
            <th>Current Fine</th> {/* Real-time fine from serializer */}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredBooks.map((record) => (
            <tr key={record.id}>
              <td>{record.id}</td>
              <td>{record.book_title}</td>
              <td>{record.user_name}</td>
              <td>{new Date(record.due_date).toLocaleDateString()}</td>
              <td>{record.current_fine}</td> {/* Displays real-time fine */}
              <td>
                {!record.returned_at && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleReturn(record.id)}
                  >
                    Return Book
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default BorrowedBooks;
