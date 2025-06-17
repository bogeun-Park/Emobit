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

        // /refresh 요청은 재시도하지 않음
        if (originalRequest.url === '/refresh') {
            // 리프레시 토큰 재발급 요청에서 401 발생하면 무한루프 방지 차원에서 바로 실패 처리
            store.dispatch(authAction.logout());
            return Promise.reject(error);
        }

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
