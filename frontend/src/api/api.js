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

		return response.data;
	} catch (error) {
		console.error("Error fetching user data:", error);
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
		
		const response = await axios.get("http://localhost:8000/api/blockedUsers/", config);

		return response.data;
	} catch (error) {
		console.error("Error fetching user data:", error);
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
		
		const response = await axios.get("http://localhost:8000/api/blockedUsers2/", config);

		return response.data;
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
		
		const response = await axios.get("http://localhost:8000/api/friendsList/", config);

		return response.data;
	} catch (error) {
		console.error("Error fetching user data:", error);
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
		
		const response = await axios.get("http://localhost:8000/api/usersList/", config);

		return response.data;
	} catch (error) {
		console.error("Error fetching user data:", error);
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
		
		const response = await axios.get("http://localhost:8000/api/user/gamesInvitations/", config);

		return response.data;
	} catch (error) {
		console.error("Error fetching user data:", error);
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
		
		const response = await axios.get("http://localhost:8000/api/user/matchHistory/", config);

		return response.data;
	} catch (error) {
		console.error("Error fetching user data:", error);
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
		
		const response = await axios.get("http://localhost:8000/api/user/friendsInvitations/", config);

		return response.data;
	} catch (error) {
		console.error("Error fetching user data:", error);
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
		

		console.log("myData GD ---> ", myData)
		const response = await axios.get("http://localhost:8000/api/user/discussions/", {
			params: myData,
			...config
		});

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

