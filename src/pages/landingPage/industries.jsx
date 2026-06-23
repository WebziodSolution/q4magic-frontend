import BuildingSvg from "../../assets/svgs/building.svg";

const industries = [
  { title: "SaaS", icon: "/images/landingpage/industries/img01.png" },
  { title: "Lawyers", icon: "/images/landingpage/industries/img02.png" },
  { title: "Real estate", icon: "/images/landingpage/industries/img03.png" },
  { title: "Insurance", icon: "/images/landingpage/industries/img04.png" },
  { title: "Crypto", icon: "/images/landingpage/industries/img05.png" },
  { title: "Private equity", icon: "/images/landingpage/industries/img06.png" },
  { title: "Education", icon: "/images/landingpage/industries/img07.png" },
  { title: "Finance", icon: "/images/landingpage/industries/img08.png" },
  { title: "Healthcare", icon: "/images/landingpage/industries/img09.png" },
  { title: "Automotive", icon: "/images/landingpage/industries/img10.png" },
];

const Industries = () => {
  return (
    <section className="px-4">
      <div className="relative rounded-[50px] overflow-hidden shadow-md bg-gradient-to-r from-yellow-50 via-white to-blue-50 py-12">
        <div className="max-w-6xl mx-auto text-center flex flex-col items-center px-4">
          {/* Badge */}
          <div className="flex justify-center items-center gap-2 mb-4 px-4 py-1 text-sm text-[#111112] bg-white border border-gray-200 rounded-full shadow-sm">
            <img src={BuildingSvg} alt="logo" className="w-5 h-5" />
            <span className="text-black">Industries we work</span>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-semibold text-black mb-12">
            Serving diverse industries
          </h2>

          {/* Industry Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 md:gap-8 w-full">
            {industries.map((item, idx) => (
              <div
                key={idx}
                className="group relative cursor-pointer"
              >
                {/* Card */}
                <div className="relative z-10 h-56 bg-white border border-[#E6E7EC] rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-lg transition-all duration-300 transform group-hover:scale-110">
                  <img
                    src={item.icon}
                    alt={item.title}
                    className="object-contain mb-4"
                  />
                  <p className="text-lg font-medium text-black">
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            type="button"
            className="relative mt-12 px-6 py-3 rounded-lg group overflow-hidden font-semibold text-[#44288E] border border-[#44288E]"
          >
            <span className="absolute bottom-0 left-0 w-full h-0 transition-all duration-300 ease-out bg-[#44288E] group-hover:h-full"></span>
            <span className="relative z-10 transition-colors duration-300 group-hover:text-white text-lg">
              Schedule Your Free Demo
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Industries;
