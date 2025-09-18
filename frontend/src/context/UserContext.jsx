import { createContext, useState } from "react";


export const UserContext = createContext(undefined);

// Context that provides user to all children (whole app)
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

        const values = {
            user,
            setUser
        }

    return (
        <UserContext.Provider value={values}>
            {children}
        </UserContext.Provider>
    );
}