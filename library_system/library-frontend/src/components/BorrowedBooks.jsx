// src/components/BorrowedBooks.jsx
import React from "react";
import { Table, Button } from "react-bootstrap";
import { returnBook } from "../services/bookService";

function BorrowedBooks({ books, refreshData }) {
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
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>ID</th>
          <th>Book Title</th>
          <th>Borrowed By</th>
          <th>Due Date</th>
          <th>Fine</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {books.map((record) => (
          <tr key={record.id}>
            <td>{record.id}</td>
            <td>{record.book_title}</td>
            <td>{record.user_name}</td>
            <td>{new Date(record.due_date).toLocaleDateString()}</td>
            <td>{record.returned_at ? record.fine_amount : "-"}</td>
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
  );
}

export default BorrowedBooks;
