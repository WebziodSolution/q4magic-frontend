import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs } from '../../../components/common/tabs/tabs';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import CalendarAppointmentEventType from './calendarAppointmentEventType/calendarAppointmentEventType';
import CalendarAvailability from './calendarAvailability/calendarAvailability';
import CalendarGeneralSetting from './calendarGeneralSetting/calendarGeneralSetting';

const CalendarSetting = () => {
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState(0);

    const tabsData = [
        {
            label: 'APPOINTMENT EVENT TYPE',
            component: <CalendarAppointmentEventType />
        },
        {
            label: 'AVAILABILITY',
            component: <CalendarAvailability />
        },
        {
            label: 'GENERAL SETTINGS',
            component: <CalendarGeneralSetting />
        }
    ];

    const handleChangeTab = (index) => {
        setSelectedTab(index);
    };

    return (
        <div className="bg-gray-50">
            {/* Header with Back Arrow and Title */}
            <div className="flex items-center gap-3 mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors flex items-center justify-center border-none bg-transparent cursor-pointer"
                    aria-label="Back"
                >
                    <CustomIcons iconName="fa-solid fa-arrow-left" css="text-gray-700 text-lg" />
                </button>
                <h1 className="text-lg lg:text-2xl font-bold text-gray-800">My Calendar Settings</h1>
            </div>

            {/* Split layout: Vertical tabs on left, tab components on right */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <Tabs
                        tabsData={tabsData}
                        selectedTab={selectedTab}
                        handleChange={handleChangeTab}
                        orientation="vertical"
                        fontSize="15px"
                    />
                </div>
                <div className={`md:col-span-10 min-h-[400px] ${selectedTab === 2 ? "" : "bg-white p-6 rounded-lg shadow-sm border border-gray-200"}`}>
                    {tabsData[selectedTab]?.component}
                </div>
            </div>
        </div>
    );
};

export default CalendarSetting;