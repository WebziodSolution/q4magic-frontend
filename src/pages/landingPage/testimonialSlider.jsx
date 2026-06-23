import { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import Like from "../../assets/svgs/like-icon.svg";
import CustomIcons from "../../components/common/icons/CustomIcons";
import useWindowSize from "../../components/useWindowSize";

const testimonials = [
    {
        text: "360Pipe CRM completely transformed how we manage leads. Our response time dropped by 60% and deal closures doubled!",
        name: "Robert Miller",
        title: "Sales Director",
        company: "BUSD",
        companyLogo: "🔶",
        image: "https://i.pravatar.cc/100?img=3",
    },
    {
        text: "With 360Pipe, I can finally track my team's progress and performance in real time. The pipeline visualization is a game changer.",
        name: "Jessica Martinez",
        title: "Project Manager",
        company: "Kuda",
        companyLogo: "💙",
        image: "https://i.pravatar.cc/100?img=5",
    },
    {
        text: "Our onboarding was fast, and the automation saved our team hours every week. Highly intuitive and scalable CRM!",
        name: "Kevin Johnson",
        title: "Social Coordinator",
        company: "Gemini",
        companyLogo: "🌐",
        image: "https://i.pravatar.cc/100?img=7",
    },
    {
        text: "Working with 360Pipe was fantastic! Their strategies improved our rankings and increased leads.",
        name: "Christopher Lee",
        title: "Brand Strat",
        company: "Near",
        companyLogo: "🚀",
        image: "https://i.pravatar.cc/100?img=9",
    },
    {
        text: "360Pipe CRM completely transformed how we manage leads. Our response time dropped by 60% and deal closures doubled!",
        name: "Robert Miller",
        title: "Sales Director",
        company: "BUSD",
        companyLogo: "🔶",
        image: "https://i.pravatar.cc/100?img=3",
    },
    {
        text: "With 360Pipe, I can finally track my team's progress and performance in real time. The pipeline visualization is a game changer.",
        name: "Jessica Martinez",
        title: "Project Manager",
        company: "Kuda",
        companyLogo: "💙",
        image: "https://i.pravatar.cc/100?img=5",
    },
    {
        text: "Our onboarding was fast, and the automation saved our team hours every week. Highly intuitive and scalable CRM!",
        name: "Kevin Johnson",
        title: "Social Coordinator",
        company: "Gemini",
        companyLogo: "🌐",
        image: "https://i.pravatar.cc/100?img=7",
    },
    {
        text: "Working with 360Pipe was fantastic! Their strategies improved our rankings and increased leads.",
        name: "Christopher Lee",
        title: "Brand Strat",
        company: "Near",
        companyLogo: "🚀",
        image: "https://i.pravatar.cc/100?img=9",
    },
];

const TestimonialSlider = () => {
    const sliderRef = useRef(null);
    const [width,] = useWindowSize();
    const [settings, setSettings] = useState(
        {
            dots: false,
            arrows: false,
            infinite: true,
            speed: 600,
            slidesToShow: 3,
            slidesToScroll: 1,
            centerMode: true,
            centerPadding: "160px",
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 2,
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
        <section className="py-12 bg-white">
            <div className="px-4">
                {/* Section Heading */}
                <div className="md:flex justify-center gap-60 items-center mb-12">
                    <div>
                        <button className="px-4 py-1 text-sm rounded-full border bg-white shadow-sm mb-4">
                            <img
                                src={Like}
                                alt="logo"
                                className="w-5 h-5 inline-block mr-1"
                            />
                            <span className="text-black">98% Client Satisfaction | Proven CRM Impact</span>
                        </button>
                        <h2 className="text-3xl md:text-4xl font-bold text-black">
                            Customer Feedback That Builds Trust
                        </h2>
                    </div>

                    {/* Custom Arrows */}
                    <div className="mt-5 md:mt-0 flex md:justify-center items-center gap-2">
                        <button
                            onClick={() => sliderRef.current.slickPrev()}
                            className="bg-gray-100 rounded py-1 px-2"
                        >
                            <CustomIcons
                                iconName={"fa-solid fa-angle-left"}
                                css="cursor-pointer text-lg text-gray-800"
                            />
                        </button>
                        <button
                            onClick={() => sliderRef.current.slickNext()}
                            className="bg-gray-100 rounded py-1 px-2"
                        >
                            <CustomIcons
                                iconName={"fa-solid fa-angle-right"}
                                css="cursor-pointer text-lg text-gray-800"
                            />
                        </button>
                    </div>
                </div>

                {/* Slider */}
                <div className="overflow-visible">
                    <Slider ref={sliderRef} {...settings}>
                        {testimonials.map((item, idx) => (
                            <div key={idx} className="px-4 w-full">
                                <div className="border border-gray-200 shadow-sm rounded-lg bg-[#F6F6F8] p-2">
                                    <div className="bg-white h-80 flex flex-col justify-between p-6 rounded-lg">
                                        <div className="text-gray-300 text-4xl mb-4">“</div>

                                        <p className="text-gray-700 text-base leading-relaxed flex-1">
                                            {item.text}
                                        </p>

                                        <div className="mt-6 flex items-center gap-3 border-t pt-4">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-12 h-12 rounded-full object-cover border"
                                            />
                                            <div>
                                                <h4 className="text-gray-900 font-semibold text-sm">{item.name}</h4>
                                                <p className="text-gray-500 text-xs">
                                                    {item.title}{" "}
                                                    <span className="font-medium text-gray-900">· {item.company}</span>
                                                </p>
                                            </div>
                                            <span className="ml-auto text-lg">{item.companyLogo}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
            </div>
        </section>
    );
};

export default TestimonialSlider;
