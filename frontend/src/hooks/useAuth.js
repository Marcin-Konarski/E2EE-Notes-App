import { useState } from 'react'
import { useUserContext } from './useUserContext';
import EmailService from '@/services/EmailService';
import { setAccessToken } from '@/services/ApiClient';
import LoginService from '@/services/LoginService';

const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { login, logout } = useUserContext();


    const register = async (data) => {
        logout(); // If some user is logged in. Log them out
        setIsLoading(true);
        setError(null);

        try {
            const response = await LoginService.createAccount(data);
            return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Registration Failed'
            setError(errorMessage);
            return { success: false, error: errorMessage};
        } finally {
            setIsLoading(false);
        }
    };


    const verifyEmail = async (activationKey) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await EmailService.confirmEmail({activation_key: activationKey});
            const token = response.data.access_token;

            setAccessToken(token);

            const userResponse = await LoginService.getAccountDetails();
            login(userResponse.data);

            return {success: true};
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Verification failed';
            setError(errorMessage);
            return { success: false, error: errorMessage};
        } finally {
            setIsLoading(false);
        }
    };


    const loginUser = async (credentials) => {
        setIsLoading(true);
        setError(null);

        try {
            const tokenResponse = await LoginService.getTokens(credentials);
            setAccessToken(tokenResponse.data.access);
            const userResponse = await LoginService.getAccountDetails();
            login(userResponse.data);

            return {success: true}
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login Failed';
            setError(errorMessage);
            return {success: false, error: errorMessage};
        } finally {
            setIsLoading(false);
        }
    };


    const loginOnPageRefresh = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await LoginService.refreshToken();
            setAccessToken(response.data.access);
            const userDataResponse = await LoginService.getAccountDetails();
            login(userDataResponse.data);

            return {success: true}
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'User does not exist or email not confirmed';
            setError(errorMessage);
            return {success: false, error: errorMessage};
        } finally {
            setIsLoading(false);
        }
    };


    const resendVerificationEmail = async (email) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await EmailService.resendEmail(email) // TODO: Finish this hook!!!!!!!!!!!!!!!!!
            if (response.status === 200)
                return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data || 'Failed to send email';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };


    return { register, verifyEmail, loginUser, loginOnPageRefresh, resendVerificationEmail, isLoading, error };
}

export default useAuth