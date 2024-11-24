import { BrowserRouter, Routes, Route, NavLink, useNavigation, useNavigate, useLocation } from 'react-router-dom'
import Root from './routes/root'
import Profile from './routes/profile'
import Login from './routes/login'
import Register from './routes/register'
import Chat from './routes/chat'
import SplashScreen from './components/splash-screen'
import useFetchApi from './hooks/useFetchApi'
import { AuthResponse } from './type'
import { useEffect } from 'react'

const activeClass = ({isActive} : { isActive: boolean }) => isActive ? "bg-red-800" : "";

// [currentPath, redirectPath]
// const protectedRoutes = {
//     "/": "/login",
// };
const protectedRoutes = new Map<string, string>([
    ["/", "/login"],
]);
const notAuthenticatedRoutes = new Map<string, string>([
    ["/login", "/"],
    ["/register", "/"],
]);

function AuthRouter() {
    const { loading, error, value }: {loading: boolean, error: boolean|undefined, value: AuthResponse|undefined } = useFetchApi("/api/auth", 400);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if(loading) return;
        if (value && value.success) {
            const redirectNotAuthenticatedPath = notAuthenticatedRoutes.get(location.pathname);
            if (redirectNotAuthenticatedPath) navigate(redirectNotAuthenticatedPath);
        } else {
            const redirectProtectedPath = protectedRoutes.get(location.pathname);
            if (redirectProtectedPath) navigate(redirectProtectedPath);
        }
    }, [loading])

    return <>
{loading ? <SplashScreen></SplashScreen> :

<>
    <div className='fixed'>
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