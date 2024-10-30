import axios from 'axios';

// GET METHODS

export const setJwt = async (codeFromUrl) => {
	try {
		const response = await axios.post("http://localhost:8000/oauth2/login/", {
			code: codeFromUrl,
		});

		if (response.data.Error === "Failed during creation proccess, to DB")
			return ;

		const myJWT = localStorage.setItem("jwt", response.data.jwt);
	} catch (error) {
		console.error("Error during login:", error);
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
		
		const response = await axios.get("http://localhost:8000/api/user/", config);

		// console.log("Response from getUser :", response.data);

		return response.data;
	} catch (error) {
		console.error("Error fetching user data:", error);
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
		const response = await axios.post("http://localhost:8000/api/uploadProfilePicture/", myData, config);

		// console.log(response.data);

		return response.data;
	} catch (error) {
		console.error("Error fetching user data:", error);
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
		const response = await axios.post("http://localhost:8000/api/resetProfilePicture/", {}, config);

		// console.log(response.data);
		return(response.data);

	} catch (error) {
		console.error("Error fetching user data:", error);
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
		const response = await axios.post("http://localhost:8000/api/changeLangue/", { langue } , config);

		console.log(response.data);

		return(response.data);

	} catch (error) {
		console.error("Error fetching user data:", error);
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
		const response = await axios.post("http://localhost:8000/api/changeName/", { name } , config);

		console.log(response.data);

		return(response.data);

	} catch (error) {
		console.error("Error fetching user data:", error);
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
		const response = await axios.post("http://localhost:8000/api/changeMail/", { mail } , config);

		console.log(response.data);

		return(response.data);

	} catch (error) {
		console.error("Error fetching user data:", error);
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
		const response = await axios.post("http://localhost:8000/api/changePass/", { pass } , config);

		console.log(response.data);

		return(response.data);

	} catch (error) {
		console.error("Error fetching user data:", error);
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
		const response = await axios.post("http://localhost:8000/api/checkPass/", { pass } , config);

		console.log(response.data);

		return(response.data);

	} catch (error) {
		console.error("Error fetching user data:", error);
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
		
		const response = await axios.get("http://localhost:8000/api/users/", config);

		return response.data;
	} catch (error) {
		console.error("Error fetching user data:", error);
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
		
		const response = await axios.get("http://localhost:8000/api/userFriendsList/", config);

		return response.data;
	} catch (error) {
		console.error("Error fetching user data:", error);
		throw error;
	}
};

export const getNotifs = async () => {
	try {
		const token = localStorage.getItem('jwt');
		const config = {
			headers: {
				Authorization: `Bearer ${token}`
			}
		};
		
		const response = await axios.get("http://localhost:8000/api/user/notifs/", config);

		return response.data;
	} catch (error) {
		console.error("Error fetching user data:", error);
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
		
		const response = await axios.post("http://localhost:8000/api/sendInvite/", myData, config);

		return response.data;
	} catch (error) {
		console.error("Error fetching user data:", error);
		throw error;
	}
};

export const toggle2fa = async (dauth) => {
	console.log("test")
	try {
		const token = localStorage.getItem('jwt');
		const config = {
			headers: {
				Authorization: `Bearer ${token}`
			}
		};
		const response = await axios.post("http://localhost:8000/api/toggle2fa/", { dauth } , config);

		console.log(response.data);

		return(response.data);

	} catch (error) {
		console.error("Error fetching user data:", error);
		throw error;
	}
};