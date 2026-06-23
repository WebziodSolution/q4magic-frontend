import Check from "../../assets/svgs/check.svg"
import Error from "../../assets/svgs/erorr.svg"
import Star from "../../assets/svgs/star.svg"

const ComparisonSection = () => {
    const features = [
        { name: "Easy-to-use visual sales pipeline", pipe: true, others: false },
        { name: "Built-in calendar and reminders", pipe: true, others: false },
        { name: "Customizable contact fields & tags", pipe: true, others: false },
        { name: "Real-time deal analytics", pipe: true, others: true },
        { name: "No-code automation workflows", pipe: true, others: false },
        { name: "Transparent pricing, no surprises", pipe: true, others: false },
        { name: "Fast onboarding and live support", pipe: true, others: true },
        { name: "Feels built for sales teams", pipe: true, others: true },
    ];

    return (
        <section className="flex justify-center items-center py-12">
            <div className="px-6">
                <div className="text-center mb-12">
                    <button className="px-4 py-1 text-sm rounded-full border bg-white shadow-sm mb-4">
                        <img
                            src={Star}
                            alt="logo"
                            className="w-5 h-5 inline-block mr-1"
                        />
                        <span className="text-black">
                            Why choose us over the rest?
                        </span>
                    </button>
                    <h2 className="text-3xl md:text-4xl font-bold text-black">
                        How <span>360Pipe</span> Stands Out from
                        Other CRM Platforms
                    </h2>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-2xl">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-transparent">
                                <th className="px-3 py-2 md:px-6 md:py-4 text-black text-lg md:text-[28px] font-semibold">
                                    Features
                                </th>
                                <th className="px-3 py-2 md:px-6 md:py-4 text-center text-lg md:text-[28px] font-semibold bg-[#44288E] text-white rounded-tr-2xl rounded-tl-2xl border-[#e7e8ec66] border-b">
                                    360Pipe
                                </th>
                                <th className="px-3 py-2 md:px-6 md:py-4 text-center text-black text-lg md:text-[28px] font-semibold">
                                    Other agencies
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white shadow-2xl shadow-[#e7e8ec66] rounded-2xl">
                            {features.map((feature, idx) => (
                                <tr key={idx}>
                                    <td className="px-3 py-2 md:px-6 md:py-4 text-md md:text-xl font-medium text-black">{feature.name}</td>

                                    <td className={`px-3 py-2 md:px-6 md:py-4 text-center bg-[#44288E] border-[#e7e8ec66] border-b text-xl font-medium`}>
                                        {feature.pipe ? (
                                            <img
                                                src={Check}
                                                alt="check"
                                                className="mx-auto text-green-400 w-6 h-6"
                                            />
                                        ) : (
                                            <img
                                                src={Error}
                                                alt="error"
                                                className="mx-auto text-red-500 w-6 h-6"
                                            />
                                        )}
                                    </td>

                                    {/* Others Column */}
                                    <td className="px-3 py-2 md:px-6 md:py-4 text-center">
                                        {feature.others ? (
                                            <img
                                                src={Check}
                                                alt="check"
                                                className="mx-auto text-green-400 w-6 h-6"
                                            />
                                        ) : (
                                            <img
                                                src={Error}
                                                alt="error"
                                                className="mx-auto text-red-500 w-6 h-6"
                                            />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

export default ComparisonSection;
