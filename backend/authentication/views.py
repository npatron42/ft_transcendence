from rest_framework.decorators import api_view
from django.http import HttpResponse
from rest_framework.response import Response
from rest_framework import status
from .utils import isValidEmailFormat
from django.core.exceptions import ValidationError

def authIndex():
    return Response("SIGNIN or SIGN UP")


    #  VALID CHAMPS
    #  NOT REGISTER IN THE DB
    #  UNIQUES CHAMPS
def signUp(request):
    email = request.data.email
    if isValidEmailFormat(email) == False:
        raise ValidationError("Mauvais format d'email", code="invalid_email")
    return HttpResponse("ceci est un test")
    

    
    
    