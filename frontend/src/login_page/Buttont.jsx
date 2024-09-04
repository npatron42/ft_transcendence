import {useState} from 'react'

export default function Buttont() {
  
	const [login, setlogin] = useState("default")
	
	function handleClick(){
		setlogin("seconnecter ")
	} 

	return (
	<div>
		<h1>{login}</h1>
		<button onClick={() => setlogin("npatron")}>npatron </button>
		<button onClick={() => setlogin("isouaidi")}> isouaidi</button>
	</div>
  )
}
