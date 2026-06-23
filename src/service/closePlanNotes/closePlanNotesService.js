import { closePlanNotesURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const saveClosePlanNote = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${closePlanNotesURL}/saveClosePlanNote`, data);
        return response.data;
    } catch (error) {
        console.error("Error save close plan note", error);
        throw error;
    }
};

export const getAllClosePlanNotes = async (closePlanId, contactId) => {
    try {
        const response = await axiosInterceptor().get(`${closePlanNotesURL}/get/all?closePlanId=${closePlanId}&contactId=${contactId}`);
        return response.data;
    } catch (error) {
        console.error("Error validateToken", error);
        throw error;
    }
};