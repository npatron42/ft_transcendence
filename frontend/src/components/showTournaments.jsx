import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../provider/WebSocketProvider';
import { useTournamentSocket } from '../provider/TournamentSocketProvider';

import "./showTournaments.css"

function ShowTournaments() {

	const [myTournaments, setTournaments] = useState([])
	const {tournamentSocket, subscribeToTournaments} = useTournamentSocket()

	useEffect(() => {
        const handleSocketTournament = (data) => {
			if (data.message["allTournaments"]) {
				setTournaments(data.message["allTournaments"]);
				console.log("data --> ", data.message["allTournaments"])
				console.log("NB de tournois --> ", data.message["allTournaments"].length)
            }
        };

        const unsubscribeMess = subscribeToTournaments(handleSocketTournament);

        return () => {

            unsubscribeMess();

        };

    }, [subscribeToTournaments, tournamentSocket]);


	return (
		<div className="showTournaments">
			<div className="showTournaments-header">
				<span className="modifyWriteTournament">TOURNAMENTS</span>
			</div>
			<div className="showTournaments-content">
				OUI
			</div>
			<div className="tournament-div">

			</div>
		</div>
  	);
}

export default ShowTournaments