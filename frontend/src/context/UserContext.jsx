import { createContext, useMemo, useState } from "react";
import { clearAccessToken } from "@/services/ApiClient";
import UserService from "@/services/UserService";

export const UserContext = createContext(undefined);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const value = useMemo(() => ({
        user,
        setUser,
    }), [user]);

    const login = (data) => {
        setUser({
            id: data.id,
            username: data.username,
            email: data.email,
        });
    };

    const logout = () => {
        UserService.expireToken();
        clearAccessToken();
        setUser(null);
    };

    const values = {
        user,
        login,
        logout,
    };

    return (
        <UserContext.Provider value={values}>
            {children}
        </UserContext.Provider>
    );
};