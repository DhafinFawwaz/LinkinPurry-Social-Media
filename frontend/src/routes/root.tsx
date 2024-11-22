import { Link } from "react-router-dom"

export default function Root() {

  return (
    <>
      <h1 className="bg-red-500">Root</h1>
      <Link to={"/login"}>Login</Link>
      <Link to={"/register"}>Register</Link>
    </>
  )
}

