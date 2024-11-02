import { useNavigate } from 'react-router-dom';
import { setJwt, getAllUsers, getUser } from '../api/api'
import React, { useEffect, useState } from 'react';
import './check.css'

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
                sessionStorage.removeItem('i18nextLng');
                const user = await getUser();
                const userLangue = user.langue;
                localStorage.setItem('i18nextLng', userLangue);
                // if (user.sup){
                //     alert("compte sup");
                //     localStorage.clear();
                //     navigate("/");
                // }
            }
        };

        fetchData();
        if (myJwt) {
            // console.log("ALLER VAMOS")
            navigate("/home")
        }
    }, [navigate, myJwt]);


    return (
        <div id="background-container">
            <div class="loader"></div>
        </div>
    );
}

export default Check42User;
