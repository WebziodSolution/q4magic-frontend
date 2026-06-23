import { docsAttachmentsURL } from "../../config/config"
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const findByDocsCategory = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${docsAttachmentsURL}/get/all/${id}`)
        return response.data

    } catch (error) {
        console.log(error)
    }
}

export const findById = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${docsAttachmentsURL}/get/${id}`)
        return response.data

    } catch (error) {
        console.log(error)
    }
}


export const saveAttachments = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${docsAttachmentsURL}/save`, data)
        return response.data

    } catch (error) {
        console.log(error)
    }
}


export const updateAttachments = async (id, data) => {
    try {
        const response = await axiosInterceptor().patch(`${docsAttachmentsURL}/update/${id}`, data)
        return response.data

    } catch (error) {
        console.log(error)
    }
}

export const deleteAttachments = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${docsAttachmentsURL}/delete/${id}`)
        return response.data

    } catch (error) {
        console.log(error)
    }
}

export const deleteAttachmentsFiles = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${docsAttachmentsURL}/deleteAttachmentsFiles/${id}`)
        return response.data

    } catch (error) {
        console.log(error)
    }
}