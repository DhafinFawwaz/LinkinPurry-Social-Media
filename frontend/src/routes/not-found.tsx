import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function NotFound() {

    const [is500ms, setIs500ms] = useState(false);
    useEffect(() => {
      setTimeout(() => {
        setIs500ms(true);
      }, 500)
    }, [])

    return <>
    {!is500ms ? <></> :
<section className="sm:bg-background_grey bg-white"> {/* Fallback */}
  <div className="flex min-h-dvh min-h-screen items-center justify-center px-5 mx-auto">
    <div className="w-full flex justify-center">
        <div className="flex flex-col">
            <div className="font-black text-9xl w-full text-center h-28">404</div>
            <div className="font-bold text-4xl w-full text-center">Not Found</div>
            <div className="font-normal text-md w-full text-center">It appears you have gone to the shadow realm. Go to
                <Link className="ml-1 text-blue-600 hover:text-blue-400" to={"/"} >feed</Link> ?
            </div>
        </div>
    </div>    
  </div>    
</section>    
}
</>
}