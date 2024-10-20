import { useEffect, useRef } from 'react';


function Message({ myDiscuss, myUser, userSelected }) {

    const scrollDown = useRef(null)

    useEffect(() => {
        if (scrollDown.current) {
            scrollDown.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [myDiscuss])

	const chooseCssForMePlease = (message) => {
		if (message.sender === myUser.id)
			return ("sender")
		else
			return "receiver"
	}

    return (
        <div className="core-discussion">
        {myDiscuss.map((message, index) => (
            <div 
                key={index} 
                className={`message-wrapper ${chooseCssForMePlease(message)}`}>
                <div className={`div-message-${chooseCssForMePlease(message)}`}>
                    <span className={`message-${chooseCssForMePlease(message)}`}></span>
                    <span className="message-receiver">{message.message}</span>
                </div>
            </div>
        ))}
        <div ref={scrollDown} />
        </div>
    );
}

export default Message;