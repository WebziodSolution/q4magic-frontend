import { notesURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getNote = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${notesURL}/get/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching note:", error);
        throw error;
    }
};

export const saveNote = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${notesURL}/saveNote`, data);
        return response.data;
    } catch (error) {
        console.error("Error creating note:", error);
        throw error;
    }
};

export const updateNote = async (id, data) => {
    try {
        const response = await axiosInterceptor().patch(`${notesURL}/updateNote/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating note:", error);
        throw error;
    }
};

export const deleteNote = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${notesURL}/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting note:", error);
        throw error;
    }
};

export const getByMeetingId = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${notesURL}/getByMeetingId/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting note:", error);
        throw error;
    }
};