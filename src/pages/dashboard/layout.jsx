import { useEffect } from "react"
import { Outlet, useLocation, useNavigate } from "react-router"
import { connect } from "react-redux"
import Cookies from "js-cookie"
import AlertDialog from "../../components/common/alertDialog/alertDialog"

import AppHeader from "./appHeader/appHeader"
import Dashboard from "./dashboard"
import SideBar from "./sideBar/sideBar"
import BackDrop from "./sideBar/backDrop"
import SubHeader from "./appHeader/subHeader"

const Layout = ({ sessionEndModel }) => {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!Cookies.get('authToken')) {
      const targetUrl = location.pathname + location.search;
      navigate('/login', {
        state: { from: targetUrl },
        replace: true,
      });
    }
  }, [location.pathname, location.search, navigate]);

  return (
    // overflow-hidden makes sure ONLY main scrolls (not the body/page)
    <div className="bg-[#F6F8FB] h-screen flex flex-col overflow-hidden">
      {/* Sticky Header Stack (does NOT overlap content like fixed) */}
      <div className="sticky top-0 left-0 right-0 z-50">
        <AppHeader />
        <SubHeader />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar for mobile */}
        <div className="lg:hidden">
          <SideBar />
          <BackDrop />
        </div>

        {/* Scrollable Content (ONLY this scrolls) */}
        <main className="flex-1 min-h-0 overflow-y-auto py-3">
          <div className="px-4 mx-auto">
            <Outlet />
            {location.pathname === "/dashboard" && <Dashboard />}
          </div>
        </main>
      </div>

      <AlertDialog
        open={sessionEndModel}
        title="Session Expired"
        message="Your session has expired. Please log in to continue."
        actionButtonText="Login"
        handleAction={() => navigate("/login")}
        closeIcon={false}
        cancelAction={false}
      />
    </div>
  )
}

const mapStateToProps = (state) => ({
  sessionEndModel: state.common.sessionEndModel,
})

export default connect(mapStateToProps)(Layout)
