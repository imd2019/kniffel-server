# Kniffel-Server für IMD SS 2020

## General

- game types?
  - complete (all rules)
  - simple (only first block)

## Server

### Client-side tasks

#### join server

- parameters: name, password
- What if connection fails?

#### create game

- parameters: name, amount of players

#### join game

### Server-side tasks

#### lobby

- games overview

#### games

- create room in socket.io
  - Name vergeben?
- determine random start player
- calculate results
- identify winner (notwendig?)

#### general

- save highscore?

## Library

- Klasse für Serverkommunikation

- Handler
  - für Datenversand (z.B. `server.rollDice()`)
  - für Datenempfang (z.B. `server.diceRolled()`)

## Structure

### Classes

Server:
games: Array
password: const
SOCKET_LIST: Objekt: socketId, socket

Player:

- name : String
- id (socketId?)
- score: assoziativ array ?

  - setScore(scoreId, score)
  - getScore(scoreId): return score
  - calcBonus(): return bonus
  - calcTotal(): return totalScore

Game:

- players : Array
- dice: Array
- playerNow: Index in players

  - saveScore(scoreID): return true/false
  - getAllPlayerScore(): return Array 2D
  - addPlayer(player)
  - rollDice() Da müssen wir schauen wie wir das mit gesperrten Würfeln machen!
  - nextPlayer()
  - reset ()
  - (winner())
    Prüfmethoden...

    Dice:

- value

  - roll()

## ToDo

    reset Game

## Dokumentation

### ClientSeite:

new Connection(_username_, _password_)

    _username_: Name im Spiel
    _password:_ Allgemeines Server Passwort, um überhaupt verbunden zu werden

connection.roll(_lockedDice_)

    _lockedDice_: Array mit den Indizes von 0-4 mit den gelockten Würfel

    	Erfolg: diceRolled Event wird ausgerufen mit den values und an alle RaumTeilnehmer versandt
    	Misserfolg: Error Anzahl der Maximalen Würfe wurde erreicht throwNotAllowed wird aufgerufen

connection.createGame(_name_, _size_,_complete_)

    _name_: Name des Spiels
    _size_: maximale Spielerzahl
    _complete_: gibt an ob das Spiel alle Felder oder nur die Oberen hat. Ändert die Bonus Berechnung in CalcTotal

    	Erfolg: gameCreated()
    	Misserfolg: gameNotCreated()

connection.joinGame(_name_)

    _name_: Name des Spiels
    	Erfolg: gameJoined()
    	Misserfolg: gameNotJoined()

connection.leaveGame()
verlässt das aktuelle Spiel

connection.startGame()
entscheidet auf der Server Seite der Startspieler legt diesen auch zum ersten mal Fest PlayerNow = 0; vorher -1

connection.getGamesList()
return List aller Spiel Namen

connection.saveScore(_scoreField_)
_scoreField_: Der Name des Scorefeldes in dem der Score gespeichert werden soll
Erfolg: sendet an alle Spieler ein updatePlayer Event und der score wird eingetragen
Misserfolg: Fehler: Man ist selbst nicht dran oder das scoreField ist falsch

### Events

connection.updatePlayers(_players_, _playerNow_)

    _players_: Array mit den Spielern {name: name, score: Object mit den Scores}
    _playerNow_: Index des aktuellen Zug Spielers

connection.diceRolled(_values_)

    _values_: Array mit den gewürfelten Werten in der Rheinfolge, wie sie gewürfelt wurden

### Listen

scoreField:

- "ones"
- "twos"
- "threes"
- "fours"
- "fives"
- "sixed"
- "threeOfAKind"
- "fourOfAKind"
- "fullHouse"
- "smallStraight"
- "largeStraight"
- "kniffel"
- "chance"

errorCodes:

- 100 CreateGame

  - 101: You cannot create a game. You are already in a game.
  - 102: A Game with this name exists already.
  - 103: A game needs at least one player.

- 200 JoinGame

  - 201: "You cannot join a game. You are already in a game.
  - 202: "A game with this name does not exist.
  - 203: "This game is full.
  - 204: "This game already started.

- 300 roll

  - 301: "You cannot roll. You are not in the game.
  - 302: "You cannot roll. The game did not start yet.
  - 303: "You cannot roll. It is not your turn.
  - 304: "You already rolled 3 times.

- 400 startGame

  - 401: Game could not be started. You are not in any game.
  - 402: This game has already been started.

- 500 saveResults

  - 501: You cannot save the score. You are not in this game.
  - 502: You cannot save the score. The game did not start yet.
  - 503: You cannot save the score. It is not your turn.
  - 504: The score could not be saved. The field is not empty.
  - 505: The score could not be saved. The field does not exist.

- 600 restartGame

  - 601: You could not restart the game. You are not in any game.

- 700 leaveGame

  - 701: You could not leave the game. You are not in any game.
