import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';

type Task = {
  title: string,
  description: string
}

function AddTask() {
  const [taskData, setTaskData] = useState<Task>({ title: "", description: "" });
  const [message, setMessage] = useState<string>("")
  const [variant, setVariant] = useState<"success" | "danger" | "">("")

  const API_URL = import.meta.env.VITE_API_URL;

  const handleAddTask = async () => {

    const response = await fetch(`${API_URL}/add`, {
      method: 'POST',
      body: JSON.stringify(taskData),
      headers: { 'Content-Type': 'Application/JSON' }
      ,
      credentials: 'include'
    });
    const result = await response.json()

    if (result.success) {
      if (taskData.title != '' && taskData.description != '') {
        console.log(taskData);
        console.log('New task added');
        setMessage('New task added')
        setTaskData({ title: "", description: "" })
        setVariant('success')
      } else {
        setMessage('All fields are mandatory.')
        setVariant('danger')
      }
    }
  }

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
            <h1>New Task</h1>
          </Col>
        </Row>

        <Form.Group className="mb-4" controlId="addTask.ControlInput1">
          <Form.Label>Title</Form.Label>
          <Form.Control type="text" name='title' placeholder="Enter Task" value={taskData.title} onChange={(event) => setTaskData({ ...taskData, title: event.target.value })} />
        </Form.Group>
        <Form.Group className="mb-4" controlId="addTask.ControlTextarea1">
          <Form.Label>Description</Form.Label>
          <Form.Control as="textarea" rows={3} name='description' placeholder='Task Description' value={taskData.description} onChange={(event) => setTaskData({ ...taskData, description: event.target.value })} />
        </Form.Group>
        {
          taskData.title && taskData.description ?
            <Button className="btn-add" onClick={handleAddTask}>
              Add Task
            </Button>
            :
            <Button className="btn-disabled">
              Add Task
            </Button>

        }
      </Container>
      <Container className='form-container text-center'>
        {message && <Alert variant={variant} className='mt-3 p-2 px-3 alert-msg'>{message}</Alert>}
      </Container>
    </>
  );
}

export default AddTask;
