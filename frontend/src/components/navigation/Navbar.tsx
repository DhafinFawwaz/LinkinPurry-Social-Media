import React from "react";
import { NavLink } from "react-router-dom";

import LinkinPurry from "../../assets/images/linkinpurry-logo.svg";
import NetworkIcon from "../../assets/images/network-icon.svg";
import NetworkHoverIcon from "../../assets/images/network-hover-icon.svg";
import MessagingIcon from "../../assets/images/message-icon.svg";
import MessagingHoverIcon from "../../assets/images/message-hover-icon.svg";
import ProfileIcon from "../../assets/images/jobseeker_profile.svg";
import HomeIcon from "../../assets/images/home_icon.svg";
import HomeHoverIcon from "../../assets/images/home_icon_hover.svg";
import UsersIcon from "../../assets/images/users.svg";
import UsersHoverIcon from "../../assets/images/users-hover.svg";
import ConnectIcon from "../../assets/images/connect.svg";
import ConnectHoverIcon from "../../assets/images/connect-hover.svg";
import { User } from "../../type";

interface NavbarProps {
    user?: User;
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
    const tabs = [
        {
            name: "Feed",
            path: "/",
            defaultIcon: HomeIcon,
            activeIcon: HomeHoverIcon,
        },
        {
            name: "Users",
            path: "/users",
            defaultIcon: UsersIcon,
            activeIcon: UsersHoverIcon,
        },
        ...(user
            ? [
                {
                    name: "Invitation",
                    path: "/invitation",
                    defaultIcon: ConnectIcon,
                    activeIcon: ConnectHoverIcon,
                },
                {
                    name: "Network",
                    path: "/network",
                    defaultIcon: NetworkIcon,
                    activeIcon: NetworkHoverIcon,
                },
                {
                    name: "Messaging",
                    path: "/chat",
                    defaultIcon: MessagingIcon,
                    activeIcon: MessagingHoverIcon,
                },
                {
                    name: "Me",
                    path: `/profile/${user.id}`,
                    defaultIcon: ProfileIcon,
                    activeIcon: ProfileIcon,
                },
            ]
            : []),
    ];

    // For mobile separation purpose
    const profileTab = tabs.find((tab) => tab.name === "Me");
    const otherTabs = tabs.filter((tab) => tab.name !== "Me");

    return (
        <>  
            {/* For mobile, move login-register tab to top of the screen */}
            {!user && (
                <nav className="flex justify-between bg-white fixed top-0 left-0 py-2 px-4 border-b border-gray-300 z-30 w-full sm:hidden">
                    <div className="flex items-center gap-8">
                        <img src={LinkinPurry} alt="LinkinPurry" className="h-10 w-auto" />
                    </div>
                    <div className="flex items-center gap-4">
                        <NavLink
                            to="/register"
                            className="text-gray-700 hover:text-black font-medium bg-transparent"
                        >
                            Register
                        </NavLink>
                        <NavLink
                            to="/login"
                            className="text-blue_primary border border-blue_primary rounded-full px-4 py-1 hover:bg-blue-100 font-medium bg-transparent"
                        >
                            Login
                        </NavLink>
                    </div>
                </nav>
                )}

            {/* For mobile, move profile tab to top of the screen */}
            {profileTab && (
                <nav className="flex justify-between bg-white fixed top-0 left-0 py-3 px-4 border-b border-gray-300 z-30 w-full sm:hidden">
                    <div className="flex items-center gap-8">
                        <img src={LinkinPurry} alt="LinkinPurry" className="h-10 w-auto" />
                    </div>
                    <NavLink
                        to={profileTab.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center bg-transparent group hover:bg-gray-100 duration-150 ${
                                isActive ? "text-black font-medium" : "text-gray-500"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <img
                                    src={isActive ? profileTab.activeIcon : profileTab.defaultIcon}
                                    alt={profileTab.name}
                                    className="h-8 w-8 rounded-full border-2 border-gray-300"
                                />
                                <span
                                    className={`text-xs group-hover:text-black ${
                                        isActive ? "text-black font-normal" : "text-gray-500"
                                    }`}
                                >
                                </span>
                            </>
                        )}
                    </NavLink>
                </nav>
            )}

            {/* For mobile, move other Navbar to bottom of the screen */}
            <nav className="flex bg-white fixed bottom-0 w-full border-t border-gray-300 z-20 py-2 sm:hidden">
                <div className="flex justify-around items-center w-full">
                    {otherTabs.map((tab) => (
                        <NavLink
                            key={tab.path}
                            to={tab.path}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center bg-transparent group hover:bg-gray-100 duration-150 ${
                                    isActive ? "text-black font-medium" : "text-gray-500"
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <img
                                        src={isActive ? tab.activeIcon : tab.defaultIcon}
                                        alt={tab.name}
                                        className="h-6 w-6"
                                    />
                                    <span
                                        className={`text-xs group-hover:text-black ${
                                            isActive ? "text-black font-normal" : "text-gray-500"
                                        }`}
                                    >
                                        {tab.name}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* Default Full Navbar for larger size */}
            <nav className="hidden sm:flex justify-center w-full bg-white fixed top-0 border-b border-gray-300 z-20">
                <div className="flex items-center justify-between bg-white top-0 w-full px-4 sm:px-8 sm:max-w-4xl">
                    <div className="flex items-center gap-8">
                        <img src={LinkinPurry} alt="LinkinPurry" className="h-10 w-auto" />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-0">
                            {tabs.map((tab) => (
                                <NavLink
                                    key={tab.path}
                                    to={tab.path}
                                    className={({ isActive }) =>
                                        `flex flex-col pt-1.5 items-center justify-center bg-transparent w-full group hover:bg-gray-100 duration-150 ${
                                            isActive ? "text-black font-medium" : "text-gray-500"
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <img
                                                src={isActive ? tab.activeIcon : tab.defaultIcon}
                                                alt={tab.name}
                                                className={`h-6 w-6 ${
                                                    tab.name === "Me"
                                                        ? "rounded-full border-2 border-gray-300"
                                                        : ""
                                                }`}
                                            />
                                            <span
                                                className={`text-xs group-hover:text-black ${
                                                    isActive ? "text-black font-normal" : "text-gray-500"
                                                }`}
                                            >
                                                {tab.name}
                                            </span>
                                            <div
                                                className={`w-full h-[2px] px-12 mt-1 bg-slate-950 duration-150 ${
                                                    isActive ? "scale-x-100" : "scale-x-0"
                                                }`}
                                            ></div>
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>

                        {!user && (
                            <div className="flex items-center gap-4">
                                <div className="text-gray-400">|</div>
                                <NavLink
                                    to="/register"
                                    className="text-gray-700 hover:text-black font-medium bg-transparent"
                                >
                                    Register
                                </NavLink>
                                <NavLink
                                    to="/login"
                                    className="text-blue_primary border border-blue_primary rounded-full px-4 py-1 hover:bg-blue-100 font-medium bg-transparent"
                                >
                                    Login
                                </NavLink>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
