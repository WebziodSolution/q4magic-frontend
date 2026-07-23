import { useEffect, useState } from "react";
import { Tabs } from "../../../components/common/tabs/tabs";
import CustomIcons from "../../../components/common/icons/CustomIcons";
import Profile from "./profile";
import Brand from "./brand";
import Security from "./security";
import ChangePassword from "./changePassword";
import CreditCard from "./creditCard";
import Quota from "./quota";
import { getUserDetails } from "../../../utils/getUserDetails";

const UserProfile = () => {
    const userData = getUserDetails()
    const [tabsData, setTabsData] = useState([]);
    const [selectedTab, setSelectedTab] = useState(0);
    const handleChangeTab = (value) => {

        setSelectedTab(value);
    }

    useEffect(() => {
        if (userData?.subUser) {
            setTabsData([
                {
                    label: 'Profile', icon: <CustomIcons iconName="fa-solid fa-circle-user" />, component: <Profile />
                },
                {
                    label: 'Security', icon: <CustomIcons iconName="fa-solid fa-shield-halved" />, component: <Security />
                },
                {
                    label: 'Change Password', icon: <CustomIcons iconName="fa-solid fa-lock" />, component: <ChangePassword />
                },
                {
                    label: 'Quota', icon: <CustomIcons iconName="fa-solid fa-credit-card" />, component: <Quota />
                },
            ])
        } else {
            setTabsData([
                {
                    label: 'Profile', icon: <CustomIcons iconName="fa-solid fa-circle-user" />, component: <Profile />
                },
                {
                    label: 'Brand', icon: <CustomIcons iconName="fa-solid fa-medal" />, component: <Brand />
                },
                {
                    label: 'Security', icon: <CustomIcons iconName="fa-solid fa-shield-halved" />, component: <Security />
                },
                {
                    label: 'Change Password', icon: <CustomIcons iconName="fa-solid fa-lock" />, component: <ChangePassword />
                },
                {
                    label: 'Credit Card Details', icon: <CustomIcons iconName="fa-solid fa-credit-card" />, component: <CreditCard />
                },
                {
                    label: 'Quota', icon: <CustomIcons iconName="fa-solid fa-credit-card" />, component: <Quota />
                },
            ])
        }
    }, [userData?.subUser])

    return (
        <>
            <div>
                <Tabs tabsData={tabsData} selectedTab={selectedTab} handleChange={handleChangeTab} fontSize={"16px"} />
            </div>

            <div className="mt-6">
                {tabsData[selectedTab]?.component}
            </div>
        </>
    )
}

export default UserProfile