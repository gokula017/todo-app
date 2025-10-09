import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

type Task = {
    name: string,
    email: string,
    password: string
}

function Signup() {
    const [userData, setUserData] = useState<Task>({ name: "", email: "", password: "" });
    const [message, setMessage] = useState<string>("")
    const [variant, setVariant] = useState<"success" | "danger" | "">("")
    const API_URL = import.meta.env.VITE_API_URL;

    const navigate = useNavigate();

    const handleSignup = async () => {

        const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            body: JSON.stringify(userData),
            headers: { 'Content-Type': 'application/json' },
            credentials: "include"
        });
        const result = await response.json()

        if (result.success) {
            setMessage('Signup completed.')
            document.cookie = "token=" + result.token
            localStorage.setItem("login", userData.email)
            navigate('/')
        } else {
            setMessage('Failed to signup')
            setVariant('danger')
        }
    }

    useEffect(() => {
        if (localStorage.getItem("login")) {
            navigate('/')
        }
    })

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
                        <h1>Signup</h1>
                    </Col>
                </Row>

                <Form.Group className="mb-4" controlId="Signup.ControlInput1">
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="text" name='name' placeholder="Enter your name" value={userData.name} onChange={(event) => setUserData({ ...userData, name: event.target.value })} />
                </Form.Group>
                <Form.Group className="mb-4" controlId="Signup.ControlInput2">
                    <Form.Label>Email Id</Form.Label>
                    <Form.Control type="text" name='email' placeholder="Enter Email Id" value={userData.email} onChange={(event) => setUserData({ ...userData, email: event.target.value })} />
                </Form.Group>
                <Form.Group className="mb-4" controlId="Signup.ControlInput3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" name='password' placeholder="Enter Password" value={userData.password} onChange={(event) => setUserData({ ...userData, password: event.target.value })} />
                </Form.Group>
                {userData.email && userData.password ?
                    <Button className="btn-add" onClick={handleSignup}>
                        Signup
                    </Button>
                    :
                    <Button className="btn-disabled">
                        Signup
                    </Button>
                }

                <div className='mt-4'>
                    Already user?
                    <Link to="/login">
                        <Button className="btn-transparent ">
                            Login
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

export default Signup;
