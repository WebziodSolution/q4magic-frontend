import Header from "./header";
import { NavLink, useNavigate } from "react-router-dom";

const PricingSection = () => {
  const navigate = useNavigate();

  const handlePlanSelection = () => {
    navigate("/register");
  };

  return (
    <div className="bg-gradient-to-tr from-[#f7f5e8] via-[#e6eafc] to-[#f7f5e8] min-h-screen">
      <div className='absolute z-50 w-full px-5 lg:px-20 border-b border-gray-200 shadow-sm'>
        <Header />
      </div>

      <section className="pt-24 md:pt-32 flex items-center justify-center px-5 lg:px-20">
        <div className="mx-auto px-4 w-full">

          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            For Businesses Of All Sizes
          </h2>

          <p className="mb-12 text-black">
            <NavLink to="" className="text-blue-600 ">
              Click here
            </NavLink>{" "}
            to use our Savings Calculator when you move all your tools to
            360Pipe.
          </p>

          <div className="md:bg-gray-50 md:rounded-md md:shadow overflow-hidden w-full md:w-96">
            <div className="hidden md:block">
              {/* Plan Names */}
              <div className="grid grid-cols-2 border-b">
                <div className="p-4 font-semibold text-black">Plans</div>
                <div className="p-4 text-center font-semibold border-l text-black">
                  Premium
                </div>
              </div>

              {/* Monthly Base Cost */}
              <div className="grid grid-cols-2 border-b">
                <div className="p-4 font-medium text-black">Monthly Base Cost</div>
                <div className="p-4 text-center border-l font-bold">
                  $250
                </div>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2">
                <div className="p-4"></div>
                <div className="p-4 text-center border-l">
                  <button
                    onClick={() => handlePlanSelection()}
                    type="button"
                    className="relative px-5 py-2 rounded group overflow-hidden font-medium bg-[#FFD600] text-[#222] shadow-md"
                  >
                    <span className="absolute bottom-0 left-0 w-full h-0 transition-all duration-300 ease-out bg-[#44288E] group-hover:h-full"></span>

                    <span className="relative z-10 transition-colors duration-300 group-hover:text-white text-lg font-bold">
                      Choose Plan
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="block md:hidden">
              {[
                { name: "Pay As You Go", price: "$0" }
              ].map((plan, index) => (
                <div
                  key={index}
                  className="bg-white border rounded-md shadow-sm p-6 mb-4 text-center"
                >
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{plan.name}</h3>
                  <p className="text-2xl font-bold text-gray-900 mb-4">{plan.price}</p>
                  <button
                    onClick={() => handlePlanSelection()}
                    className="bg-[#FFD600] px-5 py-2 rounded font-bold hover:bg-[#44288E] hover:text-white transition"
                  >
                    Choose Plan
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default PricingSection;