import { todoURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllTodos = async () => {
    try {
        const response = await axiosInterceptor().get(`${todoURL}/get/all`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getTodoByTeam = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${todoURL}/getTodoByTeam`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getTodoByFilter = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${todoURL}/getByFilter`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getTodo = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${todoURL}/get/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createTodo = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${todoURL}/create`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateTodo = async (id, data) => {
    try {
        const response = await axiosInterceptor().patch(`${todoURL}/update/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const deleteTodo = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${todoURL}/delete/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const setTodoToday = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${todoURL}/setTodoToday`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteImagesById = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${todoURL}/image/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const completeTodo = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${todoURL}/completeTodo/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}