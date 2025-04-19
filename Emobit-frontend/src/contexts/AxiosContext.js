import axios from 'axios';
import { createContext, useContext } from 'react';

const AxiosContext = createContext();

export const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true,
});

export const AxiosProvider = ({ children }) => {
    return (
    <AxiosContext.Provider value={axiosInstance}>
        {children}
    </AxiosContext.Provider>
    );
};

export const useAxios = () => useContext(AxiosContext);
