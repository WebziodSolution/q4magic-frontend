import { productsUrl } from "../../config/config"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllActiveProducts = async () => {
    try {
        const response = axiosInterceptor().get(`${productsUrl}/get/all/active`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getAllProducts = async () => {
    try {
        const response = axiosInterceptor().get(`${productsUrl}/get/all`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getProducts = async (id) => {
    try {
        const response = axiosInterceptor().get(`${productsUrl}/get/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const createProducts = async (data) => {
    try {
        const response = axiosInterceptor().post(`${productsUrl}/create`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const updateProducts = async (id, data) => {
    try {
        const response = axiosInterceptor().patch(`${productsUrl}/update/${id}`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const deletProducts = async (id) => {
    try {
        const response = axiosInterceptor().delete(`${productsUrl}/delete/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}