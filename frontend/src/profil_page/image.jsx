import Image from 'react-bootstrap/Image';
import "./utils.css"
import Pong from "./pong.png"

function image() {
  return (
	  <div> 
		<Image className="image-style" src={Pong} roundedCircle />
	</div>
  );
}

export default image