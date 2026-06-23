import Mail from "../../assets/svgs/sms-white.svg";
import Phone from "../../assets/svgs/call-white.svg";
import Location from "../../assets/svgs/location.svg";
import CustomIcons from "../../components/common/icons/CustomIcons";
import { NavLink } from "react-router-dom";

const Footer = () => {
    return (
        <>
            <footer className="bg-[#0C111D] text-gray-300 md:pt-56">
                <div className="px-5 lg:px-20 py-10 mx-auto 4k:max-w-7xl">
                    {/* Top Contact Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-gray-700 py-11">
                        <div className="flex items-center gap-4">
                            <span className="bg-orange-500 p-3 rounded-full">
                                <img
                                    src={Mail}
                                    alt="Mail Icon"
                                    className="text-white w-6 h-6"
                                />
                            </span>
                            <div>
                                <p className="text-sm font-medium text-white">Write to us</p>
                                <p className="font-medium text-xl text-white">support@360pipe.com</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="bg-[#44288E] p-3 rounded-full">
                                <img
                                    src={Phone}
                                    alt="Phone Icon"
                                    className="text-white w-6 h-6"
                                />
                            </span>
                            <div>
                                <p className="text-sm font-medium text-white">Call Us (USA)</p>
                                <p className="font-medium text-xl text-white">+1 (415) 555-3600</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="bg-teal-500 p-3 rounded-full">
                                <img
                                    src={Location}
                                    alt="Location Icon"
                                    className="text-white w-6 h-6"
                                />
                            </span>
                            <div>
                                <p className="text-sm font-medium text-white">Our Office</p>
                                <p className="font-medium text-xl text-white">San Francisco, CA, USA</p>
                            </div>
                        </div>
                    </div>

                    {/* Middle Section */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-10 py-12 border-b border-gray-700 my-8">
                        {/* Newsletter */}
                        <div className="col-span-1 md:col-span-2 w-80">
                            <h3 className="text-sm font-medium tracking-wide text-[#D2DBEF] uppercase mb-7">
                                Newsletter
                            </h3>
                            <p className="mb-4 text-base font-normal text-white">
                                Get the latest CRM tips, sales strategies, and 360Pipe feature
                                releases.
                            </p>
                            <div className="flex items-center bg-transparent border-2 border-[#242934] rounded-md overflow-hidden my-8">
                                <input
                                    type="email"
                                    placeholder="enter your email"
                                    className="h-16 w-full px-5 bg-transparent text-sm outline-none border-r border-[#242934]"
                                />
                                <button className="p-5 border-r border-[#242934]">
                                    <CustomIcons iconName="fa-solid fa-paper-plane" css="text-white w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-base font-normal text-[#D2DBEF]">
                                By continuing, you agree to 360Pipe{" "}
                                <NavLink to={"#"} className="underline">
                                    Terms of Use
                                </NavLink>{" "}
                                and{" "}
                                <NavLink to={"#"} className="underline">
                                    Privacy Policy
                                </NavLink>
                                .
                            </p>
                        </div>

                        {/* Company */}
                        <div>
                            <h3 className="text-sm font-medium tracking-wide text-[#D2DBEF] uppercase mb-7">
                                Company
                            </h3>
                            <ul className="space-y-3">
                                <li><NavLink className="text-white text-xl font-medium hover:underline" to="#">About us</NavLink></li>
                                <li><NavLink className="text-white text-xl font-medium hover:underline" to="#">Contact us</NavLink></li>
                                <li><NavLink className="text-white text-xl font-medium hover:underline" to="/pricing">Price table</NavLink></li>
                                <li><NavLink className="text-white text-xl font-medium hover:underline" to="#">Our blog</NavLink></li>
                                <li><NavLink className="text-white text-xl font-medium hover:underline" to="#">Our Tools</NavLink></li>
                                <li><NavLink className="text-white text-xl font-medium hover:underline" to="#">Our Cases</NavLink></li>
                            </ul>
                        </div>

                        {/* Features */}
                        <div>
                            <h3 className="text-sm font-medium tracking-wide text-[#D2DBEF] uppercase mb-7">
                                Features
                            </h3>
                            <ul className="space-y-3">
                                <li><NavLink className="text-white text-xl font-medium hover:underline" to="#">Sales Pipeline</NavLink></li>
                                <li><NavLink className="text-white text-xl font-medium hover:underline" to="#">Lead Management</NavLink></li>
                                <li><NavLink className="text-white text-xl font-medium hover:underline" to="#">Team Collaboration</NavLink></li>
                                <li><NavLink className="text-white text-xl font-medium hover:underline" to="#">Automation & Reminders</NavLink></li>
                                <li><NavLink className="text-white text-xl font-medium hover:underline" to="#">CRM Reports & Analytics</NavLink></li>
                            </ul>
                        </div>

                        {/* Industries */}
                        <div>
                            <h3 className="text-sm font-medium tracking-wide text-[#D2DBEF] uppercase mb-7">
                                Industries We Serve
                            </h3>
                            <ul className="space-y-3">
                                <li><NavLink className="text-white text-xl font-medium hover:underline" to="#">SaaS & Tech</NavLink></li>
                                <li><NavLink className="text-white text-xl font-medium hover:underline" to="#">Marketing Agencies</NavLink></li>
                                <li><NavLink className="text-white text-xl font-medium hover:underline" to="#">Consulting Firms</NavLink></li>
                                <li><NavLink className="text-white text-xl font-medium hover:underline" to="#">Finance & Insurance</NavLink></li>
                                <li><NavLink className="text-white text-xl font-medium hover:underline" to="#">Real Estate</NavLink></li>
                                <li><NavLink className="text-white text-xl font-medium hover:underline" to="#">&amp; More...</NavLink></li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="flex flex-col md:flex-row justify-between items-center py-6 text-sm text-white">
                        <p className="text-base font-normal">Copyright © {new Date().getFullYear()} 360Pipe. All rights reserved.</p>
                        <div className="flex items-center gap-4 mt-4 md:mt-0">
                            <span className="uppercase text-base font-normal">Follow us :</span>
                            <NavLink to="#">
                                <CustomIcons iconName={"fa-brands fa-twitter"} css="cursor-pointer text-lg text-gray-400 hover:text-white" />
                            </NavLink>
                            <NavLink to="#">
                                <CustomIcons iconName='fa-brands fa-facebook' css='cursor-pointer text-lg text-gray-400 hover:text-white' />
                            </NavLink>
                            <NavLink to="#">
                                <CustomIcons iconName='fa-brands fa-linkedin' css='cursor-pointer text-lg text-gray-400 hover:text-white' />
                            </NavLink>
                            <NavLink to="#">
                                <CustomIcons iconName='fa-brands fa-youtube' css='cursor-pointer text-lg text-gray-400 hover:text-white' />
                            </NavLink>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Footer;
