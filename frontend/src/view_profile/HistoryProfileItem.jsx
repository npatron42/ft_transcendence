import "bootstrap/dist/css/bootstrap.min.css";
import "./viewProfile.css";


function HistoryProfileItem({ match }) {
    const winClass = match.win ? "win" : "lose";

    return (
        <div className="historyItem d-flex align-items-center justify-content-between p-2 border-bottom">
            <div className="historyItem-part d-flex align-items-center">
                <img src={match.opponent.profilePicture} className="profile-picture2 rounded-circle me-3" alt="Opponent profile" />
                <span className="modifyUsername">{match.opponent.username}</span>
            </div>
            <div className="historyItem-part text-center">
                <span className={`modifyScore ${winClass}`}>{match.score}</span>
            </div>
            <div className="historyItem-part text-center">
                <span className={`modify ${winClass}`}>{winClass}</span>
            </div>
        </div>
    );
}

export default HistoryProfileItem;
