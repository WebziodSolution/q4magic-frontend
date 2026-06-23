
const CTABanner = () => {
    return (
        <div className="4k:flex 4k:justify-center">
            <section className="w-full py-8 px-6 md:px-14 rounded-xl bg-[#44288E]">
                <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="max-w-lg flex flex-col gap-6 text-white">
                        <h2 className="text-4xl md:text-5xl font-bold leading-[1.2]">
                            Stop Losing Leads <br /> to Outdated Tools.
                        </h2>
                        <p className="text-lg md:text-xl leading-relaxed text-gray-100 font-normal">
                            Book a free consultation and discover how 360Pipe CRM can boost your
                            conversions and streamline your sales pipeline.
                        </p>
                        <div>
                            <button
                                type="button"
                                className="relative mt-8 px-5 py-3 rounded group overflow-hidden font-medium text-white border border-white"
                            >
                                <span className="absolute bottom-0 left-0 w-full h-0 transition-all duration-300 ease-out bg-white group-hover:h-full"></span>

                                <span className="relative z-10 transition-colors duration-300 group-hover:text-black text-lg font-bold">
                                    Book Your Free Demo
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <img
                            src="/images/landingpage/clip-bord.png"
                            alt="CTA Illustration"
                            className="h-60 md:h-full w-[460px] max-w-full"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CTABanner;
