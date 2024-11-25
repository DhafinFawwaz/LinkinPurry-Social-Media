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

interface NavbarProps {
    activePage: string;
    isAuthenticated: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ activePage, isAuthenticated }) => {
    const navigate = useNavigate();

    const tabs = [
        // {
        //   name: "Home",
        //   path: "/",
        //   defaultIcon: ,
        //   activeIcon: ,
        // },
        {
            name: "Networks",
            path: "/network",
            defaultIcon: NetworkIcon,
            activeIcon: NetworkHoverIcon,
        },
        ...(isAuthenticated
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
                path: "/profile",
                defaultIcon: ProfileIcon,
                activeIcon: ProfileIcon,
                },
            ]
        : []),
    ];

    return (
        <nav className="flex items-center justify-between bg-white py-2 px-80 fixed top-0 w-full z-50 border-b border-gray-300">
            <div className="flex items-center gap-8">
                <img src={LinkinPurry} alt="LinkinPurry" className="h-10 w-auto" />
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-6">
                    {tabs.map((tab) => (
                    <button
                        key={tab.path}
                        className="flex flex-col items-center justify-center bg-transparent"
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
                        className={`text-xs ${
                            activePage === tab.path ? "text-black font-normal" : "text-gray-500"
                        }`}
                        >
                        {tab.name}
                        </span>
                    </button>
                    ))}
                </div>
            
                {!isAuthenticated && (
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
