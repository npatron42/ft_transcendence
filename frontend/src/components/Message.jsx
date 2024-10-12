function Message({ myDiscuss, myUser, userSelected }) {

	const chooseCssForMePlease = (message) => {
		if (message.sender === myUser.id)
			return ("sender")
		else
			return "receiver"
	}

    return (
        <div className="core-discussion">
            {myDiscuss.map((message, index) => (
                <div key={index} className={`div-message-${chooseCssForMePlease(message)}`}>
                    <span className={`message-${chooseCssForMePlease(message)}`}></span>
                    <span className="message-receiver">{message.message}</span>
                </div>
            ))}
        </div>
    );
}

export default Message;