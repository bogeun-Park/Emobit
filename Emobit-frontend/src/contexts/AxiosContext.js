import axios from 'axios';
import { createContext, useContext } from 'react';
import { store } from '../redux/store';
import { authAction } from '../redux/Slice/authSlice';

const AxiosContext = createContext();

export const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true,
});

axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // 토큰 만료로 401 떴을 경우 한 번만 재시도
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // refresh 쿠키를 이용한 새로운 Access Token 요청
                await axiosInstance.get('/refresh');

                // 성공 시 원래 요청 다시 시도
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                store.dispatch(authAction.logout());
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const AxiosProvider = ({ children }) => {
    return (
        <AxiosContext.Provider value={axiosInstance}>
            {children}
        </AxiosContext.Provider>
    );
};

export const useAxios = () => useContext(AxiosContext);
