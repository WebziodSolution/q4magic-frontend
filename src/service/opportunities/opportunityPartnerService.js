import { opportunityPartnerURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllOpportunitiesPartner = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${opportunityPartnerURL}/get/all/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching opportunities partner:", error);
        throw error;
    }
};

export const getOpportunitiesPartner = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${opportunityPartnerURL}/get/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching opportunity partner details:", error);
        throw error;
    }
};

export const createOpportunitiesPartner = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${opportunityPartnerURL}/create`, data);
        return response.data;
    } catch (error) {
        console.error("Error creating opportunity partner:", error);
        throw error;
    }
};

export const updateOpportunitiesPartner = async (id, data) => {
    try {
        const response = await axiosInterceptor().patch(`${opportunityPartnerURL}/update/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating opportunity partner:", error);
        throw error;
    }
};

export const deleteOpportunitiesPartner = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${opportunityPartnerURL}/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting opportunity partner:", error);
        throw error;
    }
};
