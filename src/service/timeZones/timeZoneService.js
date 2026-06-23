import { timeZonesURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getTimeZones = async () => {
    try {
        const response = await axiosInterceptor().get(`${timeZonesURL}/get/all`);
        return response.data;
    } catch (error) {
        throw error;
    }
};