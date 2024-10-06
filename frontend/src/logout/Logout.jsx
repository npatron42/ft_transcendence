import { useNavigate  } from 'react-router-dom';


function Logout() {
	const navigate = useNavigate();

	const handleDisconnect = () => {
		localStorage.removeItem("jwt");
		navigate("/")
	}

	return (
			<i class="bi bi-box-arrow-right" onClick={() => handleDisconnect()}></i>
	)
};

export default Logout;