import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons'

import Main from "./pages/landingPage/main";
import PageNotFound from "./components/pageNotFound/pageNotFound";
import PricingSection from "./pages/landingPage/pricingSection";
import MuiThemeProvider from "./components/common/muiTheme/muiTheme";
import GlobalAlert from "./components/common/alert/globalAlert";
import Register from "./pages/auth/register/register";
import Loader from "./components/loader/loader";
import Login from "./pages/auth/login/login";
import ForgotPassword from "./pages/auth/forgotPassword/forgotPassword";
import ResetPassword from "./pages/auth/resetPassword/resetPassword";
import Layout from "./pages/dashboard/layout";
import { useEffect, useState } from "react";
import { setLoading } from "./redux/commonReducers/commonReducers";
import { connect } from "react-redux";
import Opportunities from "./pages/dashboard/opportunities/opportunities";
import Contacts from "./pages/dashboard/contacts/contacts";
import Crm from "./pages/crm/crm";
import UserProfile from "./pages/dashboard/userProfile/userProfile";
import SubUserRegister from "./pages/auth/subUserRegister/subUserRegister";
import SyncHistory from "./pages/dashboard/syncHistory/syncHistory";
import ManageTeam from "./pages/myTeam/manageTeam";
import AddTeamMembers from "./pages/myTeam/addTeamMembers";
import ManageMembers from "./pages/members/manageMembers";
import AddMemberRoles from "./pages/members/addMemberRoles";
import Accounts from "./pages/dashboard/accounts/accounts";
import Todo from "./pages/dashboard/todo/todo";
import ManageMails from "./pages/mailScraper/manageMails";
import Products from "./pages/dashboard/products/products";
import ViewOpportunity from "./pages/dashboard/opportunities/viewOpportunity";
import Calendar from "./pages/dashboard/calendar/Calendar";
import GoogleCalendarOAuthRedirect from "./pages/dashboard/calendar/GoogleCalendarOAuthRedirect";
import OutlookCalendarOauthRedirect from "./pages/dashboard/calendar/outlookCalendarOauthRedirect";
import Closeplan from "./pages/closeplan/closeplan";
import Results from "./pages/dashboard/results/results";
import Activities from "./pages/dashboard/activities/activities";
import Performance from "./pages/dashboard/performance/performance";
import Support from "./pages/landingPage/support";
import DealManagement from "./pages/dashboard/dealManagement/dealManagement";
import Privacy from "./pages/privacy/Privacy";
import ManageApps from "./pages/dashboard/manageApps/manageApps";

library.add(fas, far, fab)

const App = ({ setLoading }) => {
  const router = createBrowserRouter([
    {
      path: "*",
      element: <PageNotFound />,
    },
    {
      path: "/",
      element: <Main />,
    },
    {
      path: "/pricing",
      element: <PricingSection />,
    },
    {
      path: "/support",
      element: <Support />,
    },
    {
      path: "/privacy",
      element: <Privacy />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/subaccountactivesetup/:token",
      element: <SubUserRegister />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/forgotpassword",
      element: <ForgotPassword />,
    },
    {
      path: "/resetpassword/:token",
      element: <ResetPassword />,
    },
    {
      path: "googlecalendaroauthredirect",
      element: <GoogleCalendarOAuthRedirect />
    },
    {
      path: "outlookcalendaroauthredirect",
      element: <OutlookCalendarOauthRedirect />
    },
    {
      path: "closeplan/:token",
      element: <Closeplan />
    },
    {
      path: "/dashboard",
      element: <Layout />,
      children: [
        {
          path: "accounts",
          element: <Accounts />,
        },
        {
          path: "opportunities",
          element: <Opportunities />,
        },
        {
          path: "opportunity-view/:opportunityId",
          element: <ViewOpportunity />,
        },
        {
          path: "contacts",
          element: <Contacts />,
        },
        {
          path: "mycrm",
          element: <Crm />,
        },
        {
          path: "profile",
          element: <UserProfile />,
        },
        {
          path: "syncHistory",
          element: <SyncHistory />,
        },
        {
          path: "myteam",
          element: <ManageTeam />,
        },
        {
          path: "myteam/create",
          element: <AddTeamMembers />,
        },
        {
          path: "myteam/edit/:id",
          element: <AddTeamMembers />,
        },
        {
          path: "members",
          element: <ManageMembers />,
        },
        {
          path: "members/add",
          element: <AddMemberRoles />,
        },
        {
          path: "members/edit/:id",
          element: <AddMemberRoles />,
        },
        {
          path: "todos",
          element: <Todo />,
        },
        {
          path: "managemails",
          element: <ManageMails />,
        },
        {
          path: "products",
          element: <Products />,
        },
        {
          path: "calendar",
          element: <Calendar />,
        },
        {
          path: "manageapps",
          element: <ManageApps />,
        },
        {
          path: "results",
          element: <Results />,
        },
        {
          path: "activities",
          element: <Activities />,
        },
        {
          path: "performance",
          element: <Performance />,
        },
        {
          path: "deals",
          element: <DealManagement />,
        },
      ],
    },
  ])

  const [bootLoading, setBootLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
      setBootLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (bootLoading) {
    return <div className="h-screen">
      <Loader />
    </div>;
  }

  return (
    <>
      <MuiThemeProvider>
        <div className="min-h-screen">
          <Loader />
          <GlobalAlert />
          <RouterProvider router={router} fallbackElement={<Loader />} />
        </div>
      </MuiThemeProvider>
    </>
  )
}

const mapDispatchToProps = {
  setLoading,
}

export default connect(null, mapDispatchToProps)(App);