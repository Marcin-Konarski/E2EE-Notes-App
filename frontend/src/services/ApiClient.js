import axios from "axios";


const apiClient = axios.create({

    // baseURL: 'http://127.0.0.1:8000',
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000', // Import URL from environment variable from docker-compose.yaml
    withCredentials: true,
})


let accessToken = undefined;


function getAccessToken() {
    return accessToken;
}

function setAccessToken(token) {
    accessToken = token;
}

function clearAccessToken() {
    accessToken = null;
}

apiClient.interceptors.request.use(
    (config) => {
        const token = getAccessToken();

        config.headers.Authorization =
            !config._retry && token
                ? `Bearer ${token}`
                : config.headers.Authorization;

        return config;
    },
    (error) => {
        return Promise.reject(error)
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401) {
            try {
                const response = await apiClient.post('/users/jwt/refresh/');

                const token = response.data.access
                setAccessToken();

                originalRequest.headers.Authorization = `Bearer ${token}`;
                originalRequest._retry = true;

                return apiClient(originalRequest);
            } catch (err) {
                clearAccessToken();
            }
        }

        return Promise.reject(error);
    }
);


export { apiClient, getAccessToken, setAccessToken, clearAccessToken };