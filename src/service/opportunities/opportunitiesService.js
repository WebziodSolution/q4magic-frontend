import { opportunityURL, opportunitiesDocumentsURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getOpportunityOptions = async () => {
    try {
        const response = await axiosInterceptor().get(`${opportunityURL}/get/all/options`);
        return response.data;
    } catch (error) {
        console.error("Error fetching opportunities:", error);
        throw error;
    }
};

export const getAllOpportunities = async (params) => {
    try {
        const response = await axiosInterceptor().get(`${opportunityURL}/get/all${params ? `?${params}` : ''}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching opportunities:", error);
        throw error;
    }
};

export const getAllOpportunitiesGroupedByStage = async (params) => {
    try {
        const response = await axiosInterceptor().get(`${opportunityURL}/get/allByGroup${params ? `?${params}` : ''}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching opportunities:", error);
        throw error;
    }
};

export const getOpportunityDetails = async (opportunityId) => {
    try {
        const response = await axiosInterceptor().get(`${opportunityURL}/get/${opportunityId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching opportunity details:", error);
        throw error;
    }
};

export const createOpportunity = async (opportunityData) => {
    try {
        const response = await axiosInterceptor().post(`${opportunityURL}/create`, opportunityData);
        return response.data;
    } catch (error) {
        console.error("Error creating opportunity:", error);
        throw error;
    }
};

export const updateOpportunity = async (opportunityId, opportunityData) => {
    try {
        const response = await axiosInterceptor().patch(`${opportunityURL}/update/${opportunityId}`, opportunityData);
        return response.data;
    } catch (error) {
        console.error("Error updating opportunity:", error);
        throw error;
    }
};

export const updateOpportunitiesDealAmount = async (opportunityId, opportunityData) => {
    try {
        const response = await axiosInterceptor().patch(`${opportunityURL}/updatedealamount/${opportunityId}`, opportunityData);
        return response.data;
    } catch (error) {
        console.error("Error updating opportunity:", error);
        throw error;
    }
};

export const updateOpportunityLogo = async (opportunityData) => {
    try {
        const response = await axiosInterceptor().post(`${opportunityURL}/uploadOpportunityLogo`, opportunityData);
        return response.data;
    } catch (error) {
        console.error("Error updating opportunity:", error);
        throw error;
    }
};

export const deleteOpportunity = async (opportunityId) => {
    try {
        const response = await axiosInterceptor().delete(`${opportunityURL}/delete/${opportunityId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting opportunity:", error);
        throw error;
    }
};

export const deleteOpportunityLogo = async (opportunityId) => {
    try {
        const response = await axiosInterceptor().delete(`${opportunityURL}/deleteLogo/${opportunityId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting opportunity logo:", error);
        throw error;
    }
};

export const deleteOpportunitiesDocs = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${opportunitiesDocumentsURL}/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting opportunity docs:", error);
        throw error;
    }
};

export const updateOpportunitiesDocs = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${opportunitiesDocumentsURL}/update/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error update opportunity docs:", error);
        throw error;
    }
};