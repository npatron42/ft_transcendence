import React from 'react';
import { redirect } from "react-router-dom";
import './Button.css';

export default function Button42() {

	const handleClick = async () => {
		return window.location.href = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-833368055563188d4e7433e8ee83fe676656a831c2c0651ff295be883bde7122&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fhome&response_type=code";
    }

	return (
		<div>
			<button class="favorite styled" type="button" onClick={handleClick}>Sign In With 42</button>
		</div>
	)
}
