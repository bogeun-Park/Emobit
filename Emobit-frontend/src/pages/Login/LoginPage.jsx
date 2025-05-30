import React, { useState, useEffect  } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAxios } from '../../contexts/AxiosContext';
import { useDispatch, useSelector } from 'react-redux';
import { authAction } from '../../redux/Slice/authSlice'

function LoginPage() {
    const axios = useAxios();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const auth = useSelector(state => state.auth);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (auth.isAuthenticated) {
            navigate('/');
        }
    }, [auth, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!username || !password) {
            alert('아이디와 비밀번호를 입력하세요.');
            return;
        }

        axios.post('/login', { username, password })
            .then(response => {
                console.log('로그인 성공:', response);
                
                axios.get('/login/auth')
                    .then(authResponse => {
                        const id = authResponse.data.id;
                        const displayName = authResponse.data.displayName;
                        const role = authResponse.data.role;
                        const imageUrl = authResponse.data.imageUrl;

                        dispatch(authAction.login({ username, id, displayName, role, imageUrl }));
                    })

                navigate('/');
            })
            .catch(error => {
                console.error('로그인 실패:', error);
            });
    };

    const handleRegisterClick = () => {
        navigate('/login/register');
    };

    return (
        <div>
            <h2>로그인</h2>
            
            <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="username">아이디</label>
                <input type="text" id="username"  value={username} onChange={(e) => setUsername(e.target.value)}/>
            </div>

            <div>
                <label htmlFor="password">비밀번호</label>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
            </div>

            <p>
                <button type="button" onClick={handleRegisterClick}>SignUp</button>
                <button type="submit">Login</button>
            </p>
        </form>
        </div>
    );
}

export default LoginPage;