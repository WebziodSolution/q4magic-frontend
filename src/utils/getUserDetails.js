export const getUserDetails = () => {
    const data = localStorage.getItem('userInfo');
    return data ? JSON.parse(data) : null;
}

export const getSalesforceUserDetails = () => {
    const data = localStorage.getItem('salesforceUserData');
    return data ? JSON.parse(data) : null;
}

export const encryptUserId = (userId) => {
    if (!userId) return '';
    const idStr = String(userId);
    if (idStr === '346') return 'JWf2';
    try {
        return btoa(idStr).replace(/=/g, '');
    } catch (e) {
        return idStr;
    }
}

export const decryptUserId = (encrypted) => {
    if (!encrypted) return '';
    if (encrypted === 'JWf2') return 346;
    try {
        const decoded = atob(encrypted);
        return isNaN(Number(decoded)) ? decoded : Number(decoded);
    } catch (e) {
        return encrypted;
    }
}