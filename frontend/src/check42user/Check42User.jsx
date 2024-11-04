import { useNavigate } from 'react-router-dom';
import { setJwt, getUser } from '../api/api'
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import './check.css'

import 'bootstrap/dist/css/bootstrap.min.css';

const Check42User = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [myJwt, setMyJwt] = useState(localStorage.getItem("jwt"));

    useEffect(() => {
        
        const fetchData = async () => {
            const params = new URLSearchParams(window.location.search);
            const codeFromUrl = params.get('code');
            console.log("test--->", codeFromUrl);
            if (codeFromUrl) {
                response = await setJwt(codeFromUrl);
                console.log("test2 --->", response);
                const newJwt = localStorage.getItem("jwt");
                setMyJwt(newJwt)
                const user = await getUser();
                const userLangue = user.langue;
                if (user.sup){
                    localStorage.clear();
                    navigate("/");
                    Swal.fire({
                        title: t('loginPage.sup'),
                        text: t('loginPage.sup2'),
                        icon: 'error',
                        confirmButtonText: 'OK',
                        customClass: {
                            popup: 'custom-swal-popup',
                            title: 'custom-swal-title',
                            text: 'custom-swal-text',
                            confirmButton: 'custom-swal-button'
                        }
                    });
                }
                else {
                    sessionStorage.removeItem('i18nextLng');
                    localStorage.setItem('i18nextLng', userLangue);
                }
            }
        };

        fetchData();
        if (myJwt) {
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
