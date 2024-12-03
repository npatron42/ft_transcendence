import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { getMediaUrl } from '../api/api'
import { useTournamentSocket } from '../provider/TournamentSocketProvider';
import { useTranslation } from 'react-i18next';

import "./showTournaments.css"

export default function ShowTournaments() {

	const [myTournaments, setTournaments] = useState([])
	const {tournamentSocket, subscribeToTournaments} = useTournamentSocket()
	const navigate = useNavigate()
	const { t } = useTranslation();

	useEffect(() => {
        const handleSocketTournament = (data) => {
			if (data.message["allTournaments"]) {
				setTournaments(data.message["allTournaments"]);
				console.log(data.message["allTournaments"])
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
				<span className="modifyWriteTournament">{t('tournament.tournament')}</span>
			</div>
			{myTournaments.length === 0 && (
				<>
				<div className="showTournaments-content">
					<span className="modifyWriteTournament-2">{t('tournament.noTournament')}</span>
				<div className="wrapper">
					<div className="circle"></div>
					<div className="circle"></div>
					<div className="circle"></div>
					<div className="shadow"></div>
					<div className="shadow"></div>
				<div className="shadow"></div>
				</div>
			</div>
			</>
			)}
			{myTournaments.length !== 0 && (
				<div className="showTournaments-content">
				{myTournaments.map((tournament, index) => (
					<div key={index} className="tournamentLine">
						<div className="tournamentLine-picture">
							<img src={getMediaUrl(tournament.players[0].profilePicture)} alt={`${tournament.players[0].username}'s profile`} className="profile-picture-tournament"/>
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
									{t('tournament.join')} 
								</span>
							</button>
						</div>
						)}
						{tournament.players.length === 4 && (
						<div className="tournamentLine-button">
							<button className="ui-btn">
								<span>
									{t('tournament.full')}
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
