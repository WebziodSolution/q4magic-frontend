import { useCallback, useEffect, useRef, useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { connect } from "react-redux"
import {
    setIsHovered,
    toggleSidebar,
    toggleMobileSidebar,
    setActiveItem,
    toggleSubmenu
} from "../../../redux/commonReducers/commonReducers"

import CustomIcons from "../../../components/common/icons/CustomIcons"
import { getSalesforceUserDetails, getUserDetails } from "../../../utils/getUserDetails"


const Sidebar = ({
    isExpanded,
    isMobileOpen,
    isHovered,
    openSubmenu,
    setIsHovered,
    toggleSubmenu,
    toggleMobileSidebar
}) => {
    const userDetails = getUserDetails();
    const [navItems, setNavItems] = useState([]);

    const location = useLocation()
    const [subMenuHeight, setSubMenuHeight] = useState({})
    const subMenuRefs = useRef({})

    const isActive = useCallback(path => location.pathname === path, [
        location.pathname
    ])
    const handleSetNavItems = () => {
        setNavItems([
            {
                icon: <CustomIcons iconName="fa-solid fa-circle" />,
                name: "Pipeline",
                path: "/dashboard/opportunities",
                pro: false,
                // subItems: [
                //     // { name: "Accounts", path: "/dashboard/accounts", pro: false },
                //     { name: "Opportunities", path: "/dashboard/opportunities", pro: false },
                //     { name: "Contacts", path: "/dashboard/contacts", pro: false }
                // ]
            },
            {
                icon: <CustomIcons iconName="fa-solid fa-circle" />,
                name: "Performance",
                path: "/dashboard/performance",
                pro: false
            },
            {
                icon: <CustomIcons iconName="fa-solid fa-circle" />,
                name: "Contacts",
                path: "/dashboard/contacts",
                pro: false
            },
            {
                icon: <CustomIcons iconName="fa-solid fa-circle" />,
                name: userDetails?.roleName?.toUpperCase() === "SALES REPRESENTIVE" ? "My Actions" : "Team Actions",
                path: "/dashboard/todos",
                pro: false
            },
        ])
    }

    useEffect(() => {
        handleSetNavItems();
    }, [])

    useEffect(() => {
        let submenuMatched = false
            ;["main", "others"].forEach(menuType => {
                const items = menuType === "main" ? navItems : []
                items.forEach((nav, index) => {
                    if (nav.subItems) {
                        nav.subItems.forEach(subItem => {
                            if (isActive(subItem.path)) {
                                toggleSubmenu({ type: menuType, index })
                                submenuMatched = true
                            }
                        })
                    }
                })
            })

        if (!submenuMatched) {
            toggleSubmenu(null)
        }
    }, [location, isActive, toggleSubmenu])

    useEffect(() => {
        if (openSubmenu !== null) {
            const key = `${openSubmenu.type}-${openSubmenu.index}`
            if (subMenuRefs.current[key]) {
                setSubMenuHeight(prevHeights => ({
                    ...prevHeights,
                    [key]: subMenuRefs.current[key]?.scrollHeight || 0
                }))
            }
        }
    }, [openSubmenu])

    const handleSubmenuToggle = (index, menuType) => {
        if (
            openSubmenu &&
            openSubmenu.type === menuType &&
            openSubmenu.index === index
        ) {
            toggleSubmenu(null)
        } else {
            toggleSubmenu({ type: menuType, index })
        }
    }

    const renderMenuItems = (items, menuType) => (
        <ul className="flex flex-col gap-1">
            {items.map((nav, index) => (
                <li key={index}>
                    {nav.subItems ? (
                        <button
                            onClick={() => handleSubmenuToggle(index, menuType)}
                            className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors duration-200 group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                } ${!isExpanded && !isHovered
                                    ? "lg:justify-center"
                                    : "lg:justify-start"
                                }`}
                        >
                            <div className="flex justify-start items-center grow">
                                <span
                                    className={`flex items-center justify-center w-6 h-6 ${openSubmenu?.type === menuType && openSubmenu?.index === index
                                        ? "text-blue-600"
                                        : "text-gray-500 group-hover:text-gray-700"
                                        }`}
                                >
                                    {nav.icon}
                                </span>
                                {(isExpanded || isHovered || isMobileOpen) && (
                                    <span className="ml-3 text-sm font-medium">{nav.name}</span>
                                )}
                            </div>
                            <div>
                                {(isExpanded || isHovered || isMobileOpen) && (
                                    <CustomIcons
                                        iconName="chevron-down"
                                        className={`ml-auto w-4 h-4 transform transition-transform duration-200 ${openSubmenu?.type === menuType && openSubmenu?.index === index
                                            ? "transform transition-transform duration-200 rotate-180 text-blue-500"
                                            : "transform transition-transform duration-200 text-gray-400"
                                            }`}
                                    />
                                )}
                            </div>
                        </button>
                    ) : (
                        nav.path && (
                            <NavLink
                                onClick={() => toggleMobileSidebar()}
                                to={nav.path}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 group ${isActive
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    } ${!isExpanded && !isHovered
                                        ? "lg:justify-center"
                                        : "lg:justify-start"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <span
                                            className={`flex items-center justify-center w-6 h-6 ${isActive
                                                ? "text-blue-600"
                                                : "text-gray-500 group-hover:text-gray-700"
                                                }`}
                                        >
                                            {nav.icon}
                                        </span>
                                        {(isExpanded || isHovered || isMobileOpen) && (
                                            <span className="ml-3 text-sm font-medium">
                                                {nav.name}
                                            </span>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        )
                    )}
                    {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                        <div
                            ref={el => {
                                subMenuRefs.current[`${menuType}-${index}`] = el
                            }}
                            className="overflow-hidden transition-all duration-300"
                            style={{
                                height:
                                    openSubmenu?.type === menuType && openSubmenu?.index === index
                                        ? `${subMenuHeight[`${menuType}-${index}`]}px`
                                        : "0px"
                            }}
                        >
                            <ul className="pt-1 pb-2 pl-8 pr-4 space-y-1">
                                {nav.subItems.map(subItem => (
                                    <li key={subItem.name}>
                                        <NavLink
                                            onClick={() => toggleMobileSidebar()}
                                            to={subItem.path}
                                            className={({ isActive }) =>
                                                `flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200 ${isActive
                                                    ? "bg-blue-50 text-blue-600 font-medium"
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                                }`
                                            }
                                        >
                                            {subItem.name}
                                            <span className="flex items-center gap-1 ml-auto">
                                                {subItem.new && (
                                                    <span
                                                        className={`px-2 py-0.5 text-xs rounded-full ${isActive(subItem.path)
                                                            ? "bg-blue-100 text-blue-700"
                                                            : "bg-gray-100 text-gray-700"
                                                            }`}
                                                    >
                                                        new
                                                    </span>
                                                )}
                                                {subItem.pro && (
                                                    <span
                                                        className={`px-2 py-0.5 text-xs rounded-full ${isActive(subItem.path)
                                                            ? "bg-blue-100 text-blue-700"
                                                            : "bg-gray-100 text-gray-700"
                                                            }`}
                                                    >
                                                        pro
                                                    </span>
                                                )}
                                            </span>
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </li>
            ))}
        </ul>
    )

    return (
        <div
            className={`z-50 fixed flex flex-col lg:mt-0 top-0 p-4 left-0 bg-white text-gray-900 h-screen transition-all duration-300 ease-in-out border-r border-gray-200 
        ${isExpanded || isMobileOpen
                    ? "w-72"
                    : isHovered
                        ? "w-72"
                        : "w-20"
                }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
            onMouseEnter={() => !isExpanded && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={`py-6 flex justify-center items-center`}
            >
                <NavLink to="/dashboard">
                    {isExpanded || isHovered || isMobileOpen ? (
                        <>
                            <div className="w-40 flex items-center h-2">
                                <NavLink to={'/dashboard'}>
                                    <img src="/images/logo/360Pipe_logo.png" alt="360Pipe Logo" className="h-[40px] my-1" />
                                </NavLink>
                            </div>
                        </>
                    ) : (
                        null
                    )}
                </NavLink>
            </div>
            <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
                <nav className="mb-6">
                    <div className="flex flex-col gap-6">
                        <div>
                            {renderMenuItems(navItems, "main")}
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    )
}

const mapStateToProps = state => ({
    isExpanded: state.common.isExpanded,
    isMobileOpen: state.common.isMobileOpen,
    isHovered: state.common.isHovered,
    activeItem: state.common.activeItem,
    openSubmenu: state.common.openSubmenu
})

const mapDispatchToProps = {
    toggleSidebar,
    setIsHovered,
    setActiveItem,
    toggleSubmenu,
    toggleMobileSidebar
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar)