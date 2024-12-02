import CloseIcon from "../assets/images/close-icon.svg";

type PopUpProps = {
    children: React.ReactNode;
    open: boolean;
    title: string;
    onClose?: (e: React.MouseEvent<HTMLElement>) => void;
    className?: string;
  };
  
  export default function PopUp({children, title, open, onClose, className=""}: PopUpProps) {
    return <>
      <button onClick={onClose} className={`fixed inset-0 bg-black bg-opacity-50 z-30 duration-200 ${open ? "opacity-100 visible" : "opacity-0 invisible"}`}></button>
      <div className={`fixed inset-0 pointer-events-none flex justify-center items-center z-30 duration-200 ease-out-expo ${open ? "scale-100 visible" : "scale-75 opacity-0 invisible"}`}>
        <div className={"bg-slate-100 rounded-xl pointer-events-auto p-4 mx-2 w-full max-w-96 " + className}>
          <div className="flex justify-between">
  
            <div className="flex justify-between items-center w-8"></div>
            <div className="text-2xl mt-1 font-extrabold self-center mx-4">{title}</div>
            <div className="flex justify-end items-center">
              <button onClick={onClose} className="bg-slate-50 pointer-events-auto hover:bg-slate-300 w-8 h-8 rounded-xl flex justify-center items-center">
                <img src={CloseIcon} alt="" width={20} height={20}/>
              </button>
            </div>
  
          </div>
          <div>
            {children}
          </div>
        </div>
      </div>
    </>
  }