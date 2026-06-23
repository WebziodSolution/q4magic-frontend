import { functionalityURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllFunctionality = async () => {
    try {
        const response = await axiosInterceptor().get(`${functionalityURL}/getAllFunctionality`);
        return response.data;
    } catch (error) {
        console.error("Error fetching functionality:", error);
        throw error;
    }
};

export const getFunctionality = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${functionalityURL}/get/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching functionality:", error);
        throw error;
    }
};

export const createFunctionality = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${functionalityURL}/create`, data);
        return response.data;
    } catch (error) {
        console.error("Error creating functionality:", error);
        throw error;
    }
};

export const updateFunctionality = async (id, data) => {
    try {
        const response = await axiosInterceptor().put(`${functionalityURL}/update/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating functionality:", error);
        throw error;
    }
};

export const deleteFunctionality = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${functionalityURL}/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting functionality:", error);
        throw error;
    }
};