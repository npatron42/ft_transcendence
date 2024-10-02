import { useParams, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { getUser } from '../../api/api';
import '../css/waitTournaments.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const WaitingTournaments = () => {
    const { waitRoomId } = useParams();
    const location = useLocation();
    const nbplayer = location.state?.numberInvitedPlayer || 10;
    const maxScore = location.state?.maxScore || 10;
    const invitedPlayer = location.state?.invitedPlayer || [];
    const [webSocket, setWebSocket] = useState(null);
    const [user, setUser] = useState(null);
    const [players, setPlayers] = useState([]);

    // Récupération de l'utilisateur
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const fetchedUser = await getUser();
                setUser(fetchedUser);
            } catch (error) {
                console.error('Erreur lors de la récupération de l\'utilisateur:', error);
            }
        };
        fetchUser();
    }, []);
    console.log("la", nbplayer);
    console.log("ici", maxScore);

    // Gestion du WebSocket
    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8000/ws/waitTournaments/${waitRoomId}`);

        ws.onopen = () => {
            console.log('WebSocket connecté à la room:', waitRoomId);
            console.log("nb invitedplayerSend", nbplayer);
        };        

        ws.onmessage = (event) => {
            console.log("Message reçu:", event.data);
            const data = JSON.parse(event.data);
            if (data.updatePlayers) {
                setPlayers(data.updatePlayers);
            }
        };

        ws.onclose = (event) => {
            console.log('WebSocket fermé, code :', event.code);
        };

        ws.onerror = (error) => {
            console.error('Erreur WebSocket :', error);
        };

        setWebSocket(ws);

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [waitRoomId, maxScore]);

    // Envoi du nom d'utilisateur une fois que le WebSocket est ouvert
    useEffect(() => {
        if (webSocket && webSocket.readyState === WebSocket.OPEN && user) {
            webSocket.send(JSON.stringify({ name: user.username }));
            webSocket.send(JSON.stringify({ nbplayer: nbplayer }));
            console.log("Nom d'utilisateur envoyé via WebSocket :", user.username);
        }
    }, [webSocket, user, nbplayer]);

    return (
        <div className="container-fluid waiting-container text-center d-flex justify-content-center align-items-center">
            <div className="card bg-transparent border-light glass-card">
                <div className="card-body">
                    <h1 className="card-title waiting-title">En attente des joueurs</h1>
                    <div className="card-text">
                        {players.length > 0 ? (
                            players.map(player => (
                                <div key={player} className="player-list present">{player}</div>
                            ))
                        ) : (
                            <p className="no-players">Aucun joueur connecté</p>
                        )}
                    </div>
                    <div className="game-info mt-3">
                        <div><strong>ID de la salle :</strong> {waitRoomId}</div>
                        <div><strong>Score maximum :</strong> {maxScore}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WaitingTournaments;
