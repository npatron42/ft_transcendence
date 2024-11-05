import axios from 'axios';

// const hostPart = process.env.REACT_APP_HOST_PART;
// const host_Part = '${host}' ;
// if (!hostPart) {
//     console.error("REACT_APP_HOST_PART is not defined");
// }

// GET METHODS

const host = import.meta.env.VITE_HOST;

export const setJwt = async (codeFromUrl) => {
	try {
		const response = await axios.post(`http://${host}:8000/oauth2/login/`, {
			code: codeFromUrl,
		});

		if (response.data.Error === `Failed during creation proccess, to DB`)
			return ;

		console.log("wesh JWT", response.data.jwt);
		
		const myJWT = localStorage.setItem(`jwt`, response.data.jwt);
	} catch (error) {
		console.error(`Error during login:`, error);
	}
};


export const getUser = async () => {
	try {
		const token = localStorage.getItem('jwt');
		const config = {
			headers: {
				Authorization: `Bearer ${token}`
			}
		};
		
		const response = await axios.get(`http://${host}:8000/api/user/`, config);

		// console.log(`Response from getUser :`, response.data);

		return response.data;
	} catch (error) {
		console.error(`Error fetching user data:`, error);
		throw error;
	}
};

export const postPicture = async (myData) => {
	try {
		const token = localStorage.getItem('jwt');
		const config = {
			headers: {
				'Content-Type': 'multipart/form-data',
				Authorization: `Bearer ${token}`
			}
		};
		const response = await axios.post(`http://${host}:8000/api/uploadProfilePicture/`, myData, config);

		// console.log(response.data);

		return response.data;
	} catch (error) {
		console.error(`Error fetching user data:`, error);
		throw error;
	}
};

export const resetPicture = async () => {
	try {
		const token = localStorage.getItem('jwt');
		const config = {
			headers: {
				Authorization: `Bearer ${token}`
			}
		};
		const response = await axios.post(`http://${host}:8000/api/resetProfilePicture/`, {}, config);

		// console.log(response.data);
		return(response.data);

	} catch (error) {
		console.error(`Error fetching user data:`, error);
		throw error;
	}
};



export const sendLangue = async (langue) => {
	try {
		const token = localStorage.getItem('jwt');
		const config = {
			headers: {
				Authorization: `Bearer ${token}`
			}
		};
		const response = await axios.post(`http://${host}:8000/api/changeLangue/`, { langue } , config);

		console.log(response.data);

		return(response.data);

	} catch (error) {
		console.error(`Error fetching user data:`, error);
		throw error;
	}
};

export const sendName = async (name) => {
	try {
		const token = localStorage.getItem('jwt');
		const config = {
			headers: {
				Authorization: `Bearer ${token}`
			}
		};
		const response = await axios.post(`http://${host}:8000/api/changeName/`, { name } , config);

		console.log(response.data);

		return(response.data);

	} catch (error) {
		console.error(`Error fetching user data:`, error);
		throw error;
	}
};

export const sendMail = async (mail) => {
	try {
		const token = localStorage.getItem('jwt');
		const config = {
			headers: {
				Authorization: `Bearer ${token}`
			}
		};
		const response = await axios.post(`http://${host}:8000/api/changeMail/`, { mail } , config);

		console.log(response.data);

		return(response.data);

	} catch (error) {
		console.error(`Error fetching user data:`, error);
		throw error;
	}
};

export const sendPass = async (pass) => {
	try {
		const token = localStorage.getItem('jwt');
		const config = {
			headers: {
				Authorization: `Bearer ${token}`
			}
		};
		const response = await axios.post(`http://${host}:8000/api/changePass/`, { pass } , config);

		console.log(response.data);

		return(response.data);

	} catch (error) {
		console.error(`Error fetching user data:`, error);
		throw error;
	}
};

export const checkPass = async (pass) => {
	try {
		const token = localStorage.getItem('jwt');
		const config = {
			headers: {
				Authorization: `Bearer ${token}`
			}
		};
		const response = await axios.post(`http://${host}:8000/api/checkPass/`, { pass } , config);

		console.log(response.data);

		return(response.data);

	} catch (error) {
		console.error(`Error fetching user data:`, error);
		throw error;
	}
};

export const getAllUsers = async () => {
	try {
		const token = localStorage.getItem('jwt');
		const config = {
			headers: {
				Authorization: `Bearer ${token}`
			}
		};
		
		const response = await axios.get(`http://${host}:8000/api/users/`, config);

		return response.data;
	} catch (error) {
		console.error(`Error fetching user data:`, error);
		throw error;
	}
};

