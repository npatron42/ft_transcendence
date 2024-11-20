import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../provider/WebSocketProvider';
import { useTournamentSocket } from '../provider/TournamentSocketProvider';

import "./showTournaments.css"

function ShowTournaments() {

	const [myTournaments, setTournaments] = useState([])
	const {tournamentSocket, subscribeToTournaments} = useTournamentSocket()
	const navigate = useNavigate()

	useEffect(() => {
        const handleSocketTournament = (data) => {
			if (data.message["allTournaments"]) {
				setTournaments(data.message["allTournaments"]);
            }
        };

        const unsubscribeMess = subscribeToTournaments(handleSocketTournament);

        return () => {

            unsubscribeMess();

        };

    }, [subscribeToTournaments, tournamentSocket]);

	const handleJoinTournament = (idTournament) => {
		const myDataToSend = {
			"type": "JOIN-TOURNAMENT",
			"id": idTournament
		}
		if (tournamentSocket) {
			tournamentSocket.send(JSON.stringify(myDataToSend))
		}
		navigate("/waitingTournaments", { state: { idTournament } })
		return ;
	}

	return (
		<div className="showTournaments">
			<div className="showTournaments-header">
				<span className="modifyWriteTournament">TOURNAMENTS</span>
			</div>
			{myTournaments.length === 0 && (
				<>
				<div className="showTournaments-content">
					<span className="modifyWriteTournament-2">There is no tournament for the moment...</span>
				<div class="wrapper">
					<div class="circle"></div>
					<div class="circle"></div>
					<div class="circle"></div>
					<div class="shadow"></div>
					<div class="shadow"></div>
				<div class="shadow"></div>
				</div>
			</div>
			</>
			)}
			{myTournaments.length !== 0 && (
				<div className="showTournaments-content">
				{myTournaments.map((tournament, index) => (
					<div key={index} className="tournamentLine">
						<div className="tournamentLine-picture">
						<img src={tournament.players[0].profilePicture.startsWith('http') ? tournament.players[0].profilePicture : `http://localhost:8000/media/${tournament.players[0].profilePicture}`} alt={`${tournament.players[0].username}'s profile`} className="profile-picture-tournament"/>
						</div>
						<div className="tournamentLine-div">
							<span className="modifyWritingNoIdeaCssFuck">{tournament.players[0].username}</span>
						</div>
						<div className="tournamentLine-div">
							<span className="modifyWritingNoIdeaCssFuck-2">{tournament.players.length} / 4</span>
						</div>
						{tournament.players.length !== 4 && (
						<div className="tournamentLine-button">
							<button className="ui-btn" onClick={() => handleJoinTournament(tournament.id)}>
								<span>
									JOIN 
								</span>
							</button>
						</div>
						)}
						{tournament.players.length === 4 && (
						<div className="tournamentLine-button">
							<button className="ui-btn">
								<span>
									FULL 
								</span>
							</button>
						</div>
						)}
					</div>
				))}
				</div>
			)}
			{/* <div className="tournament-div">

			</div> */}
		</div>
  	);
}

export default ShowTournaments