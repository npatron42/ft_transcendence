import { useParams, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {getUser} from '../../api/api';

const WaitingTournaments = () => {
    const { waitRoomId } = useParams();
    const location = useLocation();
    const maxScore = location.state?.maxScore || 10;
    const invitedPlayer = location.state?.invitedPlayer || [];
    const [webSocket, setWebSocket] = useState(null);
    const [user, setUser] = useState(null);
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const fetchedUser = await getUser();
                console.log(fetchedUser);
                setUser(fetchedUser);
            } catch (error) {
                console.error('Erreur lors de la récupération de l\'utilisateur:', error);
            }
        };
        fetchUser();
        console.log(fetchUser);
        
    }, []);

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8000/ws/waitTournaments/${waitRoomId}`);

        ws.onopen = () => {
            console.log('WebSocket connecté à la room:', waitRoomId);
        };

        ws.onmessage = (event) => {
            console.log("Message reçu:", event.data);
            const data = JSON.parse(event.data);
            if (data.updatePlayers) {
                console.log("Liste des joueurs mise à jour:", data.updatePlayers);
                setPlayers(data.updatePlayers);
            }
        };

        ws.onclose = (event) => {
            console.log('WebSocket fermé, code :', event.code);
        };

        ws.onerror = (error) => {
            console.error('Erreur WebbalGameMulti/a2ff89a8-ff76-4128-8deb-114108418c63Socket :', error);
        };

        setWebSocket(ws);

        return () => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [waitRoomId, maxScore]);

    useEffect(() => {
        if (webSocket && webSocket.readyState === WebSocket.OPEN && user) {
            webSocket.send(JSON.stringify({ name: user.username }));
            console.log("Nom d'utilisateur envoyé via WebSocket :", user.username);
        }
    }, [webSocket, user]);

    return (
        <div>
            {invitedPlayer.map(player => (
                <div key={player.id}>{player.name}</div>
            ))}
            {user && (
                <div>
                    <p>Username: {user.username}</p>
                </div>
            )}
            <div>
                {players.length > 0 ? (
                    players.map(player => (
                        <div key={player}>{player}</div>
                    ))
                ) : (
                    <p>Aucun joueur connecté</p>
                )}
            </div>
            <div>{waitRoomId}</div>
            <div>{maxScore}</div>
        </div>
    );
};

export default WaitingTournaments;
