import { calendarAppointmentURL } from "../../../config/config";
import axiosInterceptor from "../../axiosInterceptor/axiosInterceptor"

export const saveAvailabilitySlots = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${calendarAppointmentURL}/saveAvailabilitySlots`, data);
        return response.data;
    } catch (error) {
        console.error("Error saving availability slots:", error);
        throw error;
    }
};

export const getAvailabilitySlotsList = async (cusId) => {
    try {
        const response = await axiosInterceptor().get(`${calendarAppointmentURL}/getAvailabilitySlotsList/${cusId}`);
        return response.data;
    } catch (error) {
        console.error("Error get availability slots:", error);
        throw error;
    }
};

export const freeSlotList = async (userTimeZone, data) => {
    try {
        const response = await axiosInterceptor().post(`${calendarAppointmentURL}/freeSlotList?userTimeZone=${userTimeZone}`, data);
        return response.data;
    } catch (error) {
        console.error("Error get freeSlotList:", error);
        throw error;
    }
};

export const sendEmailAppointmentLink = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${calendarAppointmentURL}/sendEmailAppointmentLink`, data);
        return response.data;
    } catch (error) {
        console.error("Error send email appointment link:", error);
        throw error;
    }
};

export const saveAppointment = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${calendarAppointmentURL}/saveAppointment`, data);
        return response.data;
    } catch (error) {
        console.error("Error save appointment:", error);
        throw error;
    }
};