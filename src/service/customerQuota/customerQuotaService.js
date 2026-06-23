import { customerQuotaURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllCustomerQuotas = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${customerQuotaURL}/getAllQuotas/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching customer quotas:", error);
        throw error;
    }
};

export const getQuota = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${customerQuotaURL}/getQuota/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching customer quota data:", error);
        throw error;
    }
};

export const createQuota = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${customerQuotaURL}/create`, data);
        return response.data;
    } catch (error) {
        console.error("Error fetching customer quota data:", error);
        throw error;
    }
};

export const updateQuota = async (id, data) => {
    try {
        const response = await axiosInterceptor().patch(`${customerQuotaURL}/update/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error fetching customer quota data:", error);
        throw error;
    }
};

export const deleteQuota = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${customerQuotaURL}/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching customer quota data:", error);
        throw error;
    }
};