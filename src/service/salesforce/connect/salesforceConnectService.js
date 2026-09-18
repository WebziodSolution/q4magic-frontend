import { salesforceBaseURL } from "../../../config/config";
import axiosInterceptor from "../../axiosInterceptor/axiosInterceptor"
import store from "../../../redux/store";

export const connectToSalesforce = async () => {
    try {
        const response = await axiosInterceptor().get(`${salesforceBaseURL}/connectToSalesforce`)
        return response.data;
    } catch (error) {
        throw new Error(`Error connecting to Salesforce: ${error.message}`);
    }
}

export const exchangeToken = async (code, codeVerifier) => {
    try {
        let url = `${salesforceBaseURL}/exchangeToken?code=${encodeURIComponent(code)}`;
        if (codeVerifier) {
            url += `&code_verifier=${encodeURIComponent(codeVerifier)}`;
        }
        const response = await axiosInterceptor().get(url);
        return response.data;
    } catch (error) {
        throw new Error(`Error exchanging token: ${error.message}`);
    }
}

export const getUserInfo = async (accessToken, instanceUrl) => {
    try {
        const response = await axiosInterceptor().get(`${salesforceBaseURL}/userInfo?accessToken=${accessToken}&instanceUrl=${instanceUrl}`)
        return response.data;
    } catch (error) {
        throw new Error(`Error getting user data: ${error.message}`);
    }
}
