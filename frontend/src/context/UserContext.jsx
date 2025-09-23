import { createContext, useState } from "react";
import { clearAccessToken } from "@/services/ApiClient";

export const UserContext = createContext(undefined);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = (data) => {
        setUser({
            id: data.id,
            username: data.username,
            email: data.email,
            isVerified: data.email_confirmed,
        });
    };

    const logout = () => {
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