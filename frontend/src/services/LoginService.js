import apiClient from '@/services/ApiClient';


class LoginService {

    createAccount(data) {
        return apiClient.post('/users/users/', data);
    }

    getAccountDetails() {
        return apiClient.post('/users/users/me/', ); // TODO: provide access token here
    }

    getTokens(data) {
        return apiClient.post('/users/jwt/create/', data)
    }

    refreshToken() { // TODO: provide refresh token from http-only cookie here

    }
}

export default new LoginService