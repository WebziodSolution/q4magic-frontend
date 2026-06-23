import { calendarURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const saveEvents = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${calendarURL}/saveEvent`, data);
        return response.data;
    } catch (error) {
        console.error("Error fetching actions:", error);
        throw error;
    }
};

export const getEventList = async (params) => {
    try {
        const response = await axiosInterceptor().get(`${calendarURL}/get/all?${params}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching actions:", error);
        throw error;
    }
};

export const getEventById = async (userTimeZone, id) => {
    try {
        const response = await axiosInterceptor().get(`${calendarURL}/get/${id}?timeZone=${userTimeZone}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching actions:", error);
        throw error;
    }
};

export const getSync = async (userTimeZone) => {
    try {
        const response = await axiosInterceptor().get(`${calendarURL}/getSync?timeZone=${userTimeZone}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching actions:", error);
        throw error;
    }
};

export const deleteEvent = async (data) => {
    try {
        const response = await axiosInterceptor().post(calendarURL + `/deleteEvent`, data).then(res => res)
        return response.data;
    } catch (error) {
        console.error("Error fetching actions:", error);
        throw error;
    }
}