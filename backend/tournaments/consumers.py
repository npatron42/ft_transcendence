from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
import json
import uuid
import logging
from users.serializers import UserSerializer
from users.models import User
import time
import random
import asyncio

logger = logging.getLogger(__name__)






async def getUserById(myId):
    userTmp = await sync_to_async(User.objects.get)(id=myId)
    userSer = UserSerializer(userTmp)
    return userSer.data

async def getUserByUsername(myUsername):
    userTmp = await sync_to_async(User.objects.get)(username=myUsername)
    userSer = UserSerializer(userTmp)
    return userSer.data

async def sendToSocket(self, socket, message):
        await self.channel_layer.send(socket, {
            "type": "socketTournament",
            "message": message,
        })

async def sendToTournamentsSocket(self, message):
        myLen = len(allUsers)

        i = 0
        while i < myLen:
            myUser = allUsers[i]
            mySocket = allSockets.get(myUser.username)
            await sendToSocket(self, mySocket, message)
            i += 1
        return

async def sendToPlayersInTournament(self, message, idTournament):
        myTournament = await giveTournament(idTournament)
        myPlayers = myTournament["players"]
        i = 0
        myLen = len(userInTournament)
        while i < myLen:
            myUsername = myPlayers[i].get("username")
            mySocket = allSockets.get(myUsername)
            await sendToSocket(self, mySocket, message)
            i += 1
        return


async def giveTournament(id):
    players = []
    leader = await getUserById(Tournament.leader[id])
    myLen = len(Tournament.players[id])
    i = 0
    while i < myLen:
        myPlayer = await getUserById(Tournament.players[id][i])
        players.append(myPlayer)
        i += 1
    tournament = {
        "id": id,
        "leader": leader,
        "players": players,
    }
    return tournament

async def returnAllTournaments():
    mySize = len(allTournamentsId)
    i = 0
    result = []
    while i < mySize:
        resultTmp = await giveTournament(allTournamentsId[i])
        result.append(resultTmp)
        i += 1
    return result


async def sendFirstMatch(self, myPlayer, match00, match01, idRoom1, idRoom2):

    match0 = list(match00)
    match1 = list(match01)
    myRealPlayer = await getUserById(myPlayer)
    if myPlayer in match00:
        match0.remove(myPlayer)
        myOpponent = await getUserById(match0[0])

        otherPlayer = await getUserById(match1[0])
        otherPlayer2 = await getUserById(match1[1])

        otherMatch = []
        otherMatch.append(otherPlayer)
        otherMatch.append(otherPlayer2)
        dataToSend = {
            "opponent": myOpponent,
            "otherMatch": otherMatch,
            "room": str(idRoom1)
        }

        dataToSendBis = {
            "DISPLAY-MATCH": dataToSend
        }
        myUsername = myRealPlayer.get("username")
        mySocket = allSockets.get(myUsername)

        await sendToSocket(self, mySocket, dataToSendBis)
    elif myPlayer in match01:
        match1.remove(myPlayer)
        myOpponent = await getUserById(match1[0])

        otherPlayer = await getUserById(match0[0])
        otherPlayer2 = await getUserById(match0[1])

        otherMatch = []
        otherMatch.append(otherPlayer)
        otherMatch.append(otherPlayer2)
        dataToSend = {
            "opponent": myOpponent,
            "otherMatch": otherMatch,
            "room": str(idRoom2)
        }

        dataToSendBis = {
            "DISPLAY-MATCH": dataToSend
        }
        myUsername = myRealPlayer.get("username")
        mySocket = allSockets.get(myUsername)

        await sendToSocket(self, mySocket, dataToSendBis)

    return 
    
def addSocketToUser(socket, username):
    allSockets[username] = socket

def deleteSocketToUser(username):
    del allSockets[username]

def findMatch(players):
    i = 0
    printMyMatches()
    myLen = len(myMatches)
    while i < myLen:
        myPlayers = myMatches[i]["players"]
        logger.info("players --> %s", players)
        logger.info("myPlayers --> %s", myPlayers)
        if players[0] in myPlayers or players[1] in myPlayers:
            return myMatches[i]
        i += 1
    return None

async def addPlayerToTournament(self, myUser, idTournamentToJoin):
    if idTournamentToJoin in allTournamentsId:
        userInTournament[myUser.id] = idTournamentToJoin
        Tournament.players[idTournamentToJoin].append(myUser.id)
        await Tournament.sendAllTournaments(self)


async def sendInfosTournamentsToUser(self, idTournament, match00, match01):
    myPlayers = list(Tournament.players[idTournament])
    idRoom1 = uuid.uuid4()
    idRoom2 = uuid.uuid4()

    i = 0
    while i < 4:
        await sendFirstMatch(self, myPlayers[i], match00, match01, idRoom1, idRoom2)
        i += 1
    return

