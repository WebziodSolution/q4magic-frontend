import { activitiesURL, resultsURL } from "../../config/config"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllResults = async () => {
    try {
        const response = axiosInterceptor().get(`${resultsURL}/get/all`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getAllActivities = async () => {
    try {
        const response = axiosInterceptor().get(`${activitiesURL}/get/all`)
        return response

    } catch (error) {
        console.log(error)
    }
}