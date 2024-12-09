import { BrowserRouter, Routes, Route, NavLink, useNavigation, useNavigate, useLocation, useParams } from 'react-router-dom'
import Profile from './routes/profile'
import Login from './routes/login'
import Register from './routes/register'
import Chat from './routes/chat'
import SplashScreen from './components/splash-screen'
import useFetchApi, { fetchApi, getApiUrl } from './hooks/useFetchApi'
import { AuthResponse } from './type'
import { useEffect, useState } from 'react'
import { deleteAllCookies } from './utils/cookies'
import Navbar from './components/navigation/Navbar'
import Invitation from './routes/invitation'
import Feed from './routes/feed'
import Users from './routes/users'
import Network from './routes/network'
import { tryRegisterServiceWorker, tryRemoveServiceWorker } from './notification/notification'
import ChatUI from './routes/chat_ui'
import ChatBase from './routes/chat-base'
import Recommendation from './routes/recommendation'
import NotFound from './routes/not-found'
import { toast, ToastContainer, Zoom } from 'react-toastify'

// [currentPath, redirectPath]]
const protectedRoutes = new Map<string, string>([
    ["/network", "/login"],
    ["/chat", "/login"],
    ["/invitation", "/login"],
    ["/recommendation", "/login"],
]);
const notAuthenticatedRoutes = new Map<string, string>([
    ["/login", "/"],
    ["/register", "/"],
]);

function AuthRouter() {
    const { loading, value, recall, setValue } = useFetchApi<AuthResponse>("/api/auth", 300);
    const navigate = useNavigate();
    const location = useLocation();
    
    const isAuthenticated = () => (!loading && value && value.success) ? true : false;
    

    useEffect(() => {
        if(loading) return;
        if (isAuthenticated()) {
            tryRegisterServiceWorker({
                onNotGranted: toast.error
            });
            const redirectNotAuthenticatedPath = notAuthenticatedRoutes.get(location.pathname);
            if (redirectNotAuthenticatedPath) navigate(redirectNotAuthenticatedPath);
        } else {
            const redirectProtectedPath = protectedRoutes.get(location.pathname);
            if (redirectProtectedPath) navigate(redirectProtectedPath);
            else if (location.pathname.match(/\/chat\/\d+/)) { // only this case so lets not put too much effort
                navigate("/login");
            }
        }
    }, [loading])

    async function logout() {
        await tryRemoveServiceWorker();
        // deleteAllCookies(); 
        const res = await fetchApi("/api/logout", { method: "POST" });
        if (!res.ok) {
            alert("Failed to logout");
            return;
        }
        const data = await res.json();
        if (!data.success) {
            alert("Failed to logout");
            return;
        }
        recall();
        navigate('/login');
    }

    return <>
<ToastContainer
  position="bottom-left"
  hideProgressBar={true}
  transition={Zoom}
  autoClose={3000} 
  draggable
/>

{loading ? <SplashScreen></SplashScreen> :
isAuthenticated() ? <>

{/* <div className='fixed'>
    <NavLink to={"/"} className={activeClass}>Root</NavLink>
    <NavLink to={"/profile"} className={activeClass}>Profile</NavLink>
    <NavLink to={"/chat"} className={activeClass}>Chat</NavLink>
    <button onClick={logout}>Logout</button>
</div> */}
<Navbar
    user={value?.body}
/>
<Routes>
    <Route path='/' element={<Feed user={value?.body}/>}></Route>
    <Route path='/profile/:user_id' element={<Profile logout={logout} onProfileEdited={recall}/>}></Route>
    <Route path='/chat' element={<ChatBase/>}></Route>
    <Route path='/chat/:user_id' element={<Chat user={value?.body}/>}></Route>
    <Route path='/invitation' element={<Invitation/>}></Route>
    <Route path='/network' element={<Network/>}></Route>
    <Route path='/users' element={<Users/>}></Route>
    <Route path='/recommendation' element={<Recommendation/>}></Route>
    <Route path='/*' element={<NotFound/>}></Route>
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
    user={value?.body}
/>
<Routes>
    <Route path='/' element={<Feed/>}></Route>
    <Route path='/profile/:user_id' element={<Profile logout={logout} onProfileEdited={recall}/>}></Route>
    <Route path='/login' element={<Login onLogin={recall}/>}></Route>
    <Route path='/register' element={<Register onRegister={recall}/>}></Route>
    <Route path='/users' element={<Users/>}></Route>
    <Route path='/*' element={<NotFound/>}></Route>
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