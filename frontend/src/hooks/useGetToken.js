import LoginService from '@/services/LoginService';
import { useEffect, useState } from 'react';


const useGetToken = () => {
    const [accessToken, setAccessToken] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);
    const [error, setError] = useState(null);

    const getToken = (data) => {
        LoginService.getTokens(data)
            .then(res => {
                console.log(res)
                setAccessToken(res.data)
            })
            .catch(err => {
                console.log(err)
                setError(err)
            });
    };

    return { getToken, accessToken, refreshToken, error }
}

export default useGetToken