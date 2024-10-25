import "./matchHistory.css"

function HistoryItem({ match }) {

	let win = "win"
	if (match.win)
		win = "win"
	else
		win = "lose"
    return (
		<div className="historyItem">
			<div className="historyItem-part">
				<span className="modifyUsername">{match.opponent.username}</span>
			</div>
			<div className="historyItem-part">
				<span className={`modifyScore${win}`}>{match.score}</span>
			</div>
			<div className="historyItem-part">
				<span className={`modify${win}`}>{win}</span>
			</div>
		</div>
    );
}

export default HistoryItem;