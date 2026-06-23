import { processNameURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllProcessNameByOpportunity = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${processNameURL}/get/all/by-opportunity/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching process-name:", error);
        throw error;
    }
};

export const getAllProcessNameByCustomer = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${processNameURL}/get/all/by-customer/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching process-name:", error);
        throw error;
    }
};

export const getProcessName = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${processNameURL}/get/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching process-name:", error);
        throw error;
    }
};

export const createProcessName = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${processNameURL}/create`, data);
        return response.data;
    } catch (error) {
        console.error("Error fetching process-name:", error);
        throw error;
    }
};

export const updateProcessName = async (id, data) => {
    try {
        const response = await axiosInterceptor().patch(`${processNameURL}/update/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error fetching process-name:", error);
        throw error;
    }
};

export const deleteProcessName = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${processNameURL}/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching process-name:", error);
        throw error;
    }
};