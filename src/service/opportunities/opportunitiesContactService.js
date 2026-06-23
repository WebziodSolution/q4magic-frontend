import { opportunitiesContactURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllOpportunitiesContact = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${opportunitiesContactURL}/get/all/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const addOpportunitiesContact = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${opportunitiesContactURL}/create`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateOpportunitiesContact = async (data) => {
    try {
        const response = await axiosInterceptor().patch(`${opportunitiesContactURL}/update`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteOpportunitiesContact = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${opportunitiesContactURL}/delete/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};