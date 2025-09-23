import { apiClient } from "@/services/ApiClient"


class LoginService {

    createAccount(data) {
        return apiClient.post('/users/users/', data);
    }

    getAccountDetails() {
        return apiClient.get('/users/users/me/');
    }

    getTokens(data) {
        return apiClient.post('/users/jwt/create/', data)
    }

    refreshToken() {
        return apiClient.post('/users/jwt/refresh/');
    }
}

export default new LoginService