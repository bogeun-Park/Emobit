import '../styles/PanelSearch.css';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { menuAction } from '../redux/Slice/menuSlice';
import { searchAction } from '../redux/Slice/searchSlice';
import { useAxios } from '../contexts/AxiosContext';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

function PanelSearch() {
    const panelMenu = useSelector(state => state.menu.panelMenu);
    const keyword = useSelector(state => state.search.keyword);
    const resultList = useSelector(state => state.search.resultList);
    const dispatch = useDispatch();
    const axios = useAxios();
    const navigate = useNavigate();
    const panelRef = useRef(null);
    const inputRef = useRef(null);
    const isHashtag = keyword.startsWith('#');

    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const curPanel = panelRef.current;
            const sidebar = document.querySelector('.sidebar-container');

            if (curPanel && !curPanel.contains(event.target) && sidebar && !sidebar.contains(event.target)) {
                dispatch(menuAction.setPanelMenu(null));

                setTimeout(() => {
                    dispatch(searchAction.clearSearchState());
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
        const trimmedKeyword = keyword.trim();

        if (!trimmedKeyword || trimmedKeyword === '#') {
            dispatch(searchAction.setResultList([]));
            setLoading(false);
            return;
        }

        setLoading(true);

        const delay = setTimeout(() => {
            const encoded = encodeURIComponent(isHashtag ? trimmedKeyword.slice(1) : trimmedKeyword);
            const url = isHashtag ? `/board/search/${encoded}` : `/member/search/${encoded}`;
            axios.get(url)
                .then(response => {
                    dispatch(searchAction.setResultList(response.data))
                })
                .catch(error => {
                    console.error(error)
                })
                .finally(() => {
                    setLoading(false)
                });
        }, 300);

        return () => clearTimeout(delay);
    }, [keyword]);

    const handleClearKeyword = (e) => {
        e.preventDefault();
        dispatch(searchAction.setKeyword(''));
        inputRef.current?.blur();
    };

    const handleItemClick = (result) => {
        if (isHashtag) {
            navigate(`/search/${result}`);
        } else {
            navigate(`/${result.username}`);
        }

        dispatch(menuAction.setPanelMenu(null));
        setTimeout(() => {
            dispatch(searchAction.clearSearchState());
        }, 300);
    };

    return (
        <div className={`panel-search-container ${panelMenu === 'search' ? 'open' : ''}`} ref={panelRef}>
            <div className={`panel-search-header ${resultList.length > 0 ? 'no-border' : ''}`}>
                <span className="panel-search-title">검색</span>

                <div className="search-input-wrapper">
                    {!isFocused && <Search className="search-icon" />}
                    <input type="text" value={keyword} placeholder="검색" ref={inputRef}
                        onChange={(e) => dispatch(searchAction.setKeyword(e.target.value))}
                        onFocus={() => setIsFocused(true)}
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
                        <div className="search-empty">
                            <span>일기는 해시태그(#),</span>
                            <span>프로필은 이름이나 아이디로 검색하세요.</span>
                        </div>
                    ) : (
                        <ul className="search-result-list">
                            {resultList.length === 0 ? (
                                <li className="search-result-empty">검색 결과가 없습니다.</li>
                            ) : isHashtag ? (
                                <li className="search-result-item" onClick={() => handleItemClick(keyword.slice(1))}>
                                    <div className="result-item-wrapper">
                                        <div className="result-img hashtag-img">#</div>
                                        <div className="result-texts">
                                            <div className="result-title">{keyword}</div>
                                            <div className="result-preview">게시물 {resultList.length}</div>
                                        </div>
                                    </div>
                                </li>
                            ) : (
                                resultList.map((result) => (
                                    <li key={result.id} className="search-result-item" onClick={() => handleItemClick(result)}>
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
