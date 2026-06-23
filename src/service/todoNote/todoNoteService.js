import { todoNoteURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllTodosNotes = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${todoNoteURL}/getByTodo/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getTodosNote = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${todoNoteURL}/get/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createTodoNote = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${todoNoteURL}/create`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};


export const updateTodoNote = async (id, data) => {
    try {
        const response = await axiosInterceptor().patch(`${todoNoteURL}/update/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteTodoNote = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${todoNoteURL}/delete/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};