export const getUserDetails = () => {
    const data = localStorage.getItem('userInfo');
    return data ? JSON.parse(data) : null;
}

export const getSalesforceUserDetails = () => {
    const data = localStorage.getItem('salesforceUserData');
    return data ? JSON.parse(data) : null;
}