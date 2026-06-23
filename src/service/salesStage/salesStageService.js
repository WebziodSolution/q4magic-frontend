import { salesStageURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllSalesStages = async () => {
    try {
        const response = await axiosInterceptor().get(`${salesStageURL}/get/all`);
        return response.data;
    } catch (error) {
        console.error("Error fetching sales-stages:", error);
        throw error;
    }
};