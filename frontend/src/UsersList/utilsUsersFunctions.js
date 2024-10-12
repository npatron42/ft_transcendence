import { getAllUsers, getFriendsList } from "../api/api";
import { useAuth } from "../provider/UserAuthProvider";



export const defineUsersFriendsList = async (myUser) => {

	const myFriendsList = await getFriendsList();
	const myList = await getAllUsers();
	const filteredList = myList.filter(user => user.username !== myUser.username);
	const withoutFriends = [];
	for (let i = 0; i < filteredList.length; i++) {
		let isFriend = false;
		const tmpName = filteredList[i].username;
		for (let i = 0; i < myFriendsList.length; i++) {
			if (tmpName === myFriendsList[i].username) {
				isFriend = true;
			}
		}
		if (isFriend == false)
			withoutFriends.push(filteredList[i])
	}
	return [myFriendsList, withoutFriends]
};

