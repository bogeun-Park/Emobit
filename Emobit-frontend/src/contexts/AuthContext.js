import React, { createContext, useState, useEffect } from 'react';
import { useAxios } from '../contexts/AxiosContext';
import { useDispatch } from 'react-redux';
import { authAction } from '../redux/Slice/authSlice';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const axios = useAxios();

    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
    axios.get('/login/auth')
        .then(response => {
            const id = response.data.id;
            const displayName = response.data.displayName;
            const username = response.data.username;
            const role = response.data.role;
            const imageUrl = response.data.imageUrl;
            
            if (id){
              dispatch(authAction.login({ username, id, displayName, role, imageUrl }));
            }
        })
        .catch(error => {
            console.log('인증 정보 가져오기 실패:', error);
        })
        .finally(() => {
            setLoading(false);
        });
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ loading }}>
      {children}
    </AuthContext.Provider>
  );
};
