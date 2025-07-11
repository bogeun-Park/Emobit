import '../../styles/RegisterSucess.css';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function RegisterSuccess() {
    const navigate = useNavigate();

    return (
        <div className="register-success-container">
            <h2>가입되었습니다!</h2>
            <p>환영합니다! 로그인 후 다양한 서비스를 이용해 보세요.</p>
            <button onClick={() => navigate('/login')} className="login-redirect-button">
                로그인하러 가기
            </button>
        </div>
    );
}

export default RegisterSuccess;
