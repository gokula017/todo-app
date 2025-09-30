import { Route, Routes } from 'react-router-dom'
import './index.css'
import Header from './components/Header'
import AddTask from './forms/AddTask'
import TaskList from './TaskList'
import UpdateTask from './forms/UpdateTask'

function App() {

  return (
    <>
      <Header />

      <Routes>
        <Route path='/' element={<TaskList />}></Route>
        <Route path='/tasks' element={<TaskList />}></Route>
        <Route path='/add' element={<AddTask />}></Route>
        <Route path='/update/:id' element={<UpdateTask />}></Route>
      </Routes>
    </>
  )
}

export default App