export const getFriendsList = async () => {
	try {
		const token = localStorage.getItem('jwt');
		const config = {
			headers: {
				Authorization: `Bearer ${token}`
			}
		};
		
		const response = await axios.get(`http://${host}:8000/api/friendsList/`, config);

		return response.data;
	} catch (error) {
		console.error(`Error fetching user data:`, error);
		throw error;
	}
};

export const getUsersList = async () => {
	try {
		const token = localStorage.getItem('jwt');
		const config = {
			headers: {
				Authorization: `Bearer ${token}`
			}
		};
		
		const response = await axios.get(`http://${host}:8000/api/usersList/`, config);

		return response.data;
	} catch (error) {
		console.error(`Error fetching user data:`, error);
		throw error;
	}
};

export const getGamesInvitations = async () => {
	try {
		const token = localStorage.getItem('jwt');
		const config = {
			headers: {
				Authorization: `Bearer ${token}`
			}
		};
		
		const response = await axios.get(`http://${host}:8000/api/user/gamesInvitations/`, config);

		return response.data;
	} catch (error) {
		console.error(`Error fetching user data:`, error);
		throw error;
	}
};

export const getMatchHistory = async () => {
	try {
		const token = localStorage.getItem('jwt');
		const config = {
			headers: {
				Authorization: `Bearer ${token}`
			}
		};
		
		const response = await axios.get(`http://${host}:8000/api/user/matchHistory/`, config);

		return response.data;
	} catch (error) {
		console.error(`Error fetching user data:`, error);
		throw error;
	}
};

export const getFriendsInvitations = async () => {
	try {
		const token = localStorage.getItem('jwt');
		const config = {
			headers: {
				Authorization: `Bearer ${token}`
			}
		};
		
		const response = await axios.get(`http://${host}:8000/api/user/friendsInvitations/`, config);

		return response.data;
	} catch (error) {
		console.error(`Error fetching user data:`, error);
		throw error;
	}
};

export const getDiscussions = async (myData) => {

	try {
		const token = localStorage.getItem('jwt');
		const config = {
			headers: {
				Authorization: `Bearer ${token}`
			}
		};
		

		console.log(`myData GD ---> `, myData)
		const response = await axios.get(`http://${host}:8000/api/user/discussions/`, {
			params: myData,
			...config
		});

		return response.data;
	} catch (error) {
		console.error(`Error fetching user data:`, error);
		throw error;
	}
};


// POST METHODS

export const postInvite = async (myData) => {
	try {
		const token = localStorage.getItem('jwt');
		const config = {
			headers: {
				Authorization: `Bearer ${token}`
			}
		};
		
		const response = await axios.post(`http://${host}:8000/api/sendInvite/`, myData, config);

		return response.data;
	} catch (error) {
		console.error(`Error fetching user data:`, error);
		throw error;
	}
};

export const toggle2fa = async (dauth) => {
	console.log(`test`)
	try {
		const token = localStorage.getItem('jwt');
		const config = {
			headers: {
				Authorization: `Bearer ${token}`
			}
		};
		const response = await axios.post(`http://${host}:8000/api/toggle2fa/`, { dauth } , config);

		console.log(response.data);

		return(response.data);getBlockedRelations2

	} catch (error) {
		console.error(`Error fetching user data:`, error);
		throw error;
	}
};

export const getBlockedRelations = async () => {
	try {
		const token = localStorage.getItem('jwt');
		const config = {
			headers: {
				Authorization: `Bearer ${token}`
			}
		};
		
		const response = await axios.get(`http://${host}:8000/api/blockedUsers/`, config);

		return response.data;
	} catch (error) {
		console.error(`Error fetching user data:`, error);
		throw error;
	}
};

export const getBlockedRelations2 = async () => {
	try {
		const token = localStorage.getItem('jwt');
		const config = {
			headers: {
				Authorization: `Bearer ${token}`
			}
		};
		
		const response = await axios.get(`http://${host}:8000/api/blockedUsers2/`, config);

		return response.data;
	} catch (error) {
		console.error(`Error fetching user data:`, error);
		throw error;
	}
};

//RGPD 

export const deleteProfil = async () => {
	try {
		const token = localStorage.getItem('jwt');
		const config = {
			headers: {
				Authorization: `Bearer ${token}`
			}
		};
		const response = await axios.post(`http://${host}:8000/api/delProfile/`, {}, config);

		// console.log(response.data);
		return(response.data);

	} catch (error) {
		console.error(`Error fetching user data:`, error);
		throw error;
	}
};

export const recupProfil = async () => {
	try {
		const token = localStorage.getItem('jwt');
		const config = {
			headers: {
				Authorization: `Bearer ${token}`
			}
		};
		const response = await axios.post(`http://${host}:8000/api/exportProfile/`, {}, config);

		console.log(response.data);
		return(response);

	} catch (error) {
		console.error(`Error fetching user data:`, error);
		throw error;
	}
};