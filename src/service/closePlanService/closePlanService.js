import { closeplanURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const saveClosePlan = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${closeplanURL}/saveClosePlan`, data);
        return response.data;
    } catch (error) {
        console.error("Error create close plan", error);
        throw error;
    }
};

export const validateToken = async (token) => {
    try {
        const response = await axiosInterceptor().get(`${closeplanURL}/validateToken?token=${token}`);
        return response.data;
    } catch (error) {
        console.error("Error validateToken", error);
        throw error;
    }
};

export const changeClosePlanStatus = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${closeplanURL}/changeStatus/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error change staus", error);
        throw error;
    }
};

export const getClosePlanByOppIdAndStatus = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${closeplanURL}/getClosePlanByStatus/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetch closeplan", error);
        throw error;
    }
};

export const getClosePlanByOppId = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${closeplanURL}/getClosePlanByOppId/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetch closeplan", error);
        throw error;
    }
};