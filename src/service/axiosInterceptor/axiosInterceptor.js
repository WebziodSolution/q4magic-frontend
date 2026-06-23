import axios from "axios";
import store from "../../redux/store";
import { setLoading, setSessionEndModel } from "../../redux/commonReducers/commonReducers";
import Cookies from 'js-cookie';

const baseURL = process.env.REACT_APP_MAIN_BASE_URL;

const axiosInterceptor = (signal) => {
    const ignoreApi = ["/syncStatus/get"];
    let headers = {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT",
    };

    if (Cookies.get('authToken')) {
        headers.Authorization = "Bearer " + Cookies.get('authToken');
    }

    const axiosInstance = axios.create({
        baseURL: baseURL,
        headers,
        validateStatus: function (status) {
            return status <= 500; // allow handling non-200 responses
        },
    });

    // Request Interceptor
    axiosInstance.interceptors.request.use(
        (config) => {
            const isIgnored = ignoreApi.some((path) => config?.url?.endsWith(path));
            if (!isIgnored) {
                store.dispatch(setLoading(true));
            }
            if (signal) {
                config.signal = signal;
            }

            return config;
        },
        (error) => Promise.reject(error)
    );

    // Response Interceptor
    axiosInstance.interceptors.response.use(
        (response) => {
            const isIgnored = ignoreApi.some((path) => response?.config?.url?.endsWith(path));
            if (!isIgnored) {
                store.dispatch(setLoading(false));
            }
            if (response.status === 403 && response?.data?.msg === "Access Denied") {
                Cookies.remove('authToken');
                localStorage.removeItem("userInfo");
                store.dispatch(setSessionEndModel(true));
            }
            if (response.data?.result?.token) {
                store.dispatch(setSessionEndModel(false));
                Cookies.set('authToken', response.data.result.token, { expires: 0.5 });
            }

            return response;
        },
        (error) => {
            store.dispatch(setLoading(false));

            if (axios.isCancel(error)) {
                console.log("Request canceled:", error.message);
            } else {
                console.error("API Error:", error);
            }

            return Promise.reject(error);
        }
    );

    return axiosInstance;
};

export default axiosInterceptor;
