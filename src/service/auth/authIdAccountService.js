import { authIdURL } from "../../../src/config/config"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const addUser = async (data) => {
    try {
        const response = axiosInterceptor().post(`${authIdURL}/addUser`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const updateUser = async (data) => {
    try {
        const response = axiosInterceptor().post(`${authIdURL}/updateUser`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getUser = async (email) => {
    try {
        const response = axiosInterceptor().get(`${authIdURL}/${email}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const loginWithAuthID = async (email) => {
    try {
        const response = axiosInterceptor().get(`${authIdURL}/login/${email}`)
        return response

    } catch (error) {
        console.log(error)
    }
}