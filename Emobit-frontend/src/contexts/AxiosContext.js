import axios from 'axios';
import { createContext, useContext } from 'react';
import { store } from '../redux/store';
import { authAction } from '../redux/Slice/authSlice'

const AxiosContext = createContext();

export const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true,
});

export const AxiosProvider = ({ children }) => {
    axiosInstance.interceptors.response.use(
        response => response,
        error => {
            if (error.response && error.response.status === 401) {
                // JWT 만료 등 인증 에러 시 auth 상태 초기화
                store.dispatch(authAction.logout());
            }
    
            return Promise.reject(error);
        }
    );

    return (
    <AxiosContext.Provider value={axiosInstance}>
        {children}
    </AxiosContext.Provider>
    );
};

export const useAxios = () => useContext(AxiosContext);
