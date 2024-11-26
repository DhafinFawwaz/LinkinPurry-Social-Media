import React from "react";
import { useNavigate } from "react-router-dom";

import LinkinPurry from "../../assets/images/linkinpurry-logo.svg";
import NetworkIcon from "../../assets/images/network-icon.svg";
import NetworkHoverIcon from "../../assets/images/network-hover-icon.svg";
import MessagingIcon from "../../assets/images/message-icon.svg";
import MessagingHoverIcon from "../../assets/images/message-hover-icon.svg";
// import NotificationsIcon from "../../assets/images/notification-icon.svg";
// import NotificationsHoverIcon from "../../assets/images/notification-hover-icon.svg";
import ProfileIcon from "../../assets/images/jobseeker_profile.svg";
import JobsIcon from "../../assets/images/jobs-icon.svg";
import JobsHoverIcon from "../../assets/images/jobs-hover-icon.svg";
import { User } from "../../type";

interface NavbarProps {
    activePage: string;
    user?: User
}

const Navbar: React.FC<NavbarProps> = ({ activePage, user }) => {
    const navigate = useNavigate();

    const tabs = [
        // {
        //   name: "Home",
        //   path: "/",
        //   defaultIcon: ,
        //   activeIcon: ,
        // },
        {
            name: "Feed",
            path: "/",
            defaultIcon: JobsIcon,
            activeIcon: JobsHoverIcon,
        },
        {
            name: "Networks",
            path: "/networks",
            defaultIcon: NetworkIcon,
            activeIcon: NetworkHoverIcon,
        },
        {
            name: "Users",
            path: "/users",
            defaultIcon: NetworkIcon,
            activeIcon: NetworkHoverIcon,
        },
        ...(user
            ? [
                // {
                //   name: "Jobs",
                //   path: "/jobs",
                //   defaultIcon: ,
                //   activeIcon: ,
                // },
                {
                name: "Messaging",
                path: "/chat",
                defaultIcon: MessagingIcon,
                activeIcon: MessagingHoverIcon,
                },
                // {
                //   name: "Notifications",
                //   path: "/notifications",
                //   defaultIcon: NotificationsIcon,
                //   activeIcon: NotificationsHoverIcon,
                // },
                {
                name: "Me",
                path: "/profile/" + user.id,
                defaultIcon: ProfileIcon,
                activeIcon: ProfileIcon,
                },
            ]
        : []),
    ];

    return (
        <nav className="flex items-center justify-between bg-white px-80 fixed top-0 w-full z-20 border-b border-gray-300">
            <div className="flex items-center gap-8">
                <img src={LinkinPurry} alt="LinkinPurry" className="h-10 w-auto" />
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-0">
                    {tabs.map((tab) => (
                    <button
                        key={tab.path}
                        className="flex flex-col pt-1.5 items-center justify-center bg-transparent w-full group hover:bg-gray-100 duration-150"
                        onClick={() => navigate(tab.path)}
                    >
                        <img
                        src={activePage === tab.path ? tab.activeIcon : tab.defaultIcon}
                        alt={tab.name}
                        className={`h-6 w-6 ${
                            tab.name === "Me" ? "rounded-full border-2 border-gray-300" : ""
                        }`}
                        />
                        <span
                        className={`text-xs group-hover:text-black ${
                            activePage === tab.path ? "text-black font-normal" : "text-gray-500"
                        }`}
                        >
                        {tab.name}
                        </span>
                        <div className={`w-full h-[2px] px-12 mt-1 bg-slate-950 duration-150 ${activePage===tab.path ? "scale-x-100" : "scale-x-0"}`}></div>
                    </button>
                    ))}
                </div>
            
                {!user && (
                    <div className="flex items-center gap-4">
                    <div className="text-gray-400">|</div>
                    <button
                        onClick={() => navigate("/register")}
                        className="text-gray-700 hover:text-black font-medium bg-transparent"
                    >
                        Register
                    </button>
                    <button
                        onClick={() => navigate("/login")}
                        className="text-blue_primary border border-blue_primary rounded-full px-4 py-1 hover:bg-blue-100 font-medium bg-transparent"
                    >
                        Login
                    </button>
                    </div>
                )}
            </div>
        </nav>
        );
    };
    
    export default Navbar;
