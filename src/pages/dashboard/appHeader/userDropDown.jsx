import { useState, useRef, useEffect } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { getUserDetails } from "../../../utils/getUserDetails";
import Cookies from 'js-cookie';

import CustomIcons from "../../../components/common/icons/CustomIcons"
import AlertDialog from "../../../components/common/alertDialog/alertDialog";
import PermissionWrapper from "../../../components/common/permissionWrapper/PermissionWrapper";

// Utility function to get initials from a full name
const getInitials = (name) => {
    if (!name) return '';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
        // If only one word, return the first letter (uppercase)
        return words[0].charAt(0).toUpperCase();
    }
    // Otherwise, return first letter of first and last word
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

export default function UserDropdown() {

    const userdata = getUserDetails();
    const navigate = useNavigate();
    const locaiton = useLocation();
    const currentPath = locaiton.pathname;

    const items = [
        {
            label: "Edit Profile",
            path: "/dashboard/profile",
            iconName: "fa-solid fa-circle-user",
        },
        {
            label: "My Team",
            path: "/dashboard/myteam",
            iconName: "fa-solid fa-users",
            permission: {
                functionalityName: "My Team",
                moduleName: "My Team",
                actionId: [4],
            },
        },
        {
            label: "Members",
            path: "/dashboard/members",
            iconName: "fa-solid fa-user-plus",
            permission: {
                functionalityName: "Members",
                moduleName: "Members",
                actionId: [4],
            },
        },
        {
            label: "Sync History",
            path: "/dashboard/syncHistory",
            iconName: "fa-solid fa-clock-rotate-left",
            permission: {
                functionalityName: "Sync History",
                moduleName: "Sync History",
                actionId: [4],
            },
        },
        {
            label: "E-Mail Scraper",
            path: "/dashboard/managemails",
            iconName: "fa-solid fa-envelope",
            permission: {
                functionalityName: "E-Mail Scraper",
                moduleName: "E-Mail Scraper",
                actionId: [1, 2, 3, 4],
            },
        },
        {
            label: "Products & Service",
            path: "/dashboard/products",
            iconName: "fa-solid fa-screwdriver-wrench",
            permission: {
                functionalityName: "Products & Service",
                moduleName: "Products & Service",
                actionId: [4],
            },
        },
        {
            label: "My Calendar",
            path: "/dashboard/calendar",
            iconName: "fa-solid fa-calendar",
        },
        ...(((userdata?.roleName?.toUpperCase() === "SALES REPRESENTIVE" || userdata?.rolename === "Sales Representative" || userdata?.roleName?.toUpperCase() === "SALES MANAGER" || userdata?.roleName?.toUpperCase() === "SALE MANAGER") || !userdata?.subUser)
            ? [
                {
                    label: "My CRM",
                    path: "/dashboard/mycrm",
                    iconName: "fa-solid fa-calendar",
                },
            ]
            : [])
    ];

    const [logOutDialog, setLogOutDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });

    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)

    function toggleDropdown() {
        setIsOpen(!isOpen)
    }

    function closeDropdown() {
        setIsOpen(false)
    }

    const handleLogOut = () => {
        closeDropdown();
        Cookies.remove('authToken');
        navigate('/login');
        localStorage.removeItem("userInfo");
    }

    const handleOpenLogOutDialog = () => {
        setLogOutDialog({ open: true, title: 'Log Out', message: 'Are you sure! Do you want to log out?', actionButtonText: 'yes' });
    }

    const handleCloseLogOutDialog = () => {
        setLogOutDialog({ open: false, title: '', message: '', actionButtonText: '' });
    }

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                closeDropdown()
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    return (
        <div className="relative z-50" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="flex items-center justify-center text-white dropdown-toggle rounded-full w-12 h-12 p-2 bg-[#44288E]"
            >
                <span className="overflow-hidden rounded-full">
                    {getInitials(userdata?.name || userdata?.username)}
                    {/* <CustomIcons iconName="fa-solid fa-circle-user" css={"text-lg text-[#6033A3] h-6 w-6"} /> */}
                </span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-4 flex w-64 flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-lg">
                    {/* User Info */}
                    <div className="pb-3 border-b border-gray-200">
                        <span className="block text-lg font-medium text-gray-700">
                            {userdata?.name ? userdata?.name : userdata?.username}
                        </span>
                        <span className="block mt-1 text-sm text-gray-500">
                            {/* {userdata?.email ? userdata?.email : ""} <br /> */}
                            <span className="capitalize">
                                {userdata?.roleName ? userdata?.roleName?.toLowerCase() : ""}
                            </span>
                        </span>
                    </div>

                    <ul className="flex flex-col gap-1 py-3 border-b border-gray-200">
                        {items
                            // optional filter, if you later add item.show conditions
                            .filter(item => item.show !== false)
                            .map((item) => {
                                const content = (
                                    <li key={item.path}>
                                        <NavLink
                                            to={item.path}
                                            onClick={closeDropdown}
                                            className={`group flex items-center gap-3 px-3 py-2 text-sm font-medium  rounded-lg transition-colors duration-200 ${currentPath === item.path ? "bg-[#44288E] text-white hover:bg-[#44288E] hover:text-white" : "hover:bg-[#44288E] hover:text-white text-gray-700 "}`}
                                        >
                                            <CustomIcons
                                                iconName={item.iconName}
                                                css={`text-lg transition-colors duration-200 ${currentPath === item.path ? "text-white" : "group-hover:text-white text-gray-500"} `}
                                            />
                                            {item.label}
                                        </NavLink>
                                    </li>
                                );

                                // If the item has permission info, wrap it in PermissionWrapper
                                if (item.permission) {
                                    const { functionalityName, moduleName, actionId } = item.permission;
                                    return (
                                        <PermissionWrapper
                                            key={item.path}
                                            functionalityName={functionalityName}
                                            moduleName={moduleName}
                                            actionIds={actionId}
                                            component={content}
                                        />
                                    );
                                }
                                return content;
                            })}
                    </ul>

                    <div
                        onClick={handleOpenLogOutDialog}
                        className="group cursor-pointer flex items-center gap-3 px-3 py-2 mt-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-[#44288E] hover:text-white transition-colors duration-200"
                    >
                        <CustomIcons iconName="fa-solid fa-arrow-right-from-bracket" css={"text-lg text-gray-500 transition-colors duration-200 group-hover:text-white"} />
                        Sign out
                    </div>
                </div>
            )}
            <AlertDialog
                open={logOutDialog.open}
                title={logOutDialog.title}
                message={logOutDialog.message}
                actionButtonText={logOutDialog.actionButtonText}
                handleAction={() => handleLogOut()}
                handleClose={() => handleCloseLogOutDialog()}
            />
        </div>
    )
}