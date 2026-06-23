import { actionURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllActions = async () => {
    try {
        const response = await axiosInterceptor().get(`${actionURL}/getAllActions`);
        return response.data;
    } catch (error) {
        console.error("Error fetching actions:", error);
        throw error;
    }
};