import { calendarAppointmentEventTypeURL } from "../../../config/config";
import axiosInterceptor from "../../axiosInterceptor/axiosInterceptor"

export const saveAppointmentEventType = async (id = null, data) => {
    try {
        const response = await axiosInterceptor().post(`${calendarAppointmentEventTypeURL}/saveEventType${id !== null ? `?id=${id}` : ''}`, data);
        return response.data;
    } catch (error) {
        console.error("Error save EventType:", error);
        throw error;
    }
};

export const getAllEventTypeList = async (id = null) => {
    try {
        const response = await axiosInterceptor().get(`${calendarAppointmentEventTypeURL}/get/all${id ? `?id=${id}` : ''}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching EventType:", error);
        throw error;
    }
};

export const getEventTypeList = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${calendarAppointmentEventTypeURL}/get/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching EventType:", error);
        throw error;
    }
};

export const deleteEventType = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${calendarAppointmentEventTypeURL}/deleteEventType/${id}`)
        return response.data;
    } catch (error) {
        console.error("Error delete EventType:", error);
        throw error;
    }
}