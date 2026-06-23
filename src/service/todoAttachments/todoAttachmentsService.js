import { todoAttachmentsURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const deleteTodoAttachment = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${todoAttachmentsURL}/delete/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};