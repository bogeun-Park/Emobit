import { useEffect, useRef, useState } from 'react';
import { useLocation, matchPath } from 'react-router-dom';
import { loadingBar } from '../utils/loadingBar';
import routes from '../routes';
import '../styles/TopLoadingBar.css';

// route가 바뀔 때마다, 실제 백엔드 요청 유무와 상관없이 바가 한 번은 뜨도록 하는 최소 지속시간
const ROUTE_CHANGE_PULSE_MS = 50;

// pathname이 routes.js의 어느 라우트 정의와 매칭되는지 찾는다. (예: /board/read/1, /board/read/2는
// 둘 다 "/board/read/:boardId" 패턴에 매칭 — 같은 컴포넌트가 재사용되는 서브 이동이라는 뜻)
const matchRoutePattern = (pathname) => {
    // "*"(404 캐치올)는 뭐든 다 매칭돼버리니 제외하고, 실제 라우트 중에서만 찾는다.
    const matched = routes.find(route => route.path !== '*' && matchPath({ path: route.path, end: true }, pathname));
    return matched ? matched.path : '*';
};

function TopLoadingBar() {
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);
    const [finishing, setFinishing] = useState(false);
    const intervalRef = useRef(null);
    const hideTimeoutRef = useRef(null);
    const location = useLocation();
    const isFirstRender = useRef(true);
    const prevRoutePatternRef = useRef(matchRoutePattern(location.pathname));

    // 페이지 이동(경로 변경) 자체에도 바가 한 번은 뜨게 함.
    // 단, /message/1 -> /message/2 처럼 매칭되는 라우트 패턴이 같아서 같은 컴포넌트가 그대로
    // 재사용되는 서브 이동(채팅방 전환 등)은 페이지 이동이라기보단 인앱 상호작용이라 제외한다.
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const routePattern = matchRoutePattern(location.pathname);
        const isSameRoute = routePattern === prevRoutePatternRef.current;
        prevRoutePatternRef.current = routePattern;

        if (isSameRoute) return;

        loadingBar.start();
        const timer = setTimeout(() => loadingBar.done(), ROUTE_CHANGE_PULSE_MS);
        return () => clearTimeout(timer);
    }, [location.pathname]);

    useEffect(() => {
        const clearTimers = () => {
            clearInterval(intervalRef.current);
            clearTimeout(hideTimeoutRef.current);
        };

        const unsubscribe = loadingBar.subscribe(activeCount => {
            if (activeCount > 0) {
                clearTimers();
                setFinishing(false);
                setVisible(true);
                setProgress(current => (current <= 0 ? 12 : current));

                intervalRef.current = setInterval(() => {
                    setProgress(current => current + (90 - current) * 0.1);
                }, 200);
            } else {
                clearTimers();
                setFinishing(true);
                setProgress(100);
                // 화면 데이터는 이미 렌더링된 뒤라, 바는 순간적으로 끝까지 채우고 바로 사라짐
                hideTimeoutRef.current = setTimeout(() => {
                    setVisible(false);
                    setProgress(0);
                    setFinishing(false);
                }, 120);
            }
        });

        return () => {
            unsubscribe();
            clearTimers();
        };
    }, []);

    return (
        <div className="top-loading-bar" aria-hidden="true">
            <div
                className={`top-loading-bar__fill${finishing ? ' top-loading-bar__fill--finishing' : ''}`}
                style={{ width: `${progress}%`, opacity: visible ? 1 : 0 }}
            />
        </div>
    );
}

export default TopLoadingBar;
