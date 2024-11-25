import { BrowserRouter, Routes, Route, NavLink, useNavigation, useNavigate, useLocation } from 'react-router-dom'
import Root from './routes/root'
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

// [currentPath, redirectPath]]
const protectedRoutes = new Map<string, string>([
    ["/", "/login"],
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
/>
<Routes>
    <Route path='/' element={<Root/>}></Route>
    <Route path='/profile' element={<Profile/>}></Route>
    <Route path='/chat' element={<Chat/>}></Route>
    <Route path='/networks' element={<Network/>}></Route>
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
    <Route path='/' element={<Root/>}></Route>
    <Route path='/login' element={<Login onLogin={recall}/>}></Route>
    <Route path='/register' element={<Register onRegister={recall}/>}></Route>
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