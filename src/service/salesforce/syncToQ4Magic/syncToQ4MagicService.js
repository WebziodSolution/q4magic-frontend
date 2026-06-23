import { q4magicSyncURL } from "../../../config/config";
import axiosInterceptor from "../../axiosInterceptor/axiosInterceptor"
import store from "../../../redux/store";


export const syncToQ4Magic = async () => {
    const { salesforceAccessToken: accessToken, salesforceInstanceUrl: instanceUrl } = store.getState().common;
    try {
        const response = await axiosInterceptor().get(`${q4magicSyncURL}?access_token=${accessToken}&instance_url=${instanceUrl}`);
        return response.data;
    } catch (error) {
        throw new Error(`Error syncing to Q4Magic: ${error.message}`);
    }
};
