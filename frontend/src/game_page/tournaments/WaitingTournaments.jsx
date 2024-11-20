import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTournamentSocket } from '../../provider/TournamentSocketProvider';
import { useAuth } from '../../provider/UserAuthProvider'
import Countdown from '../../components/Coutdown';
import '../css/waitTournaments.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const host = import.meta.env.VITE_HOST;


const WaitingTournaments = () => {
    const {myUser} = useAuth()
    const [myTournament, setTournament] = useState()
    const [myOpponent, setOpponent] = useState()
    const [myRoomId, setRoomId] = useState()
    const [otherMatch, setOtherMatch] = useState()
    const { tournamentSocket, subscribeToTournaments } = useTournamentSocket();
    const location = useLocation();
    const idTournament = location.state?.idTournament;
    const navigate = useNavigate()

    useEffect(() => {

        const isRefreshed = localStorage.getItem('isRefreshed');
        if (isRefreshed) {
        navigate('/home');
        } else {
        localStorage.setItem('isRefreshed', 'true');
        }
        return () => localStorage.removeItem('isRefreshed');
    }, [navigate]);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
        const myData = {
            "type": "LEAVE-TOURNAMENT",
            "id": idTournament,
        };
        if (tournamentSocket) {
            tournamentSocket.send(JSON.stringify(myData));
        }
        };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);

      const myData = {
        "type": "LEAVE-TOURNAMENT",
        "id": idTournament,
      };
      if (tournamentSocket) {
          tournamentSocket.send(JSON.stringify(myData));
      }
    };
  }, [idTournament, tournamentSocket, location]);

    useEffect(() => {
    
        const handleSocketTournament = (data) => {
        if (data.message["allTournaments"]) {
            setTournament(data.message["allTournaments"]);
            let i = 0;
            let tournaments = data.message["allTournaments"]
            let myLen = tournaments.length
            while (i < myLen) {
                if (idTournament == tournaments[i].id) {
                    setTournament(tournaments[i])
                    console.log(tournaments[i].players[i].username)
                    console.log(tournaments[i])
                    return ;
                }
                i++;
            }
            }
        if (data.message["TOURNAMENT-FULL"]) {
                console.log(data.message)
                console.log("RECEIVED NOW")
        }
        if (data.message["DISPLAY-MATCH"]) {
                console.log(data.message["DISPLAY-MATCH"])
                const myOpponent = data.message["DISPLAY-MATCH"]["opponent"]
                const otherMatch = data.message["DISPLAY-MATCH"]["otherMatch"]
                const roomId = data.message["DISPLAY-MATCH"]["room"]
                console.log("opponent ---> ", myOpponent.profilePicture)
                setOpponent(myOpponent)
                setOtherMatch(otherMatch)
                setRoomId(roomId)
        }
        if (data.message["CANCEL-MATCH"]) {
            const myOpponent = undefined;
            const otherMatch = undefined;
            setOpponent(myOpponent)
            setOtherMatch(otherMatch)
    }
        };

        const unsubscribeMess = subscribeToTournaments(handleSocketTournament);

        return () => {
            unsubscribeMess();
        };

    }, [subscribeToTournaments, tournamentSocket]);





  return (
    <div id="background-container">
        {myTournament && myTournament.players.length !== 4 && !myOpponent && !otherMatch &&  (
        <div className="waitingTournament">
            {myTournament !== undefined && (
                <>
                <div className="playerWaiting playerWaiting-leftTop">
                    <div className="top">
                        <img src={myTournament.players[0].profilePicture} className="picture"></img>   
                    </div>
                    <div className="bot">
                        <span className="usernamePlacement">{myTournament.players[0].username}</span>
                    </div>
                </div>
                {!myTournament.players[1] && (
                <div className="playerWaiting playerWaiting-rightTop">
                    <div className="top">
                        <span className="writeWaitingOpponent"> Waiting for opponent...</span>
                    </div>
                    <div className="bot">
                        <div className="loader-2">
                        </div>
                    </div>
                </div>
                )}
                {myTournament.players[1] && (
                <div className="playerWaiting playerWaiting-rightTop">
                    <div className="top">
                        <img src={myTournament.players[1].profilePicture} className="picture"></img>   
                    </div>
                    <div className="bot">
                        <span className="usernamePlacement">{myTournament.players[1].username}</span>
                    </div>
                </div>
                )}

                {!myTournament.players[2] && (
                <div className="playerWaiting playerWaiting-leftDown">
                    <div className="top">
                    <span className="writeWaitingOpponent"> Waiting for opponent...</span>
                    </div>
                    <div className="bot">
                        <div className="loader-2">
                        </div>
                    </div>
                </div>
                )}
                {myTournament.players[2] && (
                <div className="playerWaiting playerWaiting-leftDown">
                    <div className="top">
                        <img src={myTournament.players[2].profilePicture} className="picture"></img>   
                    </div>
                    <div className="bot">
                        <span className="usernamePlacement">{myTournament.players[2].username}</span>
                    </div>
                </div>
                )}

                {!myTournament.players[3] && (
                <div className="playerWaiting playerWaiting-rightDown">
                    <div className="top">
                        <span className="writeWaitingOpponent"> Waiting for opponent...</span>
                    </div>
                    <div className="bot">
                        <div className="loader-2">
                        </div>
                    </div>
                </div>
                )}
                {myTournament.players[3] && (
                <div className="playerWaiting playerWaiting-rightDown">
                    <div className="top">
                        <img src={myTournament.players[3].profilePicture} className="picture"></img>   
                    </div>
                    <div className="bot">
                        <span className="usernamePlacement">{myTournament.players[3].username}</span>
                    </div>
                </div>
                )}
                </>
            )}
        </div>
        )}
        {myTournament && myTournament.players.length === 4 && myOpponent === undefined && !otherMatch === undefined &&  (
            <div className="waitingTournament-full fadeIn">
                <div className="topFull">
                    <span className="tournamentWriting">Tournament will start</span>
                </div>
                <div className="headsTournament">
                    <div className="headPlayer">
                        <img src={myTournament.players[0].profilePicture} className="picture"></img>
                    </div> 
                    <div className="headPlayer">
                        <img src={myTournament.players[1].profilePicture} className="picture"></img>
                    </div> 
                    <div className="headPlayer">
                        <img src={myTournament.players[2].profilePicture} className="picture"></img>
                    </div> 
                    <div className="headPlayer">
                        <img src={myTournament.players[3].profilePicture} className="picture"></img>
                    </div> 
                </div>
                <div className="loaderBot">
                    <div className="loader-2"></div>
                </div>
            </div>
        )}
        {myTournament && myTournament.players.length === 4 && myOpponent && otherMatch && (
            <div className="waitingTournament-bis fadeIn">
                <div className="displayMatch">
                    <div className="displayUser-left">
                        <img src={myUser.profilePicture} className="picture"></img>   
                    </div>
                    <div className="versus-left">
                        <span className="vsModified">VS</span>
                    </div>
                    <div className="displayUser-left">
                        <img src={myOpponent.profilePicture} className="picture"></img>
                    </div>
                    <Countdown roomId={myRoomId} idTournament={idTournament}/>
                </div>
                <div className="displayMatch">
                    <div className="displayUser-right">
                        <img src={otherMatch[0].profilePicture} className="picture"></img>
                    </div>
                    <div className="versus-right">
                        <span className="vsModified">VS</span>
                    </div>
                    <div className="displayUser-right">
                        <img src={otherMatch[1].profilePicture} className="picture"></img>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default WaitingTournaments;

