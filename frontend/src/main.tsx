import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Root from "./routes/root"
import Profile from './routes/profile'
import Login from './routes/login'
import Register from './routes/register'
import "./index.css"
import Chat from './routes/chat'

const activeClass = ({isActive} : { isActive: boolean }) => isActive ? "bg-red-800" : "";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <div>
        <NavLink to={"/"} className={activeClass}>Root</NavLink>
        <NavLink to={"/profile"} className={activeClass}>Profile</NavLink>
        <NavLink to={"/login"} className={activeClass}>Login</NavLink>
        <NavLink to={"/register"} className={activeClass}>Register</NavLink>
        <NavLink to={"/chat"} className={activeClass}>Chat</NavLink>
      </div>
      <Routes>
        <Route path='/' element={<Root/>}></Route>
        <Route path='/profile' element={<Profile/>}></Route>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/register' element={<Register/>}></Route>
        <Route path='/chat' element={<Chat/>}></Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
