import { Link } from "react-router-dom"

export default function Register() {
    return <>
        <h1>Register</h1>
        <Link to={"/login"}>Login</Link>
    </>
}