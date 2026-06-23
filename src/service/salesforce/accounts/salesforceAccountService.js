import { salesforceAccountURL } from "../../config/config";
import axiosInterceptor from "../../axiosInterceptor/axiosInterceptor"
import store from "../../../redux/store";

export const getAllAccounts = async () => {
    const { salesforceAccessToken: accessToken, salesforceInstanceUrl: instanceUrl } = store.getState().common;
    try {
        const response = await axiosInterceptor().get(`${salesforceAccountURL}/getall?access_token=${accessToken}&instance_url=${instanceUrl}`)
        return response.data;
    } catch (error) {
        throw new Error(`Error in getting all accounts: ${error.message}`);
    }
};

export const getAccountDetails = async (accountId) => {
    const { salesforceAccessToken: accessToken, salesforceInstanceUrl: instanceUrl } = store.getState().common;
    try {
        const response = await axiosInterceptor().get(`${salesforceAccountURL}/get/${accountId}?access_token=${accessToken}&instance_url=${instanceUrl}`)
        return response.data;
    } catch (error) {
        throw new Error(`Error in getting account details: ${error.message}`);
    }
}
