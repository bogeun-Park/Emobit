import '../styles/PanelSearch.css';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { menuAction } from '../redux/Slice/menuSlice';
import { useAxios } from '../contexts/AxiosContext';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

function PanelSearch() {
    const panelMenu = useSelector(state => state.menu.panelMenu);
    const keyword = useSelector(state => state.menu.keyword);
    const resultList = useSelector(state => state.menu.resultList);
    const dispatch = useDispatch();
    const axios = useAxios();
    const navigate = useNavigate();
    const panelRef = useRef(null);
    const inputRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const curPanel = panelRef.current;
            const sidebar = document.querySelector('.sidebar-container');

            if (curPanel && !curPanel.contains(event.target) && sidebar && !sidebar.contains(event.target)) {
                dispatch(menuAction.setPanelMenu(null));

                setTimeout(() => {
                    dispatch(menuAction.clearSearchState())
                }, 300);
            }
        };

        if (panelMenu === 'search') {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [panelMenu, dispatch]);

    useEffect(() => {
        if (!keyword.trim()) {
            dispatch(menuAction.setResultList([]));
            setLoading(false);
            return;
        }

        setLoading(true);

        const delay = setTimeout(() => {
            axios.get(`/member/search/${encodeURIComponent(keyword)}`)
                .then(response => dispatch(menuAction.setResultList(response.data)))
                .catch(error => console.error(error))
                .finally(() => setLoading(false));
        }, 300); // debounce

        return () => clearTimeout(delay);
    }, [keyword]);

    const handleClearKeyword = (e) => {
        e.preventDefault();
        dispatch(menuAction.setKeyword(''));
        inputRef.current?.blur();
    }

    const handleItemClick = (result) => {
        navigate(`/${result.username}`);
        dispatch(menuAction.setPanelMenu(null));

        setTimeout(() => {
            dispatch(menuAction.clearSearchState())
        }, 300);
    };

    return (
        <div className={`panel-search-container ${panelMenu === 'search' ? 'open' : ''}`} ref={panelRef}>
            <div className={`panel-search-header ${resultList.length > 0 ? 'no-border' : ''}`}>
                <span className="panel-search-title">검색</span>

                <div className="search-input-wrapper">
                    {!isFocused && <Search className="search-icon" />}
                    <input type="text" value={keyword} placeholder='검색' ref={inputRef}
                        onChange={(e) => dispatch(menuAction.setKeyword(e.target.value))}
                        onFocus={() => {setIsFocused(true)}}
                        onBlur={() => setIsFocused(false)}
                        autoFocus
                    />

                    {!loading && <button className="clear-button" onMouseDown={handleClearKeyword}><X size={12} strokeWidth={2} /></button>}
                    {loading && <div className="loading-spinner" />}
                </div>
            </div>

            <div className="panel-search-body">
                {loading ? null : (
                    keyword.trim() === '' ? (
                        <div className="search-empty">검색어를 입력해주세요</div>
                    ) : (
                        <ul className="search-result-list">
                            {resultList.length === 0 ? (
                                <li className="search-result-empty">검색 결과가 없습니다</li>
                            ) : (
                                resultList.map((result) => (
                                    <li key={result.id} className="search-result-item" onClick={() => handleItemClick(result) }>
                                        <div className="result-item-wrapper">
                                            <img className="result-img" src={result.imageUrl} alt="" />

                                            <div className="result-texts">
                                                <div className="result-title">{result.username}</div>
                                                <div className="result-preview">{result.displayName}</div>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    )
                )}
            </div>
        </div>
    );
}

export default PanelSearch;
