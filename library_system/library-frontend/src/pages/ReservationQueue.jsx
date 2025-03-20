import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const ReservationQueue = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();

  // State variables
  const [bookTitle, setBookTitle] = useState("");
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState(null);

  // For searching, sorting, and pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("reserved_at");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReservations = async () => {
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        sort: sortBy,
        page: page,
      });
      const response = await fetch(
        `http://127.0.0.1:8000/api/books/${bookId}/reservations/?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Fetched reservation data:", data);

      // If using DRF pagination, our custom data is in data.results
      if (data.results) {
        setBookTitle(data.results.book_title);
        setReservations(data.results.reservations);
        setTotalPages(Math.ceil(data.count / 10));
      } else {
        setBookTitle(data.book_title || "");
        setReservations(data.reservations || []);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, searchQuery, sortBy, page]);

  // Cancel a reservation
  const handleCancel = async (reservationId) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/reservation/cancel/${reservationId}/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Cancel Error ${res.status}: ${errorText}`);
      }
      await res.json();
      fetchReservations();
    } catch (err) {
      alert("Cancel action failed: " + err.message);
      console.error("Cancel error:", err);
    }
  };

  // Fulfill a reservation
  const handleFulfill = async (reservationId) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/reservation/fulfill/${reservationId}/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Fulfill Error ${res.status}: ${errorText}`);
      }
      await res.json();
      fetchReservations();
    } catch (err) {
      alert("Fulfill action failed: " + err.message);
      console.error("Fulfill error:", err);
    }
  };

  // Export CSV using fetch to include the token
  const handleExport = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/books/${bookId}/reservations/export/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(
          `Export Error ${response.status}: ${response.statusText}`
        );
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "reservations.csv");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Export CSV failed: " + err.message);
      console.error("Export CSV error:", err);
    }
  };

  // Print page
  const handlePrint = () => {
    window.print();
  };

  // Pagination controls
  const renderPagination = () => (
    <div className="d-flex justify-content-center align-items-center mt-3">
      <button
        onClick={() => setPage(page - 1)}
        disabled={page <= 1}
        className="btn btn-secondary mr-2"
      >
        &laquo; Prev
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => setPage(page + 1)}
        disabled={page >= totalPages}
        className="btn btn-secondary ml-2"
      >
        Next &raquo;
      </button>
    </div>
  );

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Reservation Queue for "{bookTitle}"</h2>

      {/* Search and Sort Controls */}
      <div className="row mb-4">
        <div className="col-md-4 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search by username or status"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="col-md-3 mb-2">
          <select
            className="form-control"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
          >
            <option value="reserved_at">Sort by Date</option>
            <option value="user__username">Sort by Username</option>
          </select>
        </div>
        <div className="col-md-5 mb-2 text-right">
          <button onClick={handleExport} className="btn btn-primary mr-2">
            Export CSV
          </button>
          <button onClick={handlePrint} className="btn btn-success">
            Print
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {!error && reservations.length === 0 ? (
        <p>No reservations found for this book.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="thead-light">
              <tr>
                <th>User</th>
                <th>Reserved At</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((res, index) => (
                <tr
                  key={res.id}
                  className={
                    index === 0 && res.status === "pending" ? "table-info" : ""
                  }
                >
                  <td>{res.user_name}</td>
                  <td>{new Date(res.reserved_at).toLocaleString()}</td>
                  <td className="text-capitalize">{res.status}</td>
                  <td>
                    {res.status === "pending" && (
                      <div className="btn-group" role="group">
                        <button
                          onClick={() => handleFulfill(res.id)}
                          className="btn btn-sm btn-success"
                        >
                          Fulfill
                        </button>
                        <button
                          onClick={() => handleCancel(res.id)}
                          className="btn btn-sm btn-danger"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && renderPagination()}
    </div>
  );
};

export default ReservationQueue;
