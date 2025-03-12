// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import API from "../api";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/dashboard/")
      .then((response) => {
        console.log("Dashboard response:", response.data);
        setDashboardData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(
          "Error fetching dashboard data:",
          error.response || error
        );
        setError("Error fetching dashboard data");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container mt-4">
        <p>Loading dashboard data...</p>
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
      <h1>Dashboard</h1>
      <p>Total Books: {dashboardData.total_books}</p>
      <p>Borrowed Books: {dashboardData.borrowed_books}</p>
      <p>Overdue Books: {dashboardData.overdue_books}</p>
      <h2>Most Borrowed Books:</h2>
      <ul className="list-group">
        {dashboardData.most_borrowed_books.map((book) => (
          <li key={book.id} className="list-group-item">
            {book.title} by {book.author}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
