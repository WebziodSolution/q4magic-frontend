import React, { useState } from "react";
import CustomIcons from "../../components/common/icons/CustomIcons";
import Magic from "../../assets/svgs/magic.svg";

const faqs = [
    {
        id: 1,
        question: "How long does it take to see results with 360Pipe CRM?",
        answer:
            "You can start seeing improved sales team efficiency and better pipeline tracking within the first 1–2 weeks. ROI from automation and better deal closure often becomes visible within 1–2 months, depending on your team size and usage.",
        highlights: [
            "Faster follow-ups",
            "Better lead visibility",
            "Reduced admin overhead",
        ],
    },
    {
        id: 2,
        question: "Does 360Pipe CRM support team collaboration?",
        answer:
            "Yes, 360Pipe CRM is built with collaboration in mind. Teams can share leads, track tasks, and manage pipelines together seamlessly.",
    },
    {
        id: 3,
        question: "Can I integrate 360Pipe CRM with my existing tools?",
        answer:
            "Absolutely! 360Pipe integrates with popular tools like email, Slack, calendars, and more to keep your workflow smooth.",
    },
    {
        id: 4,
        question: "Is 360Pipe CRM suitable for startups and small businesses?",
        answer:
            "Yes, it’s designed to be flexible and affordable, making it a perfect fit for startups, SMBs, and growing sales teams.",
    },
    {
        id: 5,
        question: "Do I need technical skills to use 360Pipe?",
        answer:
            "No technical skills required! The platform is intuitive and designed for sales teams, not developers.",
    },
];

const FAQSection = () => {
    const [openId, setOpenId] = useState(1);

    const toggleFAQ = (id) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <section className="py-6 bg-white md:pb-72">
            <div className="4k:max-w-6xl mx-auto md:px-6">
                {/* Heading */}
                <div className="text-center mb-12">
                    <button className="px-4 py-1 text-sm rounded-full border bg-white shadow-sm mb-4">
                        <img
                            src={Magic}
                            alt="magic"
                            className="w-5 h-5 inline-block mr-1"
                        />
                        <span className="text-black">
                            Frequently Asked Questions
                        </span>
                    </button>
                    <h2 className="text-xl md:text-5xl font-bold text-black">
                        FAQ Entries:
                    </h2>
                </div>

                <div className="rounded-2xl border bg-gradient-to-r from-yellow-50 to-purple-50 p-2">
                    <div className="bg-white rounded-xl divide-y">
                        {faqs.map((faq) => (
                            <div key={faq.id}>
                                <button
                                    className={`bg-gray-100 w-full flex justify-between items-center px-6 py-5 text-left font-medium text-black transition`}
                                    onClick={() => toggleFAQ(faq.id)}
                                >
                                    <span className="md:text-2xl font-medium">
                                        <span className="mr-2">
                                            {faq.id < 10 ? `0${faq.id}` : faq.id} _
                                        </span>
                                        {faq.question}
                                    </span>
                                    <span
                                        className={`p-2 rounded-full border flex justify-center items-center 
        transition-all duration-500 ease-in-out
        ${openId === faq.id ? "rotate-180 bg-[#44288E] border-[#44288E]" : "rotate-0 bg-white border-gray-300"}`}
                                    >
                                        {openId === faq.id ? (
                                            <CustomIcons iconName="fa-solid fa-minus" css="text-white w-5 h-5" />
                                        ) : (
                                            <CustomIcons iconName="fa-solid fa-plus" css="text-black w-5 h-5" />
                                        )}
                                    </span>
                                </button>

                                <div
                                    className={`overflow-hidden transition-all duration-700 ease-in-out ${openId === faq.id ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                                        }`}
                                >
                                    <div className="pr-24 pt-7 pb-10 pl-10 text-gray-600">
                                        <p className="md:text-lg mb-4">{faq.answer}</p>
                                        {faq.highlights && (
                                            <ul className="space-y-1">
                                                {faq.highlights.map((item, idx) => (
                                                    <li
                                                        key={idx}
                                                        className="flex items-center text-gray-700"
                                                    >
                                                        <CustomIcons iconName="fa-solid fa-check" css="text-blue-500 w-4 h-4 mr-2" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
