import { salesProcessURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllBySalesOpportunity = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${salesProcessURL}/get/all/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching sales-process:", error);
        throw error;
    }
};

export const getSalesProcess = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${salesProcessURL}/get/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching sales-process:", error);
        throw error;
    }
};

export const createSalesProcess = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${salesProcessURL}/create`, data);
        return response.data;
    } catch (error) {
        console.error("Error fetching sales-process:", error);
        throw error;
    }
};

export const updateSalesProcess = async (id, data) => {
    try {
        const response = await axiosInterceptor().patch(`${salesProcessURL}/update/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error fetching sales-process:", error);
        throw error;
    }
};

export const deleteSalesProcess = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${salesProcessURL}/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching sales-process:", error);
        throw error;
    }
};