def createRandomMatches(idTournament):
    myPlayers = list(Tournament.players[idTournament])
    match00 = []

    count = 0

    while count != 2:
        myRandomNumber = random.randint(0, 3)
        lenPlayers = len(myPlayers)
        if (myRandomNumber < lenPlayers):
            playerToAdd = myPlayers[myRandomNumber]
            del myPlayers[myRandomNumber]
            match00.append(playerToAdd)
            count += 1
    myMatch00 = {
        "idTournament": idTournament,
        "players": match00,
        "type": "00",
        "winner": None,
        "loser": None
    }

    myMatch01 = {
        "idTournament": idTournament,
        "players": myPlayers,
        "type": "00",
        "winner": None,
        "loser": None
    }


    myMatches.append(myMatch00)
    myMatches.append(myMatch01)
    tournamentMatchsEnded[idTournament] = 0
    return match00, myPlayers


def modifyMatchObjet(players, name, value):
    i = 0;
    myLen = len(myMatches)
    while i < myLen:
        myMatch = myMatches[i]
        myPlayers = myMatch["players"]
        if players[0] in myPlayers or players[1] in myPlayers:
            myMatch[name] = value
            myLen = len(myMatches)
            return myMatch
        i += 1
    return None


async def createFinalMatch(idTournament):
    i = 0
    myLen = len(myMatches)

    match00, match01, myLosers, myWiners = [], [], [], []
    count = 0

    while i < myLen:
        myMatch = myMatches[i]
        if idTournament == myMatch["idTournament"] and count == 0:
            match00 = myMatch
            del myMatches[i]
            myLen -= 1
            count += 1
            while i < myLen:
                myMatch = myMatches[i]
                if idTournament == myMatch["idTournament"] and count == 1:
                    match01 = myMatch
                    del myMatches[i]
                    myLen -= 1
                    break
        i += 1
    
    loser0 = match00["loser"]
    loser1 = match01["loser"]
    winner0 = match00["winner"]
    winner1 = match01["winner"]

    winnerUser1 = await getUserByUsername(winner0)
    winnerUser2 = await getUserByUsername(winner1)

    idUser1 = winnerUser1.get("id")
    idUser2 = winnerUser2.get("id")

    myLosers.extend((loser0, loser1))
    myWiners.extend((idUser1, idUser2))



    myMatchFinal = {
        "idTournament": idTournament,
        "players": myWiners,
        "type": "final",
        "winner": None,
        "loser": None
    }

    myMatches.append(myMatchFinal)
    return myWiners, myLosers

    

def printMyMatches():
    i = 0

    myLen = len(myMatches)
    while i < myLen:
        match = myMatches[i]
        players = match["players"]
        logger.info("|----------MATCH %d----------|", i)
        logger.info("| %s VS %s ", players[0], players[1])
        logger.info("| Type : %s", match["type"])
        logger.info("| Winner: %s", match["winner"])
        logger.info("| Loser: %s", match["loser"])
        logger.info("\n\n\n")
        i += 1


def printMatch(match):
    players = match["players"]
    logger.info("|----------MATCH----------|")
    logger.info("| %s VS %s ", players[0], players[1])
    logger.info("| Type : %s", match["type"])
    logger.info("| Winner: %s", match["winner"])
    logger.info("| Loser: %s", match["loser"])
    logger.info("\n\n\n")


def removeMatch(match):
    i = 0
    myLen = len(myMatches)
    while i < myLen:
        if match == myMatches[i]:
            del myMatches[i]
            return
        i += 1
    return


async def sendNextStepToUsers(self, myWinners, myLosers, idTournament):
    players = Tournament.players[idTournament]
    i = 0
    myLen = len(players)

    win1 = myWinners[0]
    win2 = myWinners[1]

    los1 = myLosers[0]
    los2 = myLosers[1]

    logger.info("win1, win2 --> %s, %s", win1, win2)

    myRealWinner1 = await getUserById(win1)
    myRealWinner2 = await getUserById(win2)

    myRealLoser1 = await getUserByUsername(los1)
    myRealLoser2 = await getUserByUsername(los2)

    realsWinners = []
    realsWinners.extend((myRealWinner1, myRealWinner2))

    realsLosers = []
    realsLosers.extend((myRealLoser1, myRealLoser2))
    myRoomId = str(uuid.uuid4())

    while i < myLen:
        myPlayerId = players[i]
        myUser = await getUserById(myPlayerId)
        myUsername = myUser.get("username")
        if myPlayerId in myWinners:
            if myPlayerId == myWinners[0]:
                opponentUsername = myWinners[1]
                opponent = await getUserById(opponentUsername)
            else:
                opponentUsername = myWinners[0]
                opponent = await getUserById(opponentUsername)
            dataToSend = {
                "status": "winner",
                "opponent": opponent,
                "playersEliminated": realsLosers,
                "roomId": myRoomId,
                "idTournament": idTournament

            }
            dataToSendBis = {
            "AFTER-00-WINNER": dataToSend
            }
        else:
            dataToSend = {
                "status": "loser",
                "finalists": realsWinners,
                "playersEliminated": realsLosers
            }
            dataToSendBis = {
            "AFTER-00-LOSER": dataToSend
            }
        
        mySocket = allSockets.get(myUsername)
        await sendToSocket(self, mySocket, dataToSendBis)
        i += 1


