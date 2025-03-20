import React from "react";
import { Button, Card, Row, Col, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom"; // 👈 NEW
import {
  borrowBook,
  reserveBook,
  deleteBook,
} from "../../src/services/bookService";
import API from "../../src/api";

function BookList({ books, role }) {
  const isLibrarian = role === "librarian" || role === "admin";
  const isMember = role === "member";
  const navigate = useNavigate(); // 👈 NEW

  const getEstimatedWaitTime = (book) => {
    return "7 days"; // Placeholder logic
  };

  const handleDelete = (bookId) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      deleteBook(bookId)
        .then(() => {
          alert("Book deleted successfully!");
        })
        .catch((err) => {
          console.error("Delete error:", err.response || err);
          alert("Error deleting the book.");
        });
    }
  };

  const handleEdit = (bookId) => {
    alert("Redirect to Edit Book page for book ID: " + bookId);
  };

  const handleBorrowRequest = (bookId) => {
    API.post(`/books/${bookId}/borrow-request/`)
      .then((res) => {
        alert(res.data.message);
      })
      .catch((err) => {
        console.error("Borrow request error:", err.response || err);
        alert(err.response?.data?.message || "Error submitting borrow request");
      });
  };

  return (
    <Row className="gy-3">
      {books.map((book) => {
        const isAvailable = book.available_copies > 0;

        return (
          <Col md={4} key={book.id}>
            <Card>
              {book.cover_image && (
                <Card.Img
                  variant="top"
                  src={`http://localhost:8000${book.cover_image}`}
                  alt={book.title}
                  style={{ height: "200px", objectFit: "cover" }}
                />
              )}
              <Card.Body>
                <Card.Title>{book.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {book.author}
                </Card.Subtitle>

                <Card.Text>
                  <strong>ISBN:</strong> {book.isbn}
                </Card.Text>
                <Card.Text>
                  <strong>Copies Available:</strong>{" "}
                  <Badge bg="secondary">{book.available_copies}</Badge>
                </Card.Text>

                <Card.Text>
                  <strong>Status:</strong>{" "}
                  {isAvailable ? (
                    <Badge bg="success">Available</Badge>
                  ) : (
                    <Badge bg="danger">Not Available</Badge>
                  )}
                </Card.Text>

                {!isAvailable && (
                  <Card.Text>
                    <strong>Estimated Wait Time:</strong>{" "}
                    {getEstimatedWaitTime(book)}
                  </Card.Text>
                )}

                <div className="d-flex flex-wrap gap-2">
                  {/* 👤 Member: Request Borrow */}
                  {isMember && isAvailable && (
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleBorrowRequest(book.id)}
                    >
                      Request Borrow
                    </Button>
                  )}

                  {/* 👤 Member: Reserve if not available */}
                  {isMember && !isAvailable && (
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => {
                        reserveBook(book.id)
                          .then((res) => alert(res.data.message))
                          .catch((err) => {
                            console.error(
                              "Reserve error:",
                              err.response || err
                            );
                            alert("Error reserving the book");
                          });
                      }}
                    >
                      Reserve
                    </Button>
                  )}

                  {/* 👤 Member only: Contact Librarian */}
                  {isMember && (
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() =>
                        (window.location.href =
                          "mailto:paras11420@gmail.com?subject=Assistance%20with%20Book%20Inquiry")
                      }
                    >
                      Contact Librarian
                    </Button>
                  )}

                  {/* 👨‍💼 Librarian/Admin: View Reservations */}
                  {isLibrarian && (
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => navigate(`/reservations/${book.id}`)} // 👈 UPDATED
                    >
                      View Reservations
                    </Button>
                  )}

                  {/* 👨‍💼 Librarian/Admin: Edit & Delete */}
                  {isLibrarian && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEdit(book.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(book.id)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}

export default BookList;
