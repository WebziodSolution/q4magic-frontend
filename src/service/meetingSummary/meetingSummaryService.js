import { meetingSummaryURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getMeetingSummaryByOppId = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${meetingSummaryURL}/getByOppId/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching meeting:", error);
        throw error;
    }
};