# OBJ ---> {"id": id of tournament}
userInTournament = {}

# OBJ ---> [id1, id2, id3, ...] (tournois)
allTournamentsId = []
myMatches = []
allSockets = {}
allUsers = []

tournamentMatchsEnded = {}


def destroyMyTournament(idTournament):
    i = 0
    myLen = len(myMatches)
    while i < myLen:
        myMatch = myMatches[i]
        if myMatch["idTournament"] == idTournament:
            del myMatches[i]
            myLen -= 1
    
    i = 0
    myLen = len(allTournamentsId)
    while i < myLen:
        if allTournamentsId[i] == idTournament:
            del allTournamentsId[i]
            myLen -= 1
    

    del Tournament.players[idTournament]
    del Tournament.leader[idTournament]

class Tournament(AsyncWebsocketConsumer):
    players = {}
    leader = {}
    isLaunched = {}


    def clearThings(self, myUser):
        userId = myUser.id
        if userId in userInTournament:
            idTournament = userInTournament[userId]
            del userInTournament[userId]
            myLen = len(allTournamentsId)
            i = 0
            while i < myLen:
                if idTournament == allTournamentsId[i] and len(Tournament.players[idTournament]) == 0:
                    del allTournamentsId[i]
                    return
                i += 1
        return


    async def sendAllTournaments(self):
        allTournaments = await returnAllTournaments()
        myDataToSend = {
            "allTournaments": allTournaments
        }
        
        await sendToTournamentsSocket(self, myDataToSend)


    async def shareTournaments(self, event):
        myUser = self.scope["user"]
        data = event['message']
        await self.send(text_data=json.dumps({
            'message': data
        }))
        type = data.get("type")
        usernames = data.get("players")
        idTournament = data.get("idTournament")
        
        myLeader = Tournament.leader[idTournament]

        if (myUser.id != myLeader):
            return
        elif type == "RESULTS":
            # FIND MATCH
            logger.info("JE RECOIS LES RESULTATS DE LA FINALE ---> %s", data)
            myPlayersUsernames = data.get("players")

            myPlayers = []

            myPlayer00 = await getUserByUsername(myPlayersUsernames[0])
            myPlayer01 = await getUserByUsername(myPlayersUsernames[1])

            myPlayers.append(myPlayer00["id"])
            myPlayers.append(myPlayer01["id"])

            myMatch = findMatch(myPlayers)

            if myMatch != None:
                idTournament = myMatch["idTournament"]
                whatMatch = myMatch["type"]
                value = tournamentMatchsEnded.get(idTournament)
                value = value + 1
                tournamentMatchsEnded[idTournament] = value

                ## FIRST MATCHS --> 

                if whatMatch == "00":
                    myWinner = data["myWinner"]
                    myLoser = data["myLoser"]

                    modifyMatchObjet(myPlayers, "winner", myWinner)
                    modifyMatchObjet(myPlayers, "loser", myLoser)

                    matchsPlayed = tournamentMatchsEnded.get(idTournament)
                    logger.info("matchsPlayed --> %d", matchsPlayed)
                    if matchsPlayed == 2: ## MATCHS PLAYED
                        tournamentMatchsEnded[idTournament] == 0
                        myWiners, myLosers = await createFinalMatch(idTournament)
                        await sendNextStepToUsers(self, myWiners, myLosers, idTournament)
                if whatMatch == "final":
                    myTournamentWinner = data.get("myWinner")
                    myTournamentSecond = data.get("myLoser")
                    logger.info("LE VAINQUEUR --> %s", myTournamentWinner)
                    logger.info("LE SECOND --> %s", myTournamentSecond)
                    socketTournamentWinner = allSockets.get(myTournamentWinner)
                    socketTournamentSecond = allSockets.get(myTournamentSecond)

                    userWinner = await getUserByUsername(myTournamentWinner)
                    userSecond = await getUserByUsername(myTournamentSecond)

                    dataToSendToWinner = {
                        "SECOND": userSecond
                    }
                    
                    dataToSendWIN = {
                        "WINNER": dataToSendToWinner
                    }


                    dataToSendToSecond = {
                        "WINNER": userWinner
                    }

                    dataToSendSECOND = {
                        "SECOND": dataToSendToSecond
                    }

                    await sendToSocket(self, socketTournamentWinner, dataToSendWIN)
                    await sendToSocket(self, socketTournamentSecond, dataToSendSECOND)
                    destroyMyTournament(idTournament)
                    # await Tournament.sendAllTournaments(self)
                    




    async def socketTournament(self, event):
        myUser = self.scope["user"]
        data = event['message']
        await self.send(text_data=json.dumps({
            'message': data
        }))

    async def shareSocket(self, event):
        data = event['message']
        # type = data.get("type")


    def printMyTournament(self, id):
        logger.info("----------------------------------------")
        logger.info("| ID : %s", id)
        logger.info("| Players ---> %s", Tournament.players[id])
        logger.info("| Players.username ---> %s", Tournament.players[id][0])
        logger.info("| Leader ---> %s", Tournament.leader[id])
        logger.info("----------------------------------------")



    async def connect(self):
        myUser = self.scope["user"]
        if myUser.is_authenticated:
            await self.channel_layer.group_add("shareSocket", self.channel_name)
            await self.channel_layer.group_add("socketTournament", self.channel_name)
            await self.channel_layer.group_add("shareTournaments", self.channel_name)
            await self.accept()
            addSocketToUser(self.channel_name, myUser.username)
            allUsers.append(myUser)


    async def disconnect(self, close_code):
        myUser = self.scope["user"]
        if myUser.is_authenticated:
            await self.close()


    async def receive(self, text_data):
        data = json.loads(text_data)
        myUser = self.scope["user"]
        type = data.get("type")

        # CREATION D'UN TOURNOI

        if type == "CREATE-TOURNAMENT":
            idTournament = data.get("idTournament")
            if idTournament not in Tournament.players:
                Tournament.players[idTournament] = []
            if idTournament not in Tournament.leader:
                Tournament.leader[idTournament] = []

            userInTournament[myUser.id] = idTournament
            allTournamentsId.append(idTournament)

            Tournament.leader[idTournament] = myUser.id
            Tournament.players[idTournament].append(myUser.id)
            await Tournament.sendAllTournaments(self)

        elif type == "SHOW-TOURNAMENTS":
            await Tournament.sendAllTournaments(self)

        elif type == "JOIN-TOURNAMENT":
            idTournamentToJoin = data.get("id")
            nbPlayersInTournament = len(Tournament.players[idTournamentToJoin])
            if nbPlayersInTournament == 3:
                idTournamentToJoin = data.get("id")
                await addPlayerToTournament(self, myUser, idTournamentToJoin)
                dataToSend = {
                    "TOURNAMENT-FULL": "MOMO"
                }
                await sendToPlayersInTournament(self, dataToSend, idTournamentToJoin)
                self.printMyTournament(idTournamentToJoin)
                match00, match01 = createRandomMatches(idTournamentToJoin)
                
                await sendInfosTournamentsToUser(self, idTournamentToJoin, match00, match01)
                return 

            if (nbPlayersInTournament == 4):
                return
            await addPlayerToTournament(self, myUser, idTournamentToJoin)
            

        elif type == "LEAVE-TOURNAMENT":
            idTournament = userInTournament.get(myUser.id)

            if Tournament.isLaunched[idTournament] == False:
                idTournament = data.get("id")
                if idTournament in allTournamentsId:
                    erasePlayerFromTournamentObject(idTournament, myUser.id)

                Tournament.clearThings(self, myUser) 
                await Tournament.sendAllTournaments(self)
                dataToSend = {
                    "CANCEL-MATCH": "MOMO"
                }
                await sendToPlayersInTournament(self, dataToSend, idTournament)
            else:
                logger.info("PAS DE SOUCIS FRERO")
        elif type == "NAVIGATE-TO-MATCH":
            idTournament = userInTournament.get(myUser.id)
            Tournament.isLaunched[idTournament] = True
            return 
        elif type == "COMEBACK-TOURNAMENT":
            idTournament = data.get("idTournament")
        elif type == "WANT-TO-SEE-RESULTS":
            logger.info("oui")
            

def erasePlayerFromTournamentObject(idTournament, idPlayer):
    i = 0
    myLen = len(Tournament.players[idTournament])
    while i < myLen:
        if idPlayer == Tournament.players[idTournament][i]:
            del Tournament.players[idTournament][i]
            return
        i += 1
    return 