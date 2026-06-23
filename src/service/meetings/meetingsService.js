import { meetingURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllMeetingsByOppId = async (id, timeZone) => {
    try {
        const response = await axiosInterceptor().get(`${meetingURL}/getAllByOppId?id=${id}&timeZone=${timeZone}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching meeting:", error);
        throw error;
    }
};
