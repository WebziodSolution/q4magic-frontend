import { accountURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllAccounts = async (params) => {
    try {
        const response = await axiosInterceptor().get(`${accountURL}/getall?${params ? `?${params}` : ''}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching accounts:", error);
        throw error;
    }
};

export const getAccountDetails = async (accountId) => {
    try {
        const response = await axiosInterceptor().get(`${accountURL}/get/${accountId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching account details:", error);
        throw error;
    }
};

export const createAccount = async (accountData) => {
    try {
        const response = await axiosInterceptor().post(`${accountURL}/create`, accountData);
        return response.data;
    } catch (error) {
        console.error("Error creating account:", error);
        throw error;
    }
};

export const updateAccount = async (accountId, accountData) => {
    try {
        const response = await axiosInterceptor().patch(`${accountURL}/update/${accountId}`, accountData);
        return response.data;
    } catch (error) {
        console.error("Error updating account:", error);
        throw error;
    }
};

export const deleteAccount = async (accountId) => {
    try {
        const response = await axiosInterceptor().delete(`${accountURL}/delete/${accountId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting account:", error);
        throw error;
    }
};
