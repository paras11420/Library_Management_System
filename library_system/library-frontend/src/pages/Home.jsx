import React from "react";
import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";

function Home() {
  return (
    <Container
      fluid
      className="text-center"
      style={{
        backgroundImage: "url('bg.jpg')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
      {/* A wrapper to push content away from the top */}
      <div
        className="pt-5 text-white"
        style={{
          textShadow: "2px 2px 4px rgba(0,0,0,0.8)", // subtle shadow
        }}
      >
        <h1 className="display-5 fw-bold mb-3">
          Welcome to the Library Management System
        </h1>
        <p className="lead mb-4">
          Browse books, borrow them, and manage your account.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Link to="/books" className="btn btn-primary px-4 py-2">
            Browse Books
          </Link>
          <Link to="/register" className="btn btn-warning text-dark px-4 py-2">
            Register
          </Link>
        </div>
      </div>
    </Container>
  );
}

export default Home;
