import Image from 'react-bootstrap/Image';
import "./utils.css";
import Pong from "./pong.png";
import { getMediaUrl } from '../api/api';
import { useAuth } from '../provider/UserAuthProvider';

const host = import.meta.env.VITE_HOST;

function image() {
	
	const { myUser } = useAuth();

  return (
	  <div> 
		<Image className="image-style"
		 src={getMediaUrl(myUser.profilePicture)}
		 roundedCircle />
	</div>
  );
}

export default image