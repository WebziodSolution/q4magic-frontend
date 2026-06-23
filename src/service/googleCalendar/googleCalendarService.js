import { googleCalendarURL } from "../../config/config";
import { getUserDetails } from "../../utils/getUserDetails";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const handleConnectGoogle = async () => {
    try {
        const userInfo = getUserDetails()
        const id = userInfo?.userId
        const response = await axiosInterceptor().get(`${googleCalendarURL}/auth-url?customerId=${id}`);
        return response.data;
    } catch (error) {
        console.error("Error connect to google calendar:", error);
        throw error;
    }
};

export const oauth2CallbackGoogleCalendar = async (code, state) => {
    try {
        const response = await axiosInterceptor().get(`/google-calendar/oauth2/callback?code=${code}&state=${state}`);
        return response.data;
    } catch (error) {
        console.error('Failed to handle OAuth callback:', error);
        throw error;
    }
};

export const getGoogleCalendarEvents = async (timeMin, timeMax) => {
    try {
        const response = await axiosInterceptor().get(
            `/google-calendar/events?timeMin=${timeMin}&timeMax=${timeMax}`
        );
        return response.data;
    } catch (error) {
        console.error('Failed to get Google Calendar events:', error);
        throw error;
    }
};

export const getCalendarAuthentication = async () => {
    try {
        const response = await axiosInterceptor().get(`${googleCalendarURL}/getCalendarAuthentication`);
        return response.data;
    } catch (error) {
        console.error("Error to get calendar authentication:", error);
        throw error;
    }
};