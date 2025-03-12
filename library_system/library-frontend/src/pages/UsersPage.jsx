import React, { useEffect, useState } from "react";
import axios from "axios";

function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("No access token found.");
        return;
      }
      try {
        // Expecting backend to return data as: { users: [...] }
        const response = await axios.get("http://localhost:8000/api/users/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="container mt-4">
      <h2>All Registered Users</h2>
      <table className="table table-striped mt-3">
        <thead>
          <tr>
            <th>#</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user, idx) => (
              <tr key={user.id}>
                <td>{idx + 1}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No users found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UsersPage;
