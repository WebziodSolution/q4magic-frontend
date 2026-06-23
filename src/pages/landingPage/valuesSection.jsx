export default function ValuesSection() {
    return (
        <section className="py-12 4k:max-w-7xl">
            <div className="relative rounded-3xl overflow-hidden shadow-md bg-gradient-to-r from-yellow-50 via-white to-blue-50 py-12">
                <div className="w-full h-full flex flex-col items-center gap-6 pb-5 md:pb-12">
                    <div className="px-3 py-1 bg-white shadow-sm border border-gray-100 rounded-full flex items-center gap-2">
                        <img
                            src="/images/landingpage/values_section_logo.png"
                            alt="logo"
                            className="w-5 h-5"
                        />
                        <span className="text-sm font-medium text-gray-900">
                            We are 360Pipe
                        </span>
                    </div>

                    <h2 className="text-center text-xl  md:text-4xl font-bold text-gray-900 leading-tight md:max-w-4xl">
                        Driven by Innovation. Focused on Your Growth.
                    </h2>
                </div>

                <div className="mt-5 md:mt-12">
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 px-5 lg:px-28">
                        <div>
                            <p className="text-2xl md:text-3xl font-semibold mb-6 text-black">Core values</p>
                            <div className="space-y-6">
                                <div className="flex items-start space-x-6">
                                    <span className="hidden xl:flex items-center justify-center rounded-full bg-white p-3">
                                        <img src="/images/landingpage/airdrop.png" alt="Innovation" className="w-full h-full" />
                                    </span>
                                    <p className="text-lg font-normal">
                                        <span className="text-xl font-semibold text-black">Innovation:</span> We continuously enhance our CRM platform to help you stay ahead in a sales landscape.
                                    </p>
                                </div>

                                <div className="flex items-start space-x-6">
                                    <span className="hidden xl:flex items-center justify-center rounded-full bg-white p-3">
                                        <img src="/images/landingpage/people.png" alt="Innovation" className="w-full h-full" />
                                    </span>
                                    <p className="text-lg font-normal">
                                        <span className="text-xl font-semibold text-black">Client Focus:</span> Your growth is our mission — every tool we build is designed to empower your boost.
                                    </p>
                                </div>

                                <div className="flex items-start space-x-6">
                                    <span className="hidden xl:flex items-center justify-center rounded-full bg-white p-3">
                                        <img src="/images/landingpage/microphone.png" alt="Innovation" className="w-full h-full" />
                                    </span>
                                    <p className="text-lg font-normal">
                                        <span className="text-xl font-semibold text-black">Transparency:</span> Gain full visibility of your pipeline, client interactions, and team performance.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-300"></div>

                        <div className="space-y-10 md:px-10">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-semibold mb-6 text-black">Our Mission</h3>
                                <p className="text-lg font-normal">
                                    To simplify and streamline the sales process through an intuitive CRM that gives teams the tools they need to build stronger relationships, close deals faster, and scale sustainably.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-2xl md:text-3xl font-semibold mb-6 text-black">Our Vision</h3>
                                <p className="text-lg font-normal">
                                    To become the most trusted CRM platform for growing businesses, known for our usability, transparency, and results-driven features.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 flex justify-center pt-12">
                        <button
                            type="button"
                            className="relative px-5 py-3 rounded group overflow-hidden font-medium text-[#44288E] border border-[#44288E]"
                        >
                            <span className="absolute bottom-0 left-0 w-full h-0 transition-all duration-300 ease-out bg-[#44288E] group-hover:h-full"></span>

                            <span className="relative z-10 transition-colors duration-300 group-hover:text-white text-lg font-bold">
                                Learn more about 360Pipe CRM
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );

}