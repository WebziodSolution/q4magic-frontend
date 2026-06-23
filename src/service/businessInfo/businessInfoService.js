import { businessInfoURL } from "../../config/config"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getBusinessInfo = async (id) => {
    try {
        const response = axiosInterceptor().get(`${businessInfoURL}/get/${id}`)
        return response 
    } catch (error) {
        console.log(error)
    }  
}

export const addBusinessInfo = async (data) => {
    try {
        const response = axiosInterceptor().post(`${businessInfoURL}/create`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const updateBusinessInfo = async (id, data) => {
    try {
        const response = axiosInterceptor().patch(`${businessInfoURL}/update/${id}`, data)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const uploadBrandLogo = async (data) => {
    try {
        const response = axiosInterceptor().post(`${businessInfoURL}/uploadBrandLogo`, data)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const deleteBrandLogo = async (id) => {
    try {
        const response = axiosInterceptor().delete(`${businessInfoURL}/deleteBrandLogo/${id}`)
        return response
    } catch (error) {
        console.log(error)
    }
}