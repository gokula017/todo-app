import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <Navbar expand="lg" className="custom-navbar">
      <Container>
        <Navbar.Brand href="/" className='text-white fw-bold'>ToDo App</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" className='mx-2'>Task List</Nav.Link>
            <Nav.Link as={Link} to="/add" className='mx-2'>Add Task</Nav.Link>
           </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;