import "./matchHistory.css"

function HistoryItem({ match }) {

	let win = "win"
	if (match.win)
		win = "win"
	else
		win = "lose"

	console.log(match)
    return (
		<div className="historyItem">
			<div className="historyItem-part">
				<span className="modifyUsername">{match.opponent.username}</span>
			</div>
			<div className="historyItem-part">
				<span className="modifyUsername">{match.score}</span>
			</div>
			<div className="historyItem-part">
				<span className="modifyUsername">{win}</span>
			</div>
		</div>
    );
}

export default HistoryItem;