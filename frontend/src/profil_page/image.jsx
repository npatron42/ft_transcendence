import Image from 'react-bootstrap/Image';
import "./utils.css";
import Pong from "./pong.png";
import { useAuth } from '../provider/UserAuthProvider';

const host = import.meta.env.VITE_HOST;

function image() {
	
	const { myUser } = useAuth();

	console.log(myUser.profilePicture)

  return (
	  <div> 
		<Image className="image-style"
		 src={myUser.profilePicture.startsWith('http') ? myUser.profilePicture : `http://${host}:8000/media/${myUser.profilePicture}`}
		 roundedCircle />
	</div>
  );
}

export default image