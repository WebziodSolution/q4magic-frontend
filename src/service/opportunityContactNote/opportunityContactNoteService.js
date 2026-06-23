import { opportunitiesContactNoteURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllOpportunitiesContactNotes = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${opportunitiesContactNoteURL}/get/all/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getOpportunitiesContactNotes = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${opportunitiesContactNoteURL}/get/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteOpportunitiesContactNotes = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${opportunitiesContactNoteURL}/delete/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};