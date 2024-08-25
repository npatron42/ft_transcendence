from users.models import User
import re

def isValidEmailFormat(email: str) -> bool:
	regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
	if not re.match(regex, email):
		return False
	return True

	

	
	