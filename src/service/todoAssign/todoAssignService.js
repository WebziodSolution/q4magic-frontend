import { todoAssignURL } from "../../config/config";
import axiosInterceptor from "../axiosInterceptor/axiosInterceptor"

export const getAllTodosAssign = async () => {
    try {
        const response = await axiosInterceptor().get(`${todoAssignURL}/get/all`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getTodoAssignByTodoId = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${todoAssignURL}/getByTodo/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getTodoAssign = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${todoAssignURL}/get/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createTodoAssign = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${todoAssignURL}/create`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateTodoAssign = async (id, data) => {
    try {
        const response = await axiosInterceptor().patch(`${todoAssignURL}/update/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const deleteTodoAssign = async (id) => {
    try {
        const response = await axiosInterceptor().delete(`${todoAssignURL}/delete/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getTodoByTeamId = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${todoAssignURL}/getTodoByTeamId/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createTodoTeam = async (data) => {
    try {
        const response = await axiosInterceptor().post(`${todoAssignURL}/teamAssign`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateTodoTeam = async (id, data) => {
    try {
        const response = await axiosInterceptor().patch(`${todoAssignURL}/teamAssign/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const setStatusToCompleted = async (id) => {
    try {
        const response = await axiosInterceptor().get(`${todoAssignURL}/setStatusToCompleted/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const sendTaskReminder = async (userId, todoId, assignId) => {
    try {
        const response = await axiosInterceptor().get(`${todoAssignURL}/sendTaskReminder/${userId}/${todoId}/${assignId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}



