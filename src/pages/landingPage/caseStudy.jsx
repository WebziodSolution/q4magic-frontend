import EyeIcon from '../../../src/assets/svgs/eye-icon.svg';
import Slider from "react-slick";
import CustomIcons from "../../components/common/icons/CustomIcons";
import { useEffect, useState } from 'react';
import useWindowSize from '../../components/useWindowSize';

const projects = [
    {
        title: "Sitemark's success with tailored SEO solutions",
        content:
            "Sitemark thrived with customized SEO strategies, enhancing visibility and organic traffic for strong ROI.",
        bgImage: "/images/landingpage/woman.jpg",
        stats: [
            { number: "515%", text: "ROI increase over 3 years", color: "bg-orange-500" },
            { number: "$218k", text: "In value due to increased team productivity", color: "bg-[#44288E]" },
            { number: "522%", text: "Saved due to reduced administration time", color: "bg-cyan-400" },
        ],
        link: "/casestudy-details",
    },
    {
        title: "How Greenish achieved an eco-friendly SEO success",
        content:
            "Greenish optimized sustainable content, attracting eco-conscious audiences and driving traffic effectively.",
        bgImage: "/images/landingpage/woman.jpg",
        stats: [
            { number: "410%", text: "ROI increase over 3 years", color: "bg-orange-500" },
            { number: "$121k", text: "In value due to increased team productivity", color: "bg-[#44288E]" },
            { number: "410%", text: "Saved due to reduced administration time", color: "bg-cyan-400" },
        ],
        link: "/casestudy-details",
    },
];

const CaseStudy = () => {
    const [width,] = useWindowSize();
    const [settings, setSettings] = useState(
        {
            dots: false,
            infinite: true,
            speed: 700,
            slidesToScroll: 1,
            arrows: false,
            slidesToShow: 1,
            centerMode: true,
            centerPadding: "160px",
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 3,
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 2,
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
            ]
        }
    );

    useEffect(() => {
        if (width < 1024) {
            setSettings({
                ...settings,
                centerMode: false,
                centerPadding: "0px"
            });
        } else {
            setSettings({
                ...settings,
                centerMode: true,
                centerPadding: "160px"
            });
        }
    }, [width]);

    return (
        <section className="mx-auto md:px-6 py-12">
            {/* Header */}
            <div className="px-5 md:px-20 md:flex justify-between items-center">
                <div>
                    <div className="px-3 py-1 bg-white shadow-sm border border-gray-100 rounded-full flex items-center w-40">
                        <img src={EyeIcon} alt="logo" className="w-5 h-5" />
                        <span className="font-medium px-3 text-sm capitalize text-black">Case study</span>
                    </div>

                    <h2 className="text-4xl font-bold mt-4 mb-4 text-black">
                        How Businesses Grow with 360Pipe
                    </h2>
                </div>

                <button
                    type="button"
                    className="relative px-5 py-3 rounded group overflow-hidden font-medium text-[#44288E] border border-[#44288E]"
                >
                    <span className="absolute bottom-0 left-0 w-full h-0 transition-all duration-300 ease-out bg-[#44288E] text-white group-hover:h-full"></span>
                    <span className="relative z-10 transition-colors duration-300 group-hover:text-[#fff] text-lg font-bold capitalize">
                        View more success stories
                    </span>
                </button>
            </div>

            {/* Slider */}
            <div className="mt-6 md:mt-12">
                <Slider {...settings}>
                    {projects.map((project, i) => (
                        <div key={i} className="px-4">
                            <div className="relative py-16 px-10 md:px-28 flex flex-col md:flex-row items-center md:items-stretch justify-between rounded-2xl overflow-hidden text-white">

                                {/* Background Image + Gradient Overlay */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{ backgroundImage: `url(${project.bgImage})` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/90" />

                                {/* Content */}
                                <div className="relative z-10 md:w-1/2 lg:w-2/5 flex flex-col justify-center text-center md:text-left mb-8 md:mb-0 pr-0 md:pr-8">
                                    <h2 className="text-3xl font-bold mb-4">{project.title}</h2>
                                    <p className="text-base font-normal mb-8 leading-relaxed">
                                        {project.content}
                                    </p>
                                    <div
                                        className="flex items-center justify-center md:justify-start text-lg font-semibold border-b-2 border-white pb-1 w-fit mx-auto md:mx-0 group cursor-pointer"
                                    >
                                        Read case study
                                        <button className="ml-2 transition-transform duration-300 group-hover:translate-x-1 bg-white rounded-full w-7 h-7 -rotate-45 hover:rotate-0">
                                            <CustomIcons
                                                iconName={"fa-solid fa-arrow-right"}
                                                css="text-black"
                                            />
                                        </button>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="relative z-10 md:w-1/2 lg:w-2/5 flex flex-col space-y-8 pl-0 md:pl-8">
                                    {project.stats.map((stat, idx) => (
                                        <div key={idx} className="flex items-center">
                                            <div className={`w-1 ${stat.color} h-24 mr-4 rounded-full`}></div>
                                            <div>
                                                <p className="text-5xl font-bold mb-1">{stat.number}</p>
                                                <p className="text-md">{stat.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>
        </section>
    );
};

export default CaseStudy;