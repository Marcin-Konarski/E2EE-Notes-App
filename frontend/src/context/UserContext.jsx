import { createContext, useCallback, useMemo, useRef, useState } from "react";
import { clearAccessToken } from "@/services/ApiClient";
import UserService from "@/services/UserService";

export const UserContext = createContext(undefined);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const userWrappingKey = useRef({});
    const userKeyPair = useRef({});
    const publicKey = useRef({});
    const publicKeysList = useRef([]);

    const login = useCallback((data) => {
        setUser({
            id: data.id,
            username: data.username,
            email: data.email,
        });
        setIsLoggedIn(true);
    }, []);

    const logout = useCallback(() => {
        UserService.expireToken();
        clearAccessToken();
        setUser(null);
        setIsLoggedIn(false);
        userWrappingKey.current = {};
        userKeyPair.current = {};
        publicKey.current = {};
    }, []);

    const values = useMemo(() => ({
        user,
        login,
        logout,
        isLoggedIn,
        userWrappingKey,
        userKeyPair,
        publicKey,
        publicKeysList
    }), [user, login, logout, isLoggedIn, userWrappingKey, userKeyPair, publicKey, publicKeysList]);

    return (
        <UserContext.Provider value={values}>
            {children}
        </UserContext.Provider>
    );
};