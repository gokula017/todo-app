import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Header() {

  const [login, setLogin] = useState(localStorage.getItem("login"))
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('login')
    setLogin(null)
    setTimeout(() => {
      navigate("/login")
    }, 0)
  }

  useEffect(() => {
    const handleStorage = () => {
      setLogin(localStorage.getItem("login"))
    }

    window.addEventListener("localStorageChange", handleStorage)
    return () => {
      window.removeEventListener("localStorageChange", handleStorage)
    }
  }, [])
  return (
    <Navbar expand="lg" className="custom-navbar">
      <Container>
        <Navbar.Brand href="/" className='text-white fw-bold'>ToDo App</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {login ?
              <>

                <Nav.Link as={Link} to="/" className='mx-2'>Task List</Nav.Link>
                <Nav.Link as={Link} to="/add" className='mx-2'>Add Task</Nav.Link>
                <Nav.Link as={Button} onClick={handleLogout} className='mx-2'>Logout</Nav.Link>
                {/* <div className='justify-content-center align-items-center d-flex me-5'>
                  <span className='fs-6 small text-white'>Hi {localStorage.getItem('uname')} ! </span>
                </div> */}
                <div className="user-avatar">
                  {localStorage.getItem("uname")?.substring(0, 1).toUpperCase() || "U"}
                </div>
              </>
              :
              location.pathname == '/signup' ?
                <Nav.Link as={Link} to="/login" className='mx-2'>Login</Nav.Link>
                :
                <Nav.Link as={Link} to="/signup" className='mx-2'>Signup</Nav.Link>

            }
          </Nav>
        </Navbar.Collapse>
      </Container>

    </Navbar>
  );
}

export default Header;