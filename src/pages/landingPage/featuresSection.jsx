import gif1 from '../../../src/assets/gif/gif_1.gif';
import gif2 from '../../../src/assets/gif/gif_2.gif';
import gif3 from '../../../src/assets/gif/gif_3.gif';
import gif4 from '../../../src/assets/gif/gif_4.gif';
import gif5 from '../../../src/assets/gif/gif_5.gif';
import gif6 from '../../../src/assets/gif/gif_6.gif';
import arrowBlack from '../../../src/assets/svgs/arrow-black.svg';
import bgImage from '../../../src/assets/images/Image.png';

export default function FeaturesSection() {
    const features = [
        {
            title: "Sales Pipeline",
            desc: "Visualize every stage of your sales process — from lead to close.",
            icon:
                <img
                    src={gif1}
                    alt="logo"
                    className="w-16 h-16"
                />,
        },
        {
            title: "Lead Management",
            desc: "Store and organize all your prospects and customers in one place.",
            icon:
                <img
                    src={gif2}
                    alt="logo"
                    className="w-16 h-16"
                />,
        },
        {
            title: "Smart Calendar",
            desc: "Schedule follow-ups, meetings, and tasks with built-in automation.",
            icon:
                <img
                    src={gif3}
                    alt="logo"
                    className="w-16 h-16"
                />,
        },
        {
            title: "Real-Time Analytics",
            desc: "Track performance metrics, conversion rates, and KPIs with ease.",
            icon: <img
                src={gif4}
                alt="logo"
                className="w-16 h-16"
            />,
        },
        {
            title: "Deal Management",
            desc: "Keep proposals, contracts, and deal status organized and accessible.",
            icon: <img
                src={gif5}
                alt="logo"
                className="w-16 h-16"
            />,
        },
        {
            title: "Team Collaboration",
            desc: "Assign tasks, share notes, and collaborate across your sales team.",
            icon: <img
                src={gif6}
                alt="logo"
                className="w-16 h-16"
            />,
        },
    ];

    return (
        <>
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
            `}</style>
            <section className="max-w-7xl mx-auto md:px-6 md:py-12 flex flex-col lg:flex-row gap-10">
                {/* Right section - sticky */}
                <div className="lg:w-1/3 flex-shrink-0">
                    <div className="lg:sticky lg:top-[80px] rounded-xl px-8 flex flex-col justify-start">
                        <div>
                            <div className="px-3 py-1 bg-white shadow-sm border border-gray-100 rounded-full flex items-center w-48">
                                <img
                                    src="/svg/ser-01.svg"
                                    alt="logo"
                                    className="w-5 h-5"
                                />
                                <span className="font-medium px-3 py-1 text-sm text-black">
                                    Feature-services
                                </span>
                            </div>
                            <h2 className="text-4xl font-bold mt-4 mb-4 text-black">
                                Powerful Tools to Grow Your Sales Pipeline
                            </h2>
                            <p className="text-xl font-normal">
                                360Pipe CRM is packed with intelligent features to help you connect
                                with leads, manage clients, and close deals faster.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="relative mt-8 px-5 py-3 rounded group overflow-hidden font-medium text-[#44288E] border border-[#44288E]"
                        >
                            <span className="absolute bottom-0 left-0 w-full h-0 transition-all duration-300 ease-out bg-[#44288E] group-hover:h-full"></span>
                            <span className="relative z-10 transition-colors duration-300 group-hover:text-white text-lg font-bold">
                                View all CRM Features
                            </span>
                        </button>
                    </div>
                </div>

                {/* Left section - normal scroll, hide scrollbar */}
                <div className="lg:w-2/3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pr-2 hide-scrollbar">
                        {features.map((f, i) => (
                            <div className="group relative w-full h-full cursor-pointer" key={i}>
                                <div
                                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{
                                        backgroundImage: `url(${bgImage})`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                    }}
                                ></div>
                                <div
                                    className="relative w-full h-full p-3 bg-[#F6F6F8] overflow-hidden rounded-xl border border-[#E7E8EC] flex flex-col transition-all duration-300 group-hover:bg-transparent"
                                >
                                    <div className="w-full bg-white rounded-lg border border-[#E6E7EC] flex flex-col justify-between items-end gap-20 p-8">
                                        <div className="w-full flex flex-col gap-2 text-left">
                                            <h3 className="text-[27px] font-medium text-black leading-8">
                                                {f.title}
                                            </h3>
                                            <p className="text-[#494D57] text-base leading-6">
                                                {f.desc}
                                            </p>
                                        </div>
                                        <div className="flex justify-start items-center w-full">
                                            <div className="grow">{f.icon}</div>
                                            <button className="w-10 h-10 flex justify-center items-center rounded-full border border-[#E6E7EC] bg-white">
                                                <img src={arrowBlack} alt="logo" className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}