import {useState} from 'react'

export default function Buttont() {
  
	const [login, setlogin] = useState("login")
	
	function handleClick(){
		setlogin("isouaidi")
	}

	return (
	<div>
		<p>{login}</p>
		<button onClick={handleClick}>add</button>
	</div>
  )
}
