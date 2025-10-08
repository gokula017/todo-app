import { Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <Container className="text-center mt-5 py-5">
      <h1 className="display-4 fw-bold text-danger">404</h1>
      <h3 className="mb-3">Page Not Found</h3>
      <p className="text-muted mb-4">
        The page you’re looking for doesn’t exist or may have been moved.
      </p>
      <Link to="/">
        <Button variant="primary" className="px-4">
          Go Back Home
        </Button>
      </Link>
    </Container>
  );
}

export default NotFound;
