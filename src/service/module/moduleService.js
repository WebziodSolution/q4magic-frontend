import { moduleURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllModules = async () => {
    try {
        const response = await axiosInterceptor().get(`${moduleURL}/getAllModules`);
        return response.data;
    } catch (error) {
        console.error("Error fetching functionality:", error);
        throw error;
    }
};

export const getModule = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${moduleURL}/get/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching module:", error);
        throw error;
    }
};

export const createModule = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${moduleURL}/create`, data);
        return response.data;
    } catch (error) {
        console.error("Error creating module:", error);
        throw error;
    }
};

export const updateModule = async (id, data) => {
    try {
        const response = await axiosInterceptor().put(`${moduleURL}/update/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating module:", error);
        throw error;
    }
};

export const deleteModule = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${moduleURL}/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting module:", error);
        throw error;
    }
};