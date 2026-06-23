import { tempMailURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllTempMails = async () => {
    try {
        const response = await axiosInterceptor().get(`${tempMailURL}/get/all`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getMailByGroup = async () => {
    try {
        const response = await axiosInterceptor().get(`${tempMailURL}/getAllByGroup `);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getTempMail = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${tempMailURL}/get/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createMail = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${tempMailURL}/create`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateMail = async (id, data) => {
    try {
        const response = await axiosInterceptor().patch(`${tempMailURL}/update/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteMail = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${tempMailURL}/delete/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteMailInbox = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${tempMailURL}/deleteInbox/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteAllMails = async (ids) => {
    try {
        const response = await axiosInterceptor().post(`${tempMailURL}/delete/all`, ids);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteAllMailsByRequestId = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${tempMailURL}/deleteByRequestId/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteByRequestIdInbox = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${tempMailURL}/deleteByRequestIdInbox/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteAllMailsInbox = async (ids) => {
    try {
        const response = await axiosInterceptor().post(`${tempMailURL}/delete/all/inbox`, ids);
        return response.data;
    } catch (error) {
        throw error;
    }
};