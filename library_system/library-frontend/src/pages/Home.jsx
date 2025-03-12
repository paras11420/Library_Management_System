// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="container mt-4 text-center">
      <h1>Welcome to the Library Management System</h1>
      <p>Browse books, borrow them, and manage your account.</p>
      <div className="mt-3">
        <Link to="/books" className="btn btn-primary me-2">
          Browse Books
        </Link>
        <Link to="/register" className="btn btn-secondary">
          Register
        </Link>
      </div>
    </div>
  );
}

export default Home;
