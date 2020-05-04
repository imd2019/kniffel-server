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
		Erfolg: gameCreated()
		Misserfolg: gameNotCreated()
	_complete_: gibt an ob das Spiel alle Felder oder nur die Oberen hat. Ändert die Bonus Berechnung in CalcTotal

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
	"ones"
	"twos"
	"threes"
	"fours"
	"fives"
	"sixed"
	"threeOfAKind"
	"fourOfAKind"
	"fullHouse"
	"smallStraight"
	"largeStraight"
	"kniffel"
	"chance"