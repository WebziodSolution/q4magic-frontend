import { getUserSalesForceToken } from "../service/customers/customersService";

export const fetchAndSetSalesforceTokens = async (userId) => {
    if (!userId) return null;
    try {
        const response = await getUserSalesForceToken(userId);
        if (response?.status === 200 || response?.data?.status === 200) {
            const data = response?.result;
            const accessToken = data?.accessToken_salesforce;
            const instanceUrl = data?.instanceUrl_salesforce;
            if (accessToken && instanceUrl) {
                return { accessToken, instanceUrl };
            }
        }
        return null;
    } catch (error) {
        console.error("Error fetching Salesforce tokens:", error);
        return null;
    }
};
