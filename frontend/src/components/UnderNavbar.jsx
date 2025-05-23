import { useNavigate, useLocation, } from 'react-router-dom';
import "./components.css"


function UnderNavbar() {
  const navigate = useNavigate();

	const handleProfile = () => {
		navigate("/profile")
	}
	const handleDisconnect = () => {
		localStorage.clear();
		navigate("/")
	}

  return (
    <div className="underNavbar">
		<tr className="underNavbar-tr">
			<i className="bi bi-person-lines-fill profileBS" onClick={() => handleProfile()}></i>
			<i className="bi bi-box-arrow-right profileBS" onClick={() => handleDisconnect()}></i>	
		</tr>
    </div>
  );
}

export default UnderNavbar