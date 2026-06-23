const SalesWorkflowSection = () => (
  <section className="relative flex justify-between 4k:justify-center items-center py-12">
    <div className="max-w-xl">
      <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-black" style={{ lineHeight: 1.2 }}>
        Revolutionize Your <br />
        Sales Workflow with <br />
        <span className="text-[#44288E]">360Pipe</span> CRM
      </h1>

      <p className="text-2xl font-semibold text-gray-600 mb-6">
        Manage your entire sales pipeline with smart tools for client tracking, performance monitoring, and deal closure — all in one place.
      </p>

      <ul className="mb-8 space-y-2">
        <li className="flex items-center text-black">
          <span className="font-bold mr-2">✓</span>
          Centralized Customer & Lead Management
        </li>
        <li className="flex items-center text-black">
          <span className="font-bold mr-2">✓</span>
          Visual Sales Pipeline & Deal Tracking
        </li>
        <li className="flex items-center text-black">
          <span className="font-bold mr-2">✓</span>
          Real-time Performance & Conversion Insights
        </li>
      </ul>

      <button
        type="button"
        className="relative px-5 py-3 rounded group overflow-hidden font-medium text-[#44288E] border border-[#44288E]"
      >
        <span className="absolute bottom-0 left-0 w-full h-0 transition-all duration-300 ease-out bg-[#44288E] group-hover:h-full"></span>

        <span className="relative z-10 transition-colors duration-300 group-hover:text-white text-lg font-bold">
          Schedule Your Free Demo
        </span>
      </button>

      {/* <div className="absolute inset-0 inset-y-[35rem] z-30">
          <div className="mt-16 md:mt-10 flex flex-col items-center justify-end space-y-1">
            <CustomIcons iconName={'fa-solid fas fa-chevron-down'} css='cursor-pointer text-[#44288E]' />
            <CustomIcons iconName={'fa-solid fas fa-chevron-down'} css='cursor-pointer text-[#44288E]' />
            <CustomIcons iconName={'fa-solid fas fa-chevron-down'} css='cursor-pointer text-[#44288E]' />
          </div>
        </div> */}
    </div>
    <div className="relative mt-12 md:mt-0">
      <div className="hidden pt-20 lg:p-0 md:block relative z-10 h-[637px]">
        <img
          src="/images/landingpage/hero-img02.png"
          alt="Person using laptop"
          width={632}
          className="rounded-xl"
        />
      </div>
    </div>
  </section>
);

export default SalesWorkflowSection;