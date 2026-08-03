import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAxios } from '../contexts/AxiosContext';
import { menuAction } from '../redux/Slice/menuSlice';
import { searchAction } from '../redux/Slice/searchSlice';
import { notificationAction } from '../redux/Slice/notificationSlice';

export function useMenuNavigation() {
    const axios = useAxios();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const panelMenu = useSelector(state => state.menu.panelMenu);
    const notification = useSelector(state => state.notification);

    const handleMenuClick = (menuName) => {
        if (panelMenu) {
            dispatch(menuAction.setPanelMenu(null));

            setTimeout(() => {
                dispatch(searchAction.clearSearchState())
            }, 300);
        }

        navigate(menuName);
    };

    const handlePanelMenuClick = (menuName) => {
        if (panelMenu === menuName) {
            setTimeout(() => {
                dispatch(searchAction.clearSearchState())
            }, 300);
        }

        dispatch(menuAction.setPanelMenu(menuName));

        if (menuName === 'notification' && notification.totalCount > 0) {
            axios.post('/notification/readAll', null, { skipLoadingBar: true })
                .then(() => {
                    dispatch(notificationAction.readNotifications());
                })
                .catch(error => {
                    console.error('Failed to fetch user data:', error);
                });
        }
    };

    return { handleMenuClick, handlePanelMenuClick };
}
