import { MouseEvent, useEffect, useRef } from "react";

export default function useOutsideClick(callback: (e: React.MouseEvent<HTMLElement>) => void) {
    const ref = useRef();
  
    useEffect(() => {
      const handleClick = (event: any) => {
        if (ref.current && !(ref.current as any).contains(event.target)) {
          callback(event);
        }
      };
  
      document.addEventListener('click', handleClick, true);
  
      return () => {
        document.removeEventListener('click', handleClick, true);
      };
    }, [ref]);
  
    return ref;
  };