import Image from 'react-bootstrap/Image';
import "./utils.css";
import Pong from "./pong.png";
import { getMediaUrl } from '../api/api';
import { useAuth } from '../provider/UserAuthProvider';
import {useNavigate} from 'react-router-dom'

const host = import.meta.env.VITE_HOST;

function image() {

	const navigate = useNavigate();
	const { myUser } = useAuth();

	const showMyProfile = () => {
		const myProfile = myUser.username;
		const link = "/profile/" + myProfile;
		navigate(link)
	}


  return (
	  <div> 
		<Image className="image-style"
		 src={getMediaUrl(myUser.profilePicture)}
		 roundedCircle
		 onClick={() => showMyProfile()} />
	</div>
  );
}

export default image