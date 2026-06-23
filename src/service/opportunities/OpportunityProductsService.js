import { opportunitiesProductURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllOpportunitiesProducts = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${opportunitiesProductURL}/get/all/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getOpportunitiesProducts = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${opportunitiesProductURL}/get/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createOpportunitiesProducts = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${opportunitiesProductURL}/create`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateOpportunitiesProducts = async (id, data) => {
    try {
        const response = await axiosInterceptor().patch(`${opportunitiesProductURL}/update/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteOpportunitiesProducts = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${opportunitiesProductURL}/delete/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};