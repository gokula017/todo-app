import { Container, Row, Col, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

type taskType = {
    _id: unknown,
    title: string,
    description: string,
    uname: string
}

function TaskList() {

    const [tasks, setTasks] = useState<taskType[]>([]);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchTasks()
    }, [])

    const fetchTasks = async () => {
        try {
            const response = await fetch(`${API_URL}/tasks`, { credentials: "include" });
            const data = await response.json()
            console.log(data.userName); // logged-in user's name
            console.log(data.result);   // task
            setTasks(Array.isArray(data.result) ? data.result : []);

        } catch (err) {
            console.error("Error fetch task : " + err)
        }
    }

    const handleTaskDelete = async (id: unknown) => {
        try {
            const response = await fetch(`${API_URL}/task/${id}`, {
                method: "DELETE",
                credentials: "include"
            })
            const data = await response.json()
            console.log("Delete response:", data);
            if (data.success) {
                setTasks(prevTasks => prevTasks.filter(task => task._id !== id))
            }
        } catch (err) {
            console.error("Error deleting task:", err);
        }
    }

    return (
        <Container className="mt-5 my-container">
            <Row>
                <Col>
                    <h1>All Task </h1>
                    {Array.isArray(tasks) && tasks.length > 0 ? (

                        tasks.map((task, index) => (
                            <div className="task-card" key={index}>
                                <div>
                                    <div className="task-title">{task?.title}</div>
                                    <div className="task-description">{task?.description}</div>

                                    {/* <div className="text-muted mt-3"><small> 
                                        Added by {task?.uname || "Unknown"}
                                        </small></div> */}
                                </div>
                                <div>
                                    <Link to={`/update/${task._id}`}> <Button className="btn-update">Update</Button></Link>
                                    <Button className="btn-delete" onClick={() => handleTaskDelete(task._id)}>Delete</Button>
                                </div>
                            </div>
                        )))
                        : (
                            <p>No tasks found.</p>
                        )}
                </Col>
            </Row>
        </Container >
    );
}

export default TaskList;
