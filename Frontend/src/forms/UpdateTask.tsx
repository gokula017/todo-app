import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';

type Task = {
    title: string,
    description: string
}

function UpdateTask() {
    const [taskData, setTaskData] = useState<Task>({ title: "", description: "" });
    const [message, setMessage] = useState<string>("");
    const [variant, setVariant] = useState<"success" | "danger" | "">("");

    const { id } = useParams<{ id: string }>();

    // const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const singleTask = async () => {
            try {
                const response = await fetch(`task/${id}`);
                const data = await response.json()
                setTaskData(data.result)
            } catch (err) {
                console.error("Error updating task:", err);
                setMessage("Failed to fetch task");
                setVariant("danger");
            }
        }
        singleTask()
    }, [id])

    const handleTaskUpdate = async () => {
        try {

            const response = await fetch(`/task/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(taskData)
            })
            const result = await response.json()

            if (result.success) {
                setMessage("Task updated successfully");
                setVariant("success");

                setTimeout(() => {
                    setMessage('')
                    setVariant('')
                }, 3000);

            } else {
                setMessage("Failed to update task");
                setVariant("danger");
            }
        } catch (err) {
            console.error("Error updating task:", err);
            setMessage("Failed to update task");
            setVariant("danger");
        }

    }
    return (
        <>
            <Container className="mt-5 my-container">
                <Row className="mb-3">
                    <Col>
                        <h1>Update Task</h1>
                    </Col>
                </Row>

                <Form.Group className="mb-4" controlId="addTask.ControlInput1">
                    <Form.Label>Title</Form.Label>
                    <Form.Control type="text" name='title' placeholder="Enter Task" value={taskData.title} onChange={(event) => setTaskData({ ...taskData, title: event.target.value })} />
                </Form.Group>
                <Form.Group className="mb-4" controlId="addTask.ControlTextarea1">
                    <Form.Label>Description</Form.Label>
                    <Form.Control as="textarea" rows={3} name='description' value={taskData.description} onChange={(event) => setTaskData({ ...taskData, description: event.target.value })} />
                </Form.Group>
                <Button className="btn-update" onClick={handleTaskUpdate}>
                    Update
                </Button>
                <Link to="/tasks">
                    <Button className="btn-delete">
                        Go Back
                    </Button>
                </Link>
            </Container>
            <Container className="max-width text-center">
                {message && (
                    <Alert variant={variant} className="mt-3 p-2 px-3 alert-msg">
                        {message}
                    </Alert>
                )}
            </Container>
        </>
    );
}

export default UpdateTask;
