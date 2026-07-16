import { subscriptionRatesURL } from "../../config/config"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllSubscriptionRates = async () => {
    try {
        const response = await axiosInterceptor().get(`${subscriptionRatesURL}/get/all`)
        return response.data

    } catch (error) {
        console.log(error)
    }
}