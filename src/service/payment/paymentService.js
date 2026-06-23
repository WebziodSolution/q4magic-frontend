import { paymentGatewayURL } from "../../config/config"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const createPaymentProfile = async (data) => {
    try {
        const response = axiosInterceptor().post(`${paymentGatewayURL}/createPaymentProfile`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const updatePaymentProfile = async (data) => {
    try {
        const response = axiosInterceptor().post(`${paymentGatewayURL}/updatePaymentProfile`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getPaymentProfile = async () => {
    try {
        const response = axiosInterceptor().get(`${paymentGatewayURL}/getPaymentProfile`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const deletePaymentProfile = async () => {
    try {
        const response = axiosInterceptor().delete(`${paymentGatewayURL}/deletePaymentProfile`)
        return response

    } catch (error) {
        console.log(error)
    }
}