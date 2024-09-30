import { useLocation } from 'react-router-dom';

const WaitingTournaments = () => {
    const location = useLocation();
    const invitedPlayer = location.state?.invitedPlayer || [];
    console.log(invitedPlayer);

    return (
        <div>
            {invitedPlayer.map(player => (
                <div key={player.id}>{player.name}</div>
            ))}
        </div>
    );
};

export default WaitingTournaments;
