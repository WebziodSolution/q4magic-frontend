import { emailScrapingRequestURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllScrapingRequests = async () => {
    try {
        const response = await axiosInterceptor().get(`${emailScrapingRequestURL}/get/all`);
        return response.data;
    } catch (error) {
        throw error;
    }
};


export const getScrapingRequests = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${emailScrapingRequestURL}/get/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createScrapingRequest = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${emailScrapingRequestURL}/create`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const changeStatusToActive = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${emailScrapingRequestURL}/changeStatus/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const changeScrapingMessageCount = async (id, count) => {
    try {
        const response = await axiosInterceptor().get(`${emailScrapingRequestURL}/changeScrapingMessageCount/${id}/${count}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};