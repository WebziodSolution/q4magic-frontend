import { subUserTypeURL } from "../../config/config"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllSubUserTypes = async () => {
    try {
        const response = await axiosInterceptor().get(`${subUserTypeURL}/get/all`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getSubUserTypes = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${subUserTypeURL}/get/${id}`)
        return response

    } catch (error) {
        console.log(error)
        throw error
    }
}

export const getActionsBySubUserType = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${subUserTypeURL}/getActions/${id}`)
        return response

    } catch (error) {
        console.log(error)
        throw error
    }
}

export const createSubUserType = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${subUserTypeURL}/create`, data)
        return response

    } catch (error) {
        console.log(error)
        throw error
    }
}

export const updateSubUserType = async (id,data) => {
    try {
        const response = await axiosInterceptor().patch(`${subUserTypeURL}/update/${id}`, data)
        return response

    } catch (error) {
        console.log(error)
        throw error
    }
}

export const deleteSubUserType = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${subUserTypeURL}/delete/${id}`)
        return response

    } catch (error) {
        console.log(error)
        throw error
    }
}

export const createSubUserTypes = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${subUserTypeURL}/create/all`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}