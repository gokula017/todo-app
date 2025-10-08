import { Route, Routes } from 'react-router-dom'
import './index.css'
import Header from './components/Header'
import AddTask from './forms/AddTask'
import TaskList from './components/TaskList'
import UpdateTask from './forms/UpdateTask'
import Login from './forms/Login'
import Signup from './forms/Signup'
import Protected from './components/Protected'
import NotFound from './NotFound'


function App() {

  return (
    <>
      <Header />

      <Routes>
        <Route path='/' element={<Protected><TaskList /></Protected>}></Route>
        <Route path='/tasks' element={<Protected><TaskList /></Protected>}></Route>
        <Route path='/add' element={<Protected><AddTask /></Protected>}></Route>
        <Route path='/update/:id' element={<Protected><UpdateTask /></Protected>}></Route>
        <Route path='/login' element={<Login />}></Route>
        <Route path='/signup' element={<Signup />}></Route>

        <Route path='*' element={<NotFound />}></Route>
      </Routes >
    </>
  )
}

export default App
