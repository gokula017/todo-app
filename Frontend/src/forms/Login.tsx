import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

type loginData = {
    email: string,
    password: string
}

function Login() {
    const [userData, setUserData] = useState<loginData>({ email: "", password: "" });
    const [message, setMessage] = useState<string>("")
    const [variant, setVariant] = useState<"success" | "danger" | "">("")

    const API_URL = import.meta.env.VITE_API_URL;

    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            body: JSON.stringify(userData),
            headers: { 'Content-Type': 'application/json' },
            credentials: "include"
        });
        const result = await response.json()

        if (result.success) {
            setMessage('You are logged in.')
            setVariant('success')

            //document.cookie = "token=" + result.token;
            localStorage.setItem("login", userData.email)
            localStorage.setItem("uname", result.uname)
            window.dispatchEvent(new Event('localStorageChange'))
            navigate('/')

        } else {
            setMessage('Failed to login')
            setVariant('danger')
        }
    }

    useEffect(() => {
        if (localStorage.getItem("login")) {
            navigate('/')
        }
    }, [navigate])

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('')
                setVariant('')
            }, 3000);

            return () => clearTimeout(timer)
        }
    }, [message])


    return (
        <>
            <Container className="mt-5 my-container form-container">
                <Row className="mb-3">
                    <Col>
                        <h1>Login</h1>
                    </Col>
                </Row>

                <Form onSubmit={handleLogin}>
                    <Form.Group className="mb-4" controlId="Login.ControlInput1">
                        <Form.Label>Email Id</Form.Label>
                        <Form.Control type="text" name='email' placeholder="Enter Email Id" value={userData.email} onChange={(event) => setUserData({ ...userData, email: event.target.value })} />
                    </Form.Group>
                    <Form.Group className="mb-4" controlId="Login.ControlInput2">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" name='password' placeholder="Enter Password" value={userData.password} onChange={(event) => setUserData({ ...userData, password: event.target.value })} />
                    </Form.Group>
                    <Button
                        type="submit"
                        className="btn-add"
                        disabled={!userData.email || !userData.password}
                    >
                        Login
                    </Button>
                </Form>
                <div className='mt-4'>
                    Not an user?
                    <Link to="/signup">
                        <Button className="btn-transparent">
                            Signup
                        </Button>
                    </Link>
                </div>
            </Container>
            <Container className='form-container text-center'>
                {message && <Alert variant={variant} className='mt-3 p-2 px-3 alert-msg'>{message}</Alert>}
            </Container>
        </>
    );
}

export default Login;
