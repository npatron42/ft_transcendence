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


# usersConnected = {}

async def getUserById(myId):
    userTmp = await sync_to_async(User.objects.get)(id=myId)
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
            userId = str(myUser.id)
            mySocket = allSockets.get(userId)
            await sendToSocket(self, mySocket, message)
            i += 1
        return

async def sendToPlayersInTournament(self, message, idTournament):
        myTournament = await giveTournament(idTournament)
        myPlayers = myTournament["players"]
        i = 0
        myLen = len(myPlayers)
        while i < myLen:
            myId = myPlayers[i].get("id")
            userId = str(myId)
            mySocket = allSockets.get(userId)
            await sendToSocket(self, mySocket, message)
            i += 1
        return

async def giveTournament(id):
    players = []
    myLen = len(Tournament.players[id])
    i = 0
    while i < myLen:
        myPlayer = await getUserById(Tournament.players[id][i])
        players.append(myPlayer)
        i += 1
    tournament = {
        "id": id,
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


def clearPotentialGames(idTournament):
    i = 0
    myLen = len(myMatches)
    while i < myLen:
        myMatch = myMatches[i]
        if myMatch["idTournament"] == idTournament:
            myLen -= 1
            del myMatches[i]
        i += 1
    return


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
        userId = str(myRealPlayer.get("id"))
        mySocket = allSockets.get(userId)

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
        userId = str(myRealPlayer.get("id"))
        mySocket = allSockets.get(userId)

        await sendToSocket(self, mySocket, dataToSendBis)

    return 
    
def addSocketToUser(socket, id):
    allSockets[id] = socket

def deleteSocketToUser(id):
    del allSockets[id]

def findMatch(players):
    i = 0
    myLen = len(myMatches)
    while i < myLen:
        myPlayers = myMatches[i]["players"]
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


def deleteMatches(idTournament):
    i = 0
    myLen = len(myMatches)
    while i < myLen:
        myMatch = myMatches[i]
        if myMatch["idTournament"] == idTournament:
            myLen -= 1
            del myMatches[i]
        i += 1

async def createFinalMatch(self, idTournament):
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

    if winner1 == "surrend" or winner0 == "surrend":
        data = {
            "CANCEL-TOURNAMENT": "YES"
        }
        await sendToPlayersInTournament(self, data, idTournament)
        destroyMyTournament(idTournament)
        return None, None

    winnerUser1 = await getUserById(winner0)
    winnerUser2 = await getUserById(winner1)

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
        logger.info("| Id : %s", match["idTournament"])
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

def removeSocketIntoObjects(myUser):
    i = 0
    myLen = len(allUsers)
    while i < myLen:
        if allUsers[i] == myUser:
            myLen -= 1
            del allUsers[i]
        i += 1
    userId = str(myUser.id)
    if userId in allSockets:
        del allSockets[userId]
    if myUser.id in userInTournament:
        del userInTournament[myUser.id]

def checkUserLeader(myUser, idTournament):
    userId = myUser.id
    if idTournament in Tournament.leader:
        if userId == Tournament.leader[idTournament]:
            Tournament.leader[idTournament] = None
    if idTournament in Tournament.players:
        i = 0
        myLen = len(Tournament.players[idTournament])
        while i < myLen:
            player = Tournament.players[idTournament][i]
            if player == userId:
                del Tournament.players[idTournament][i]
                myLen -= 1
            i += 1
        return
    return

async def sendNextStepToUsers(self, myWinners, myLosers, idTournament):
    players = Tournament.players[idTournament]
    i = 0
    myLen = len(players)

    win1 = myWinners[0]
    win2 = myWinners[1]

    los1 = myLosers[0]
    los2 = myLosers[1]


    myRealWinner1 = await getUserById(win1)
    myRealWinner2 = await getUserById(win2)

    myRealLoser1 = await getUserById(los1)
    myRealLoser2 = await getUserById(los2)

    realsWinners = []
    realsWinners.extend((myRealWinner1, myRealWinner2))

    realsLosers = []
    realsLosers.extend((myRealLoser1, myRealLoser2))
    myRoomId = str(uuid.uuid4())

    while i < myLen:
        myPlayerId = players[i]
        myUser = await getUserById(myPlayerId)
        userId = str(myUser.get("id"))
        if myPlayerId in myWinners:
            if myPlayerId == myWinners[0]:
                opponentId = myWinners[1]
                opponent = await getUserById(opponentId)
            else:
                opponentId = myWinners[0]
                opponent = await getUserById(opponentId)
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
        mySocket = allSockets.get(userId)
        await sendToSocket(self, mySocket, dataToSendBis)
        i += 1

def defineUserSurrend(myUser):
    myId = myUser.id
    i = 0
    myLen = len(myMatches)
    while i < myLen:
        myMatch = myMatches[i]
        logger.info("myMatch --> %s", myMatch)
        if myMatch["winner"] == myId:
            myMatch["winner"] = "surrend"
            return
        i += 1
    printMyMatches()
    return 

def isUserWasLeaderInTournamentNotFinished(myUser):
    userId = myUser.id
    i = 0
    myLen = len(allTournamentsId)
    while i < myLen:
        id = allTournamentsId[i]
        if userId == Tournament.leader[id]:
            return True, id
        i += 1
    return False, None


async def isMyLeaderOnline(idTournament):
    asyncio.sleep(3)
    if idTournament in Tournament.leader:
        return Tournament.leader[idTournament]
    return None


def userWasInQueueFinal(userId):
    myLen = len(myMatches)
    i = 0
    while i < myLen:
        myMatch = myMatches[i]
        idTournament = myMatch["idTournament"]
        players = myMatch["players"]
        logger.info("players --> %s, userId --> %s", players, userId)
        if userId in players:
            if myMatch["type"] == "final":
                if userId == players[0]:
                    playerToPrevent = players[1]
                else:
                    playerToPrevent = players[0]
                logger.info("JE DESTROY MALHEURESEMENT")
                destroyMyTournament(idTournament)
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
        i += 1
    
    i = 0
    myLen = len(allTournamentsId)
    while i < myLen:
        if allTournamentsId[i] == idTournament:
            del allTournamentsId[i]
            myLen -= 1
        i += 1
    
    if idTournament in Tournament.players:
        del Tournament.players[idTournament]
    if idTournament in Tournament.leader:
        del Tournament.leader[idTournament]


def userIsAlreadyInTheTournament(myUser, idTournament):
    if idTournament in allTournamentsId:
        players = Tournament.players[idTournament]
        if myUser.id in players:
            return True
        return False


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
    
    async def sendAllTournamentsToUser(self, myUser):
        allTournaments = await returnAllTournaments()
        myDataToSend = {
            "allTournaments": allTournaments
        }
        userId = str(myUser.id)
        userSocket = allSockets.get(userId)
        await sendToSocket(self, userSocket, myDataToSend)


    async def shareTournaments(self, event):
        myUser = self.scope["user"]
        data = event['message']
        await self.send(text_data=json.dumps({
            'message': data
        }))
        type = data.get("type")
        idTournament = data.get("idTournament")
        
        myLeader = await isMyLeaderOnline(idTournament)

        if myLeader == None:
            Tournament.printMyTournament(self, idTournament)
            data = {
                "CANCEL-TOURNAMENT": "YES"
            }
            destroyMyTournament(idTournament)
            return

        if (myUser.id != myLeader):
            return
        if type == "DESTROY-TOURNAMENT":
            idTournament = data.get("idTournament")
            destroyMyTournament(idTournament)
            return
        elif type == "RESULTS":
            logger.info("RESULTS RECEIVED ---> %s", data)
            # FIND MATCH
            myPlayersUsernames = data.get("players")

            myPlayers = []

            myPlayer00 = await getUserById(myPlayersUsernames[0])
            myPlayer01 = await getUserById(myPlayersUsernames[1])

            myPlayers.append(myPlayer00["id"])
            myPlayers.append(myPlayer01["id"])

            myMatch = findMatch(myPlayers)

            if myMatch != None:
                idTournament = myMatch["idTournament"]
                Tournament.isLaunched[idTournament] = True
                whatMatch = myMatch["type"]
                value = tournamentMatchsEnded.get(idTournament)
                value = value + 1
                tournamentMatchsEnded[idTournament] = value

                matchsPlayed = tournamentMatchsEnded.get(idTournament)
                ## FIRST MATCHS --> 


                if whatMatch == "00":
                    myWinner = data["myWinner"]
                    myLoser = data["myLoser"]

                    modifyMatchObjet(myPlayers, "winner", myWinner)
                    modifyMatchObjet(myPlayers, "loser", myLoser)

                    matchsPlayed = tournamentMatchsEnded.get(idTournament)
                    if matchsPlayed == 2: ## MATCHS PLAYED
                        tournamentMatchsEnded[idTournament] == 0
                        myWiners, myLosers = await createFinalMatch(self, idTournament)
                        if myWiners == None and myLosers == None:
                            return
                        await sendNextStepToUsers(self, myWiners, myLosers, idTournament)


                if whatMatch == "final":
                    myTournamentWinner = data.get("myWinner")
                    myTournamentSecond = data.get("myLoser")

                    userWinner = await getUserById(myTournamentWinner)
                    userSecond = await getUserById(myTournamentSecond)

                    winnerId = str(userWinner.get("id"))
                    secondId = str(userSecond.get("id"))

                    socketTournamentWinner = allSockets.get(winnerId)
                    socketTournamentSecond = allSockets.get(secondId)


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

                    logger.info("RESULTATS FIBAUX")
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
        if id in Tournament.players and id in Tournament.leader:
            logger.info("----------------------------------------")
            logger.info("| ID : %s", id)
            logger.info("| Players ---> %s", Tournament.players[id])
            logger.info("| Leader ---> %s", Tournament.leader[id])
            logger.info("----------------------------------------")



    async def connect(self):
        myUser = self.scope["user"]

        if myUser.is_authenticated:
            userId = str(myUser.id)
            await self.channel_layer.group_add("shareSocket", self.channel_name)
            await self.channel_layer.group_add("socketTournament", self.channel_name)
            await self.channel_layer.group_add("shareTournaments", self.channel_name)
            await self.accept()
            addSocketToUser(self.channel_name, str(myUser.id))
            allUsers.append(myUser)


    async def disconnect(self, close_code):
        myUser = self.scope["user"]
        if myUser.is_authenticated:
            logger.info("JE PASSE ICI")
            removeSocketIntoObjects(myUser)
            wasLeader, id = isUserWasLeaderInTournamentNotFinished(myUser)
            if wasLeader == True:
                checkUserLeader(myUser, id)
            userId = str(myUser.id)
            await self.close()


    async def receive(self, text_data):
        data = json.loads(text_data)
        myUser = self.scope["user"]
        type = data.get("type")

        # CREATION D'UN TOURNOI
        logger.info("[ TOURNAMENT CONSUMER ] --> %s", data)
        if type == "CREATE-TOURNAMENT":
            logger.info("Disconnect from --> %s", myUser.username)
            idTournament = data.get("idTournament")
            if idTournament not in Tournament.players:
                Tournament.players[idTournament] = []
            if idTournament not in Tournament.leader:
                Tournament.leader[idTournament] = []
            if idTournament not in Tournament.isLaunched:
                Tournament.isLaunched[idTournament] = False

            userInTournament[myUser.id] = idTournament
            allTournamentsId.append(idTournament)

            Tournament.leader[idTournament] = myUser.id
            Tournament.players[idTournament].append(myUser.id)
            logger.info("userInTournament --> %s", userInTournament)
            await Tournament.sendAllTournamentsToUser(self, myUser)

        elif type == "SHOW-TOURNAMENTS":
            idTournamentToJoin = data.get("id")
            await Tournament.sendAllTournamentsToUser(self, myUser)

        elif type == "JOIN-TOURNAMENT":
            idTournamentToJoin = data.get("id")
            nbPlayersInTournament = len(Tournament.players[idTournamentToJoin])
            condition = userIsAlreadyInTheTournament(myUser, idTournamentToJoin)
            if condition == True:
                return
            if nbPlayersInTournament == 3:
                idTournamentToJoin = data.get("id")
                await addPlayerToTournament(self, myUser, idTournamentToJoin)
                dataToSend = {
                    "TOURNAMENT-FULL": "MOMO"
                }
                await sendToPlayersInTournament(self, dataToSend, idTournamentToJoin)
                match00, match01 = createRandomMatches(idTournamentToJoin)
                await sendInfosTournamentsToUser(self, idTournamentToJoin, match00, match01)
                return 

            if (nbPlayersInTournament == 4):
                return
            await addPlayerToTournament(self, myUser, idTournamentToJoin)
            

        elif type == "LEAVE-TOURNAMENT":
            logger.info("[ TOURNAMENT CONSUMER ] --> %s", data)        
            idTournament = userInTournament.get(myUser.id)
            if idTournament is None:
                return
            if Tournament.isLaunched[idTournament] == False:
                idTournament = data.get("id")
                if idTournament in allTournamentsId:
                    erasePlayerFromTournamentObject(idTournament, myUser.id)

                Tournament.clearThings(self, myUser) 
                await Tournament.sendAllTournaments(self)
                dataToSend = {
                    "CANCEL-MATCH": "MOMO"
                }
                clearPotentialGames(idTournament)
                await sendToPlayersInTournament(self, dataToSend, idTournament)
                logger.info("")
            else:
                # userWasInQueueFinal(myUser.id)
                defineUserSurrend(myUser)

        elif type == "NAVIGATE-TO-MATCH":
            idTournament = userInTournament.get(myUser.id)
            Tournament.isLaunched[idTournament] = True
            return 
        elif type == "COMEBACK-TOURNAMENT":
            idTournament = data.get("idTournament")
        elif type == "WANT-TO-SEE-RESULTS":
            logger.info("RESULTS")
            

def erasePlayerFromTournamentObject(idTournament, idPlayer):
    i = 0
    myLen = len(Tournament.players[idTournament])
    while i < myLen:
        if idPlayer == Tournament.players[idTournament][i]:
            del Tournament.players[idTournament][i]
            if idPlayer == Tournament.leader[idTournament] and myLen != 1:
                Tournament.leader[idTournament] = Tournament.players[idTournament][0]
            return
        i += 1
    return 

def erasePlayerFromTournamentObject2(idTournament, idPlayer):
    i = 0
    myLen = len(Tournament.players[idTournament])
    while i < myLen:
        if idPlayer == Tournament.players[idTournament][i]:
            del Tournament.players[idTournament][i]
            if idPlayer == Tournament.leader[idTournament] and myLen != 1:
                Tournament.leader[idTournament] = None
            return
        i += 1
    return 