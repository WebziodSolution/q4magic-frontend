import { opportunitiesCurrentEnvironmentURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getOpportunitiesCurrentEnvironmentByOppId = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${opportunitiesCurrentEnvironmentURL}/get/all/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getOpportunitiesCurrentEnvironment = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${opportunitiesCurrentEnvironmentURL}/get/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const addOpportunitiesCurrentEnvironment = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${opportunitiesCurrentEnvironmentURL}/save`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateOpportunitiesCurrentEnvironment = async (id, data) => {
    try {
        const response = await axiosInterceptor().patch(`${opportunitiesCurrentEnvironmentURL}/update/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteOpportunitiesCurrentEnvironment = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${opportunitiesCurrentEnvironmentURL}/delete/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};