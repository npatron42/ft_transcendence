import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUser } from '../api/api';

const UserAuthContext = createContext(null);

export const useAuth = () => {
    return useContext(UserAuthContext);
};

export const UserAuthProvider = ({ children }) => {
    const [myUser, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const myJwt = localStorage.getItem("jwt");
    useEffect(() => {

        if (["/", "/register", "/check42user"].includes(location.pathname) && myJwt)
            navigate("/home")
        else if (["/", "/register", "/check42user"].includes(location.pathname)) {
            setIsLoading(false);
            return;
        }

        if (!myJwt) {
            navigate('/');
            return;
        }

        const defineUser = async () => {
            try {
                const myUserTmp = await getUser();
                setUser(myUserTmp);
            } catch (error) {
                localStorage.removeItem("jwt");
                navigate('/');
            } finally {
                setIsLoading(false);
            }
        };

        if (myJwt) {
            defineUser();
        }
    }, [navigate, location.pathname, myJwt]);

    useEffect(() => {
        const updateUser = async () => {
            if (myJwt) {
                try {
                    const updatedUser = await getUser();
                    setUser(updatedUser);
                } catch (error) {
                    console.error("Failed to fetch updated user:", error);
                }
            }
        };
        updateUser();
    }, []);

    if (isLoading) {
        return <div>Loading baby...</div>;
    }

    return (
        <UserAuthContext.Provider value={{ myUser, setUser }}>
            {children}
        </UserAuthContext.Provider>
    );
};