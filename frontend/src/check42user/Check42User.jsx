import { useNavigate } from 'react-router-dom';
import { setJwt, getAllUsers, getUser } from '../api/api'
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Check42User = () => {
    const navigate = useNavigate();

    const [myJwt, setMyJwt] = useState(localStorage.getItem("jwt"));

    useEffect(() => {
        
        const fetchData = async () => {
            const params = new URLSearchParams(window.location.search);
            const codeFromUrl = params.get('code');
            if (codeFromUrl) {
                await setJwt(codeFromUrl);
                const newJwt = localStorage.getItem("jwt");
                setMyJwt(newJwt)
            }
        };

        fetchData();
        if (myJwt) {
            console.log("ALLER VAMOS")
            navigate("/home")
        }
    }, [navigate, myJwt]);


    return (
        <div className="background-container">
        </div>
    );
}

export default Check42User;
