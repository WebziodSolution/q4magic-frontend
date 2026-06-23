import React, { useEffect, useState } from 'react'
import { setAlert } from '../../redux/commonReducers/commonReducers';
import { connect } from 'react-redux';
import { Tabs } from '../../components/common/tabs/tabs';
import Members from './members';
import MemberRolesList from './memberRolesList';
import { getUserDetails } from '../../utils/getUserDetails';

const ManageMembers = () => {
    const userdata = getUserDetails();
    const [tabsData, setTabsData] = useState([]);

    const [selectedTab, setSelectedTab] = useState(0);

    const handleChangeTab = (value) => {
        setSelectedTab(value);
    }

    useEffect(() => {
        if (userdata?.roleName?.toLowerCase() === 'sales representative' || userdata?.roleName?.toLowerCase() === 'sales manager' || userdata?.rolename === "Sales Representative") {
            setTabsData([
                {
                    label: 'Members'
                },
                {
                    label: 'Member Roles'
                },
            ])
        } else {
            setTabsData([
                {
                    label: 'Members'
                },
            ])
        }
    }, [])
    return (
        <>
            <div>
                <Tabs tabsData={tabsData} selectedTab={selectedTab} handleChange={handleChangeTab} fontSize={"16px"} />
            </div>

            <div className="mt-2">
                {
                    selectedTab === 0 && <Members />
                }
                {
                    selectedTab === 1 && <MemberRolesList />
                }
            </div>
        </>
    )
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(ManageMembers)