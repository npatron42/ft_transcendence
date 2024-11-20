import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useTournamentSocket } from "../provider/TournamentSocketProvider";
import { v4 as uuidv4 } from 'uuid';
import "./countdown.css"
const Countdown = ({roomId, idTournament}) => {
	const [seconds, setSeconds] = useState(1);
	const {tournamentSocket} = useTournamentSocket();
	const navigate = useNavigate();
	const isTournament = true;

  useEffect(() => {
    if (seconds === 0) return;

    const interval = setInterval(() => {
      setSeconds(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  const launchGame = () => {
	const dataToSend = {
		"type": "NAVIGATE-TO-MATCH",
	}
	tournamentSocket.send(JSON.stringify(dataToSend))
	const maxScore = 1;
	const powerUp = false;
	navigate(`/globalGameMulti/${roomId}`, { state: { maxScore, powerUp, isTournament, idTournament } });
	return ;
  }

  return (
    <div className="countdown">
		{seconds !== 0 && (
			<span className="seconds">{seconds}</span>
		)}
		{seconds === 0 && (
			<span className="loader-2">{launchGame()}</span>
		)}
    </div>
  );
};

export default Countdown