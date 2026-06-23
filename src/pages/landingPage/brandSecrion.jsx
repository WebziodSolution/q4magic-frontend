const BrandSection = () => {
  return (
    <section className="py-12">
      <div className="w-full flex flex-col items-center gap-16">
        <div className="w-full relative flex flex-col items-center">
          <div className="absolute top-5 left-0 w-full h-px bg-gray-200"></div>
          <div className="px-6 py-2 bg-white border border-gray-200 rounded-full relative z-10">
            <span className="text-gray-600 text-lg font-medium">
              Trusted by{" "}
            </span>
            <span className="text-gray-900 text-lg font-bold">50+</span>
            <span className="text-gray-600 text-lg font-medium">
              {" "}
              teams to empower{" "}
            </span>
            <span className="text-gray-900 text-lg font-bold">20,000+</span>
            <span className="text-gray-600 text-lg font-medium"> Pipelines</span>
          </div>
        </div>

        {/* Logos */}      
        <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-20 4k:flex 4k:justify-center flex-wrap">
          <img
            className="h-8 w-40"
            src="/images/landingpage/brands/brand-logo1.png"
            alt="Brand 1"
          />
          <img
            className="h-8 w-40"
            src="/images/landingpage/brands/brand-logo2.png"
            alt="Brand 2"
          />
          <img
            className="h-8 w-40"
            src="/images/landingpage/brands/brand-logo3.png"
            alt="Brand 3"
          />
          <img
            className="h-8 w-40"
            src="/images/landingpage/brands/brand-logo4.png"
            alt="Brand 4"
          />
          <img
            className="h-8 w-40"
            src="/images/landingpage/brands/brand-logo5.png"
            alt="Brand 5"
          />
          <img
            className="h-8 w-40"
            src="/images/landingpage/brands/brand-logo6.png"
            alt="Brand 6"
          />
        </div>
      </div>
    </section>
  );
};

export default BrandSection;
