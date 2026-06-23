import { meetingAttendeesURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllMeetingsAttendeesByMeetingId = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${meetingAttendeesURL}/get/all/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching attendees:", error);
        throw error;
    }
};

export const getMeetingsAttendeesById = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${meetingAttendeesURL}/get/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching attendees:", error);
        throw error;
    }
};

export const saveMeetingAttendees = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${meetingAttendeesURL}/saveMeetingAttendees`, data);
        return response.data;
    } catch (error) {
        console.error("Error save attendees:", error);
        throw error;
    }
};

export const updateMeetingAttendees = async (id, data) => {
    try {
        const response = await axiosInterceptor().patch(`${meetingAttendeesURL}/updateMeetingAttendees/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error update attendees:", error);
        throw error;
    }
};

export const deleteMeetingAttendees = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${meetingAttendeesURL}/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error delete attendees:", error);
        throw error;
    }
};