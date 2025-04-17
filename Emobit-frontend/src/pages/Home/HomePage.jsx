import React from 'react';
import axios from 'axios';

function HomePage() {
    const handleGetUser = () => {
        axios.get(`${process.env.REACT_APP_API_URL}/login/auth`)
            .then(response => {
                console.log('User data:', response.data);
            })
            .catch(error => {
                console.error('Failed to fetch user data:', error);
            });
    };

    return (
        <div>
            <h2>홈입니다!</h2>

            <button onClick={handleGetUser}>Get User Info</button>
        </div>
    );
}

export default HomePage;
