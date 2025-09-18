import { useState } from 'react';
import LoginService from '@/services/LoginService';
import { useUserContext } from '@/hooks/useUserContext';


const useRegister = () => {
    const [error, setError] = useState(null);
    const { user, setUser } = useUserContext();


    const register = (data) => {
        setError(null);

        LoginService.createAccount(data)
            .then(res => {
                setUser(res.data);
            })
            .catch(err => {
                setError(err.response?.data || 'Registration Failed');
            });
    }

    return { register, user, setUser, error };
}


export default useRegister