import "./chat.css"

function Chat() {

    console.log("Chat called !");
    return (
        <div className="chat">
            <div className="chat-discussions">
                <div className="chat-header">
                    <div className="header-logo logo-header"><i class="bi bi-people-fill"></i></div>
                    <div className="header-logo logo-header"><i class="bi bi-chat"></i></div>
                    <div className="header-logo logo-header"><i class="bi bi-search"></i></div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
