import { opportunitiesNotesURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getNotesByOppId = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${opportunitiesNotesURL}/get/all/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getNotesById = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${opportunitiesNotesURL}/get/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const saveOppNotes = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${opportunitiesNotesURL}/saveComment`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateOppNotes = async (id, data) => {
    try {
        const response = await axiosInterceptor().patch(`${opportunitiesNotesURL}/updateComment/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteOppNotes = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${opportunitiesNotesURL}/delete/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};