import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAxios } from '../contexts/AxiosContext';
import { authAction } from '../redux/Slice/authSlice';
import { searchAction } from '../redux/Slice/searchSlice';

export function useLogout() {
    const axios = useAxios();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    return () => {
        axios.post('/logout')
            .then(response => {
                console.log(response);

                dispatch(authAction.logout());

                setTimeout(() => {
                    dispatch(searchAction.clearSearchState())
                }, 300);

                navigate('/login');
            })
            .catch(error => {
                console.error('로그아웃 실패:', error);
                alert('로그아웃 중 오류가 발생했습니다.');
            });
    };
}
