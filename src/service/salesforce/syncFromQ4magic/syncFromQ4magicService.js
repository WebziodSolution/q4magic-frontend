import { syncFromQ4magicURL } from "../../../config/config";
import axiosInterceptor from "../../axiosInterceptor/axiosInterceptor"
import store from "../../../redux/store";

export const syncFromQ4magic = async () => {
    const { salesforceAccessToken: accessToken, salesforceInstanceUrl: instanceUrl } = store.getState().common;
    try {
        const response = await axiosInterceptor().get(`${syncFromQ4magicURL}?access_token=${accessToken}&instance_url=${instanceUrl}`);
        return response.data;
    } catch (error) {
        console.error("Error syncing from Q4Magic:", error);
        throw error;
    }
};