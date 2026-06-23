import { teamMembersURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllTeamMembers = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${teamMembersURL}/get/all/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getTeamMembers = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${teamMembersURL}/get/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createTeamMembers = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${teamMembersURL}/create`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateTeamMembers = async (id, data) => {
    try {
        const response = await axiosInterceptor().patch(`${teamMembersURL}/update/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteTeamMembers = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${teamMembersURL}/delete/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const assignOpportunitiesToTeamMember = async (id, data) => {
    try {
        const response = await axiosInterceptor().patch(`${teamMembersURL}/assignOpp/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};