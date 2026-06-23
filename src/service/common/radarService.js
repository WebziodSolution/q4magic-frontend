import { radarAPIURL, radarSKAPIKey } from "../../config/config"

export const getCurrentLocation = async () => {
    try {
        const locationResponse = await fetch(`${radarAPIURL}/geocode/ip`, {
            method: 'GET',
            headers: {
                'Authorization': radarSKAPIKey
            }
        })
        const locationData = await locationResponse.json();
        return locationData
    } catch (error) {
        console.log(error)
    }
}