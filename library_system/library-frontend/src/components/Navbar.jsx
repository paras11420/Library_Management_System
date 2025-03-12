import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";

function NavigationBar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role") || "";

  useEffect(() => {
    console.log("User role from localStorage:", role);
  }, [role]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const isLibrarian = role.toLowerCase() === "librarian";
  const isAdmin = role.toLowerCase() === "admin";

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Library
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/books">
              Books
            </Nav.Link>
            <Nav.Link as={Link} to="/borrowed">
              Borrowed
            </Nav.Link>
            {(isLibrarian || isAdmin) && (
              <>
                <Nav.Link as={Link} to="/dashboard">
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/users">
                  Users
                </Nav.Link>
                <Nav.Link as={Link} to="/issue-book">
                  Issue Book
                </Nav.Link>
              </>
            )}
            {token ? (
              <Button
                variant="danger"
                size="sm"
                onClick={handleLogout}
                className="ms-2"
              >
                Logout
              </Button>
            ) : (
              <Nav.Link as={Link} to="/login" className="ms-2">
                Login
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;
