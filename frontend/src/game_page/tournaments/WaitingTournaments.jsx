import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTournamentSocket } from '../../provider/TournamentSocketProvider';
import { useAuth } from '../../provider/UserAuthProvider'
import Countdown from '../../components/Coutdown';
import CountdownToHome from '../../components/CountdownToHome';
import '../css/waitTournaments.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { v4 as uuidv4 } from 'uuid';


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
    const [userIsLoser, setUserIsLoser] = useState()
    const [userIsWinner, setUserIsWinner] = useState()
    const [end, setEnd] = useState(false)
    const [winner, setWinner] = useState(null)
    const [second, setSecond] = useState(null)

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
        if (data.message["AFTER-00-LOSER"]) {
            setUserIsLoser(data.message["AFTER-00-LOSER"])
        }
        if (data.message["AFTER-00-WINNER"]) {
            setUserIsWinner(data.message["AFTER-00-WINNER"])
        }
        if (data.message["allTournaments"]) {
            setTournament(data.message["allTournaments"]);
            let i = 0;
            let tournaments = data.message["allTournaments"]
            let myLen = tournaments.length
            while (i < myLen) {
                if (idTournament == tournaments[i].id) {
                    setTournament(tournaments[i])
                }
                i++;
            }
        }
        if (data.message["DISPLAY-MATCH"]) {
                const myOpponent = data.message["DISPLAY-MATCH"]["opponent"]
                const otherMatch = data.message["DISPLAY-MATCH"]["otherMatch"]
                const roomId = data.message["DISPLAY-MATCH"]["room"]
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
        if (data.message["WINNER"]) {
            console.log("WINNER --> ", data.message["WINNER"])
            setEnd(true)
            setSecond[data.message["SECOND"]]
        }
        if (data.message["SECOND"]) {
            console.log("SECOND --> ", data.message)
            setEnd(true)
            setWinner[data.message["WINNER"]]
        }
        };

        const unsubscribeMess = subscribeToTournaments(handleSocketTournament);

        return () => {
            unsubscribeMess();
        };

    }, [subscribeToTournaments, tournamentSocket]);


    console.log("idTournament ---> ", idTournament)


  return (
    <div id="background-container">
        {myTournament && myTournament.players.length !== 4 && !myOpponent && !otherMatch && end === false &&   (
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
        {myTournament && myTournament.players.length === 4 && myOpponent === undefined && !otherMatch === undefined && end === false && (
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



        {myTournament && myTournament.players.length === 4 && myOpponent && otherMatch && end === false && (
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



        {userIsLoser && end === false && (
            <div className="waitingTournament-full fadeIn">
                <div className="finalistsWrite">
                    <span className="finalists">FINALISTS</span>
                </div>
                <div className="winnersMatchs">
                    <div className="headPlayer">
                        <img src={userIsLoser.finalists[0].profilePicture} className="picture"></img>
                    </div>
                    <div>
                        <span className="vsModified">VS</span>
                    </div>
                    <div className="headPlayer">
                        <img src={userIsLoser.finalists[1].profilePicture} className="picture"></img>
                    </div>
                </div>
                <div className="fuckingLoser">
                    <CountdownToHome />
                </div>
            </div>
        )}
        {userIsWinner && end === false && (
            <div className="waitingTournament-full fadeIn">
                <div className="finalistsWrite">
                    <span className="finalists">FINALISTS</span>
                </div>
                <div className="winnersMatchs">
                    <div className="headPlayer">
                        <img src={myUser.profilePicture} className="picture"></img>
                    </div>
                    <div>
                        <span className="vsModified">VS</span>
                    </div>
                    <div className="headPlayer">
                        <img src={userIsWinner.opponent.profilePicture} className="picture"></img>
                    </div>
                    <Countdown roomId={userIsWinner.roomId} idTournament={userIsWinner.idTournament}/>
                </div>
                <div className="fuckingLoser">
                    <span className="eliminated">ELIMINATED</span>
                    <div className="headPlayer">
                        <img src={userIsWinner.playersEliminated[0].profilePicture} className="picture"></img>
                    </div>
                    <div className="headPlayer">
                        <img src={userIsWinner.playersEliminated[1].profilePicture} className="picture"></img>
                    </div>
                </div>
            </div>
        )}
        {end === true && winner !== null && (
            <div className="waitingTournament-full fadeIn">C EST TOI LE FIRST BB</div>
        )}
        {end === true && second !== null && (
            <div>C EST TOI LE SECOND BB</div>
        )}
    </div>
  );
};

export default WaitingTournaments;

