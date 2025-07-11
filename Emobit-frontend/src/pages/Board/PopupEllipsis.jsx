import '../../styles/PopupEllipsis.css';
import React, { useState, useRef, useEffect } from 'react';
import { Ellipsis } from 'lucide-react';

function PopupEllipsis ({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const popupRef = useRef();

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 팝업 열릴 때 스크롤 조절
    useEffect(() => {
        if (open && popupRef.current) {
            // 스크롤 컨테이너 content-list 찾기
            const scrollContainer = popupRef.current.closest('.content-list');

            if (scrollContainer) {
                const popupRect = popupRef.current.getBoundingClientRect();
                const containerRect = scrollContainer.getBoundingClientRect();

                // 팝업 하단이 스크롤 컨테이너 하단보다 크면 스크롤 내림
                const overflow = popupRect.bottom - containerRect.bottom;

                if (overflow > 0) {
                    // 스크롤 위치 조정 (기존 scrollTop + 넘치는 만큼)
                    scrollContainer.scrollTop += overflow + 10; // 10px 여유
                }
            }
        }
    }, [open]);

  return (
    <div className="popup-ellipsis-container" ref={menuRef}>
        <button className="ellipsis-button" onClick={() => setOpen(!open)}>
            <Ellipsis size={16} color="#000" />
        </button>
        
        {open && (
            <div className="ellipsis-menu-wrapper" ref={popupRef}>
                <button className="ellipsis-menu-item"
                    onClick={() => {
                        setOpen(false);
                        onEdit();
                    }}
                    onMouseDown={e => e.preventDefault()}
                >
                수정
                </button>

                <button className="ellipsis-menu-item ellipsis-menu-item-delete"
                    onClick={() => {
                        setOpen(false);
                        onDelete();
                    }}
                    onMouseDown={e => e.preventDefault()}
                >
                삭제
                </button>
            </div>
        )}
    </div>
  );
};

export default PopupEllipsis;
