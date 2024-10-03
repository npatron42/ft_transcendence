import axios from 'axios';

// GET METHODS

export const fetchData = async (codeFromUrl) => {
	try {
		const response = await axios.post("http://localhost:8000/oauth2/login/", {
			code: codeFromUrl,
		});

		if (response.data.Error === "Failed during creation proccess, to DB")
			return ;

		const myJWT = localStorage.setItem("jwt", response.data.jwt);
		console.log(myJWT)
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

