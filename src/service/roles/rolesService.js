import { rolesURL } from "../../config/config"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const addRole = async (data) => {
    try {
        const response = axiosInterceptor().post(`${rolesURL}/create`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const updateRole = async (id, data) => {
    try {
        const response = axiosInterceptor().patch(`${rolesURL}/update/${id}`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getRole = async (id) => {
    try {
        const response = axiosInterceptor().get(`${rolesURL}/get/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getAllRoles = async () => {
    try {
        const response = axiosInterceptor().get(`${rolesURL}/get/all`)
        return response

    } catch (error) {
        console.log(error)
    }
}