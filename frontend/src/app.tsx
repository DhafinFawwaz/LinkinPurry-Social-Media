import { BrowserRouter, Routes, Route, NavLink, useNavigation, useNavigate, useLocation } from 'react-router-dom'
import Profile from './routes/profile'
import Login from './routes/login'
import Register from './routes/register'
import Chat from './routes/chat'
import SplashScreen from './components/splash-screen'
import useFetchApi from './hooks/useFetchApi'
import { AuthResponse } from './type'
import { useEffect, useState } from 'react'
import { deleteAllCookies } from './utils/cookies'
import Navbar from './components/navigation/Navbar'
import Network from './routes/network'
import Feed from './routes/feed'
import Users from './routes/users'

// [currentPath, redirectPath]]
const protectedRoutes = new Map<string, string>([
    ["/network", "/login"],
]);
const notAuthenticatedRoutes = new Map<string, string>([
    ["/login", "/"],
    ["/register", "/"],
]);

function AuthRouter() {
    const { loading, value, recall } = useFetchApi<AuthResponse>("/api/auth", 300);
    const navigate = useNavigate();
    const location = useLocation();
    
    const isAuthenticated = () => (!loading && value && value.success) ? true : false;

    useEffect(() => {
        if(loading) return;
        if (isAuthenticated()) {
            const redirectNotAuthenticatedPath = notAuthenticatedRoutes.get(location.pathname);
            if (redirectNotAuthenticatedPath) navigate(redirectNotAuthenticatedPath);
        } else {
            const redirectProtectedPath = protectedRoutes.get(location.pathname);
            if (redirectProtectedPath) navigate(redirectProtectedPath);
        }
    }, [loading])

    function logout() {
        deleteAllCookies();
        recall();
    }

    return <>
{loading ? <SplashScreen></SplashScreen> :
isAuthenticated() ? <>

{/* <div className='fixed'>
    <NavLink to={"/"} className={activeClass}>Root</NavLink>
    <NavLink to={"/profile"} className={activeClass}>Profile</NavLink>
    <NavLink to={"/chat"} className={activeClass}>Chat</NavLink>
    <button onClick={logout}>Logout</button>
</div> */}
<Navbar
    activePage={location.pathname}
    isAuthenticated={isAuthenticated()}
    user={value?.body}
/>
<Routes>
    <Route path='/' element={<Feed user={value?.body}/>}></Route>
    <Route path='/profile/:user_id' element={<Profile/>}></Route>
    <Route path='/chat' element={<Chat/>}></Route>
    <Route path='/networks' element={<Network/>}></Route>
    <Route path='/users' element={<Users/>}></Route>
</Routes>

</>
:
<>

{/* <div className='fixed'>
    <NavLink to={"/"} className={activeClass}>Root</NavLink>
    <NavLink to={"/login"} className={activeClass}>Login</NavLink>
    <NavLink to={"/register"} className={activeClass}>Register</NavLink>
</div> */}
<Navbar
    activePage={location.pathname}
    isAuthenticated={isAuthenticated()}
/>
<Routes>
    <Route path='/' element={<Feed/>}></Route>
    <Route path='/login' element={<Login onLogin={recall}/>}></Route>
    <Route path='/register' element={<Register onRegister={recall}/>}></Route>
    <Route path='/users' element={<Users/>}></Route>
</Routes>

</>
}

</>
}

export default function App() {
    return <>
<BrowserRouter>
    <AuthRouter></AuthRouter>
</BrowserRouter>
</>
}