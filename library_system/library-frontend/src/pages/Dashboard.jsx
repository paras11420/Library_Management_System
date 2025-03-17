import React, { useEffect, useState } from "react";
import API from "../api";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/dashboard/")
      .then((response) => {
        console.log("✅ Dashboard response:", response.data);
        setDashboardData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ Error fetching dashboard data:", error);
        if (error.response) {
          setError(
            error.response.data.detail || "Error fetching dashboard data"
          );
        } else if (error.request) {
          setError("Server not responding");
        } else {
          setError("Something went wrong");
        }
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-secondary" role="status"></div>
        <p className="mt-2">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <p className="text-danger fw-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <div className="mb-4 text-center">
        <h2 className="fw-bold">📊 Dashboard Overview</h2>
        <p className="text-muted">Get a quick summary of library stats</p>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <StatCard
          title="Total Books"
          value={dashboardData.total_books}
          bg="light"
          text="dark"
          icon="📚"
        />
        <StatCard
          title="Borrowed Books"
          value={dashboardData.borrowed_books}
          bg="info-subtle"
          text="info"
          icon="📖"
        />
        <StatCard
          title="Overdue Books"
          value={dashboardData.overdue_books}
          bg="warning-subtle"
          text="warning"
          icon="⏰"
        />
      </div>

      {/* Low Availability */}
      <div className="mb-5">
        <h4 className="text-secondary mb-3">⚠️ Low Availability Books</h4>
        {dashboardData.low_availability.length > 0 ? (
          <ul className="list-group">
            {dashboardData.low_availability.map((book) => (
              <li
                key={book.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>
                  <strong>{book.title}</strong> by {book.author}
                </span>
                <span
                  className={`badge ${
                    book.available_copies <= 0 ? "bg-danger" : "bg-secondary"
                  } rounded-pill`}
                >
                  Available: {book.available_copies}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="alert alert-success">
            ✅ All books are sufficiently stocked.
          </div>
        )}
      </div>

      {/* Pending Borrow Requests */}
      <div>
        <h4 className="text-secondary mb-3">📩 Pending Borrow Requests</h4>
        {dashboardData.pending_borrow_requests.length > 0 ? (
          <ul className="list-group">
            {dashboardData.pending_borrow_requests.map((req) => (
              <li
                key={req.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>
                  <strong>{req.book_title}</strong> requested by{" "}
                  <em>{req.user}</em> on{" "}
                  {new Date(req.requested_at).toLocaleString()}
                </span>
                <div>
                  <button
                    className="btn btn-outline-success btn-sm me-2"
                    onClick={() => handleBorrowRequest(req.id, "approve")}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleBorrowRequest(req.id, "reject")}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="alert alert-info">No pending borrow requests.</div>
        )}
      </div>
    </div>
  );
}

// Reusable StatCard component
function StatCard({ title, value, bg, text, icon }) {
  return (
    <div className="col-md-4">
      <div className={`card bg-${bg} text-${text} shadow-sm border-0`}>
        <div className="card-body text-center py-4">
          <h5 className="card-title mb-2">
            {icon} {title}
          </h5>
          <p className="display-6 fw-bold mb-0">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Function to process borrow requests
function handleBorrowRequest(requestId, action) {
  API.put(`/borrow-request/${requestId}/`, { action })
    .then((res) => {
      alert(res.data.message);
      window.location.reload(); // Refresh dashboard to update
    })
    .catch((err) => {
      console.error("Error processing borrow request:", err.response || err);
      alert("Error processing borrow request");
    });
}

export default Dashboard;
