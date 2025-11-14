import { createContext, useCallback, useMemo, useRef, useState } from "react";
import { clearAccessToken } from "@/services/ApiClient";
import UserService from "@/services/UserService";

export const UserContext = createContext(undefined);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const userKeys = useRef({}); // userKeys contatins following attributes: userKeys.current.public_key, userKeys.current.userWrappingKey, userKeys.current.salt (all are set in the manageKeysOnLogin function in the useAuth.js)

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
        userKeys.current = {};
    }, []);

    const values = useMemo(() => ({
        user,
        login,
        logout,
        userKeys,
        isLoggedIn,
    }), [user, login, logout, userKeys, isLoggedIn]);

    return (
        <UserContext.Provider value={values}>
            {children}
        </UserContext.Provider>
    );
};