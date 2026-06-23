import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import CustomIcons from "../../components/common/icons/CustomIcons";

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [isOpen, setIsOpen] = useState(false);
    const [openMenu, setOpenMenu] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [navItems, setNavItems] = useState([]);

    const hideButtons =
        location.pathname === "/register" ||
        location.pathname === "/login" ||
        location.pathname === "/forgotpassword" ||
        location.pathname.startsWith("/subaccountactivesetup") ||
        location.pathname.startsWith("/resetpassword");

    // Track scroll
    useEffect(() => {
        if (!hideButtons) {
            setNavItems([
                {
                    title: "Home",
                    route: "/",
                    children: [
                        "SEO Agency",
                        "IT Services",
                        "Cyber Security",
                        "Help Desk SaaS",
                        "Data Analytics",
                        "Cloud and Devops",
                    ],
                },
                { title: "Pricing", route: "/pricing" },
                { title: "Support", route: "/support" },
            ])
        } else {
            setNavItems([])
        }

        const handleScroll = () => {
            if (window.scrollY > 150) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`w-full top-0 left-0 z-50 transition-all duration-700 ${isScrolled
                ? "fixed bg-white shadow-md transition-all duration-700 "
                : "absolute bg-transparent transition-all duration-700 "
                }
                ${hideButtons ? "bg-white shadow" : ""}
                `}
        >
            <div className="flex items-center justify-between 4k:justify-center 4k:gap-32 px-5 lg:px-20 py-4">
                <div className="w-40 flex items-center h-12">
                    <NavLink to={'/'}>
                        <img src="/images/logo/360Pipe_logo.png" alt="360Pipe Logo" className="mt-3" />
                    </NavLink>
                </div>

                <nav className="hidden xl:flex space-x-6 text-gray-800 font-medium ">
                    {navItems?.map((item, idx) => (
                        <div key={idx} className="relative group">
                            <NavLink
                                to={item.route}
                                className={`px-3 py-1 rounded-full transition-all duration-300 ${isScrolled
                                    ? "hover:text-blue-600"
                                    : "text-black hover:text-blue-700 hover:bg-white hover:shadow-sm"
                                    }`}
                            >
                                {item.title}
                                {/* {item.children && <span className="ml-1">+</span>} */}
                            </NavLink>
                        </div>
                    ))}
                </nav>

                {/* Desktop Buttons */}
                {!hideButtons && (
                    <div className="hidden xl:flex space-x-3">
                        <button
                            onClick={() => navigate("/register")}
                            className="bg-[#44288E] text-white px-5 py-2 rounded-md font-semibold hover:bg-[#44288E] transition"
                        >
                            Sign Up
                        </button>
                        <button
                            onClick={() => navigate("/login")}
                            className="px-5 py-2 rounded-md font-semibold transition-colors duration-300 border border-[#44288E] text-[#44288E] hover:bg-[#44288E] hover:text-white"
                        >
                            Sign In
                        </button>
                    </div>
                )}

                {/* Mobile Toggle */}
                {
                    location.pathname !== "/register" && (
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="xl:hidden transition-transform duration-300"
                        >
                            <CustomIcons
                                iconName={isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"}
                                css={`cursor-pointer text-2xl transform transition-transform duration-300 ${isOpen ? "rotate-90" : "rotate-0"
                                    } ${isScrolled ? "text-gray-800" : "text-black"}`}
                            />
                        </button>
                    )
                }
            </div>

            {/* Mobile Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 p-5 overflow-y-auto transform transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="flex justify-end items-center mb-4 pb-3 border-b">
                    {/* <div>
                        <NavLink to={'/'}>
                            <img src="/images/logo/360Pipe_logo.png" alt="360Pipe Logo" className="mt-3 h-20" />
                        </NavLink>
                    </div> */}
                    <button onClick={() => setIsOpen(false)}>
                        <CustomIcons
                            iconName={"fa-solid fa-xmark"}
                            css="cursor-pointer text-2xl text-gray-800"
                        />
                    </button>
                </div>

                <nav className="space-y-2">
                    {navItems.map((item, idx) => (
                        <div key={idx}>
                            <NavLink
                                to={item.route}
                                className="flex justify-between items-center w-full px-2 py-2 text-left text-gray-800 font-semibold hover:bg-gray-100 rounded-md"
                                onClick={() =>
                                    setOpenMenu(openMenu === idx ? null : idx)
                                }
                            >
                                {item.title}
                                {item.children && (
                                    <CustomIcons
                                        iconName={
                                            openMenu === idx
                                                ? "fa-solid fa-chevron-up"
                                                : "fa-solid fa-chevron-down"
                                        }
                                        css="text-sm transition-transform duration-300"
                                    />
                                )}
                            </NavLink>
                            {openMenu === idx && item.children && (
                                <div className="ml-4 space-y-1 animate-fadeIn">
                                    {item.children.map((child, cidx) => (
                                        <NavLink
                                            key={cidx}
                                            to={child.route}
                                            className="block px-2 py-1 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md text-sm"
                                        >
                                            {child}
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </div>
        </header>
    );
};

export default Header;