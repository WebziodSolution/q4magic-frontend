import ProcessIcon from "../../../src/assets/svgs/process-icon.svg";
import SearchIcon from "../../../src/assets/svgs/search.svg";
import ClipboarIcon from "../../../src/assets/svgs/clipboar.svg";
import UserIcon from "../../assets/images/user-icon.png";
import MedalStarIcon from "../../../src/assets/svgs/medal-star.svg";

const workflowSteps = [
    {
        number: "01",
        icon: SearchIcon,
        title: "Capture & Qualify Leads",
        description:
            "Automatically collect leads from web forms, emails, and social channels. Use scoring rules to focus on the hottest prospects.",
        extraClass: "top-[150px]",
    },
    {
        number: "02",
        icon: UserIcon,
        title: "Organize Your Pipeline",
        description:
            "Segment deals into stages that reflect your sales cycle. Assign tasks and track every opportunity with full visibility.",
        extraClass: "top-[235px]",
    },
    {
        number: "03",
        icon: ClipboarIcon,
        title: "Automate & Follow Up",
        description:
            "Set reminders, automate emails, and never miss a follow-up. Let autopilot handle repetitive tasks while you focus on selling.",
        extraClass: "top-[320px]",
    },
    {
        number: "04",
        icon: MedalStarIcon,
        title: "Analyze & Improve",
        description:
            "Get real-time reports on conversions, team activity, and deal performance. Optimize your process based on data.",
        extraClass: "top-[500px]",
    },
];

const WorkingProcess = () => {
    return (
        <section className="process pt-[130px] pb-[100px] relative bg-[#44288E]">
            <div className="container mx-auto max-w-[1320px]">
                <div className="flex justify-center items-center mb-5">
                    <div className='px-3 py-1 shadow-sm border border-blue-500 rounded-full flex items-center'>
                        <img
                            src={ProcessIcon}
                            alt="logo"
                            className="w-5 h-5"
                        />
                        <span className="font-medium px-3 py-1 text-sm capitalize text-white">
                            Our working process
                        </span>
                    </div>
                </div>
                <div className='text-white text-3xl font-bold text-center mb-16'>
                    Our CRM Workflow That Powers Growth
                </div>
                <div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 px-5">
                        <div>
                            <div className="sa-process_left">
                                {
                                    workflowSteps?.map((step, index) => (
                                        <div key={index} className={`process-item process-item--${index === 0 ? 'one' : index === 1 ? 'two' : index === 2 ? 'three' : 'four'}`}>
                                            <div className="xb-item--icon">
                                                <img src={step.icon} alt="" />
                                            </div>
                                            <h4 className="xb-item--title text-black">{step.title}</h4>
                                            <p className="xb-item--contact">
                                                {step.description}
                                            </p>
                                            <span className="xb-item--number">{step.number}</span>
                                        </div>
                                    ))
                                }

                                {/* <div className="process-item process-item--two">
                                    <div className="xb-item--icon">
                                        <img src="/assets/img/icon/user-icon.html" alt="" />
                                    </div>
                                    <h4 className="xb-item--title">Set up your team</h4>
                                    <p className="xb-item--contact">
                                        Assemble a skilled team aligned with your business goals and objectives.
                                    </p>
                                    <span className="xb-item--number">02</span>
                                </div>

                                <div className="process-item process-item--three">
                                    <div className="xb-item--icon">
                                        <img src="/assets/img/icon/clipboar02.html" alt="" />
                                    </div>
                                    <h4 className="xb-item--title">Create a game plan</h4>
                                    <p className="xb-item--contact">
                                        Develop a detailed strategy objectives, audiences, and marketing approaches.
                                    </p>
                                    <span className="xb-item--number">03</span>
                                </div>

                                <div className="process-item process-item--four">
                                    <div className="xb-item--icon">
                                        <img src="/assets/img/icon/medal-star.html" alt="" />
                                    </div>
                                    <h4 className="xb-item--title">Review and scale</h4>
                                    <p className="xb-item--contact">
                                        Analyze performance metrics regularly to optimize and grow your strategy effectively.
                                    </p>
                                    <span className="xb-item--number">04</span>
                                </div> */}
                            </div>
                        </div>

                        <div className="hidden lg:block">
                            <div className="sa-process_right">
                                <div
                                    className="sa-process-image wow fadeInRight"
                                    data-wow-duration="600ms"
                                >
                                    <img className="updown" src="/images/landingpage/Word _CRM.png" alt="" />
                                </div>
                                <div className="process_shape">
                                    <img src="/assets/img/shape/pattern.html" alt="" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WorkingProcess;