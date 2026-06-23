import { crmURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllCRM = async () => {
    try {
        const response = await axiosInterceptor().get(`${crmURL}/getAllCRMs`);
        return response.data;
    } catch (error) {
        console.error("Error fetching CRM data:", error);
        throw error;
    }
};

export const getCRM = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${crmURL}/get/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching CRM data:", error);
        throw error;
    }
};
