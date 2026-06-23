import { syncRecordsURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllSyncRecords = async () => {
    try {
        const response = await axiosInterceptor().get(`${syncRecordsURL}/get/all`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getSyncHistory = async () => {
    try {
        const response = await axiosInterceptor().get(`${syncRecordsURL}/get/history`);
        return response.data;
    } catch (error) {
        throw error;
    }
};