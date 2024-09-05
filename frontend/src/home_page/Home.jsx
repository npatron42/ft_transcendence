import "../index.css";
import "../App.css";
import axios from 'axios';
import React, { useEffect } from 'react';
import WebSocketComponent from "../FriendsList/FriendsList";

const Home = () => {
    useEffect(() => {
        const fetchData = async () => {
            const params = new URLSearchParams(window.location.search);
            const codeFromUrl = params.get('code');
            try {
                const response = await axios.post("http://localhost:8000/oauth2/login/", {
                    code: codeFromUrl,
                });

                if (response.data.Error === "Failed during creation proccess, to DB")
                    return ;

                localStorage.setItem("jwt", response.data.jwt);
            } catch (error) {
                console.error("Error during login:", error);
            }
        };

        const getUser = async () => {
            try {
                const token = localStorage.getItem('jwt');
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };
                
                const response = await axios.get("http://localhost:8000/api/users/", config);
        
                console.log("User data:", response.data);
                return response.data;
            } catch (error) {
                console.error("Error fetching user data:", error);
                throw error;
            }
        };

        const fetchDataAndGetUser = async () => {
            await fetchData();
            await getUser();
            const myJwt = localStorage.getItem('jwt');
            const myUrl = "ws://localhost:8000/ws/status/?token=" + myJwt;
            const socket = new WebSocket(myUrl);
        };

        fetchDataAndGetUser();

        

    }, []);

    return (
        <div className="background-container">
        {/* <WebSocketComponent/> */}
        </div>
    );
}

export default Home;
