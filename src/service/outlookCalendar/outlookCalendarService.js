import { outlookCalendarUrl } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const outlookCalendarOauth = async (data) => {
    try {
        const response = await axiosInterceptor().get(`${outlookCalendarUrl}/oauth${data}`);
        return response.data;
    } catch (error) {
        console.error("Error connect to outlook calendar:", error);
        throw error;
    }
};

export const revokeOutlookCalendar = async () => {
    try {
        const response = await axiosInterceptor().get(`${outlookCalendarUrl}/revoke`);
        return response.data;
    } catch (error) {
        console.error("Error revoking Outlook calendar:", error);
        throw error;
    }
};