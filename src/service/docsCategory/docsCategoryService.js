import { docsCategoryURL } from "../../config/config"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getCategoryByOppId = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${docsCategoryURL}/get/all/${id}`)
        return response.data

    } catch (error) {
        console.log(error)
    }
}

export const getCategoryById = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${docsCategoryURL}/get/${id}`)
        return response.data

    } catch (error) {
        console.log(error)
    }
}

export const saveCategory = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${docsCategoryURL}/save`, data)
        return response.data

    } catch (error) {
        console.log(error)
    }
}

export const updateCategory = async (id, data) => {
    try {
        const response = await axiosInterceptor().patch(`${docsCategoryURL}/update/${id}`, data)
        return response.data

    } catch (error) {
        console.log(error)
    }
}

export const deleteCategory = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${docsCategoryURL}/delete/${id}`)
        return response.data

    } catch (error) {
        console.log(error)
    }
}