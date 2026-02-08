const BASE_URL = "http://localhost:8000/api";

export const API_ROUTES = {
    AUTH: {
        LOGIN: `${BASE_URL}/login`,
        REGISTER: `${BASE_URL}/register`,
        PROFILE: `${BASE_URL}/profile`,
    },
    ADMIN: {
        USERS: `${BASE_URL}/users`,
        HOTELS: `${BASE_URL}/hotels`,
        REGIONS: `${BASE_URL}/regions`,
        RESTAURANTS: `${BASE_URL}/restaurants`,
        CUISINES: `${BASE_URL}/cuisines`,
        PLACES: `${BASE_URL}/places`,
    }


};


