import axios from 'axios';

export const fetchData = async (codeFromUrl) => {
	try {
		const response = await axios.post("http://localhost:8000/oauth2/login/", {
			code: codeFromUrl,
		});

		if (response.data.Error === "Failed during creation proccess, to DB")
			return ;

		localStorage.setItem("jwt", response.data.jwt);
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

		console.log("getUser:", response.data);
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

		console.log("getAllUsers", response.data);
		return response.data;
	} catch (error) {
		console.error("Error fetching user data:", error);
		throw error;
	}
};


