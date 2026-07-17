import { useEffect, useState } from "react";
import { getAllSubscriptionRates } from "../../service/subscriptionRates/subscriptionRatesService";
import Header from "./header";
import { NavLink, useNavigate } from "react-router-dom";

const PricingSection = () => {
  const navigate = useNavigate();
  const [subscriptionRates, setSubscriptionRates] = useState([])
  const handlePlanSelection = (id) => {
    localStorage.setItem("planId", id)
    navigate("/register");
  };

  const handleGetAllSubscriptionRates = async () => {
    const res = await getAllSubscriptionRates()
    const rates = res?.result || res?.data?.result || [];
    setSubscriptionRates(rates);
  }

  useEffect(() => {
    handleGetAllSubscriptionRates()
  }, [])

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

          {/* <p className="mb-12 text-black">
            <NavLink to="" className="text-blue-600 ">
              Click here
            </NavLink>{" "}
            to use our Savings Calculator when you move all your tools to
            360Pipe.
          </p> */}

          <div className="w-full overflow-x-auto rounded-2xl border border-gray-200 shadow-md bg-white mt-8 max-w-4xl">
            <table className="w-full min-w-[600px] md:min-w-0 border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="w-1/3 p-5 text-left font-semibold text-gray-700 bg-gray-50/50 text-base">
                    Plans
                  </th>
                  {subscriptionRates?.map((plan, index) => (
                    <th
                      key={index}
                      className="p-5 text-center font-bold text-gray-900 bg-white text-lg border-l border-gray-200"
                    >
                      {plan.licenseType}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="p-5 font-medium text-gray-700 bg-gray-50/50 text-base">
                    Monthly Base Cost
                  </td>
                  {subscriptionRates?.map((plan, index) => (
                    <td
                      key={index}
                      className="p-5 text-center font-extrabold text-[#44288E] border-l border-gray-200 text-xl"
                    >
                      ${plan.amount}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-5 bg-gray-50/20"></td>
                  {subscriptionRates?.map((plan, index) => (
                    <td
                      key={index}
                      className="p-5 text-center border-l border-gray-200 bg-white"
                    >
                      <button
                        onClick={() => handlePlanSelection(plan.id)}
                        type="button"
                        className="relative px-6 py-2.5 rounded-lg group overflow-hidden font-medium bg-[#FFD600] text-[#222] shadow-md transition-all duration-300 hover:shadow-lg inline-block"
                      >
                        <span className="absolute bottom-0 left-0 w-full h-0 transition-all duration-300 ease-out bg-[#44288E] group-hover:h-full"></span>

                        <span className="relative z-10 transition-colors duration-300 group-hover:text-white text-base font-bold">
                          Choose Plan
                        </span>
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingSection;