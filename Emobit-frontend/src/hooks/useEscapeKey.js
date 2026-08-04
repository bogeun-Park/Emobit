import { useEffect } from 'react';

// ESC키 입력 시 onEscape를 실행 (팝업/시트 닫기 등에 사용)
export function useEscapeKey(onEscape) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onEscape();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onEscape]);
}
