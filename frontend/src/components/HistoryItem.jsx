import "./matchHistory.css"

function HistoryItem({ match }) {

	let win = "win"
	if (match.win)
		win = "win"
	else
		win = "lose"

	let date = match.date
	let newDate = "";
	


	for (let i = 5; i <= 9; i++) {
		let days;
		let month;

		days = (date[8] + date[9])
		month = (date[5] + date[6])
		newDate = days + " / " + month
	}

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
			<div className="historyItem-part">
				<span className="modifyDate">{newDate}</span>
			</div>
		</div>
    );
}

export default HistoryItem;