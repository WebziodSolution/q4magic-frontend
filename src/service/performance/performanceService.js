import { performanceURL } from "../../config/config"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getPerformanceByCustomerId = async (params) => {
    try {
        const response = await axiosInterceptor().get(`${performanceURL}/get?${params}`)
        return response.data

    } catch (error) {
        console.log(error)
    }
}
