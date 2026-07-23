import { customersURL } from "../../config/config"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const userLogin = async (data) => {
    try {
        const response = axiosInterceptor().post(`${customersURL}/login`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const addCustomer = async (data) => {
    try {
        const response = axiosInterceptor().post(`${customersURL}/create`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const updateCustomer = async (id, data) => {
    try {
        const response = axiosInterceptor().patch(`${customersURL}/update/${id}`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const deleteCustomer = async (id) => {
    try {
        const response = axiosInterceptor().delete(`${customersURL}/delete/${id}`)
        return response;
    } catch (error) {
        console.log(error)
    }
}

export const getCustomer = async (id) => {
    try {
        const response = axiosInterceptor().get(`${customersURL}/get/${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const verifyEmail = async (email, type = null, id = null) => {
    try {
        const response = axiosInterceptor().get(`${customersURL}/verifyEmail?email=${email}&type=${type}&id=${id}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const verifyUsername = async (username) => {
    try {
        const response = axiosInterceptor().get(`${customersURL}/verifyUsername?username=${username}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const forgotPassword = async (data) => {
    try {
        const response = axiosInterceptor().post(`${customersURL}/forgotpassword`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const resetPassword = async (data) => {
    try {
        const response = axiosInterceptor().post(`${customersURL}/resetpassword`, data)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const checkValidToken = async (token) => {
    try {
        const response = axiosInterceptor().get(`${customersURL}/validateToken?token=${token}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const changePassword = async (data) => {
    try {
        const response = axiosInterceptor().post(`${customersURL}/changePassword`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getDashboardData = async (data) => {
    try {
        const response = axiosInterceptor().post(`${customersURL}/get/dashboard`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const sendRegisterInvitation = async (data) => {
    try {
        const response = axiosInterceptor().post(`${customersURL}/sendRegisterInvitation`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const createSubUser = async (data) => {
    try {
        const response = axiosInterceptor().post(`${customersURL}/create/subuser`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const updateSubUser = async (id, data) => {
    try {
        const response = axiosInterceptor().patch(`${customersURL}/update/subuser/${id}`, data)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getAllSubUsers = async () => {
    try {
        const response = axiosInterceptor().get(`${customersURL}/getAllSubUsers`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const checkValidSubUserToken = async (token) => {
    try {
        const response = axiosInterceptor().get(`${customersURL}/validateSubUserToken?token=${token}`)
        return response

    } catch (error) {
        console.log(error)
    }
}

export const getUserSalesForceToken = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${customersURL}/getUserSalesForceToken/${id}`)
        return response.data
    } catch (error) {
        console.log(error)
    }
}

export const saveTimeZone = async (timeZone) => {
    try {
        const response = await axiosInterceptor().get(`${customersURL}/saveTimeZone?timeZone=${timeZone}`)
        return response.data
    } catch (error) {
        console.log(error)
    }
}

export const saveWebConference = async (webConference) => {
    try {
        const response = await axiosInterceptor().post(`${customersURL}/saveWebConference`, { webConference })
        return response.data
    } catch (error) {
        console.log(error)
    }
}

export const saveMailNotification = async (emailNotification) => {
    try {
        const response = await axiosInterceptor().post(`${customersURL}/saveMailNotification`, { emailNotification })
        return response.data
    } catch (error) {
        console.log(error)
    }
}

export const removeUserSalesForceToken = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${customersURL}/removeUserSalesForceToken/${id}`)
        return response.data
    } catch (error) {
        console.log(error)
    }
}

export const saveDefaultCalendar = async (defaultCalendar) => {
    try {
        const response = await axiosInterceptor().post(`${customersURL}/saveDefaultCalendar`, { defaultCalendar })
        return response.data
    } catch (error) {
        console.log(error)
    }
}

export const setCustomerMeetingQuota = async (quota) => {
    try {
        const response = await axiosInterceptor().post(`${customersURL}/meetingquota?quota=${quota}`)
        return response.data
    } catch (error) {
        console.log(error)
    }
}