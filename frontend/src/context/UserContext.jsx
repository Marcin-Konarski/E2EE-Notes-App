import { createContext, useMemo, useState } from "react";
import { clearAccessToken } from "@/services/ApiClient";
import UserService from "@/services/UserService";

export const UserContext = createContext(undefined);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const login = (data) => {
        setUser({
            id: data.id,
            username: data.username,
            email: data.email,
        });
        setIsLoggedIn(true);
    };

    const logout = () => {
        UserService.expireToken();
        clearAccessToken();
        setUser(null);
        setIsLoggedIn(false);
    };

    const values = useMemo(() => ({
        user,
        login,
        logout,
        isLoggedIn
    }), [user, login, logout, isLoggedIn]);

    return (
        <UserContext.Provider value={values}>
            {children}
        </UserContext.Provider>
    );
};