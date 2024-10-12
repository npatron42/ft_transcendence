import "./chat.css"

function Message({myDiscuss, myUser, userSelected}) {



	return (
	<>
	  <div className="div-message-myUser">
		<span className="span-message-myUser">{myDiscuss.length}</span>
	  </div>
	  <div className="div-message-userSelected">
	  	<span className="span-message-myUser">{myDiscuss.length}</span>
	  </div>
	</>
	);
  }

export default Message;