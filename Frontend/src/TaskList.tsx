import { Container, Row, Col, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

type taskType = {
    _id: unknown,
    title: string,
    description: string,
}

function TaskList() {

    const [tasks, setTasks] = useState<taskType[]>([]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch('http://localhost:1219/tasks');
                const data = await response.json()
                setTasks(data.result)
                console.log('Task found : ', data)
            } catch (err) {
                console.error('Error fetch task : ', err)
            }
        }
        fetchTasks()
    }, [])

    const handleTaskDelete = async (id: unknown) => {
        try {
            const response = await fetch(`http://localhost:1219/task/${id}`, {
                method: "DELETE"
            })
            const data = await response.json()
            console.log("Delete response:", data);
            setTasks(prevTasks => prevTasks.filter(task => task._id !== id))
        } catch (err) {
            console.error("Error deleting task:", err);
        }
    }

    return (
        <Container className="mt-5 my-container">
            <Row>
                <Col>
                    <h1>Task List</h1>
                    {tasks.map((task, index) => (
                        <div className="task-card" key={index}>
                            <div>
                                <div className="task-title">{task.title}</div>
                                <div className="task-description">{task.description}</div>
                            </div>
                            <div>
                                <Link to={`/update/${task._id}`}> <Button className="btn-update">Update</Button></Link>
                                <Button className="btn-delete" onClick={() => handleTaskDelete(task._id)}>Delete</Button>
                            </div>
                        </div>
                    ))}
                </Col>
            </Row>
        </Container >
    );
}

export default TaskList;
