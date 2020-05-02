# Kniffel-Server für IMD SS 2020

## General

- game types?
  - complete (all rules)
  - simple (only first block)

## Server

### Client-side tasks

#### join server

- parameters: name, password

#### create game

- parameters: amount of players

#### join game

### Server-side tasks

#### lobby

- games overview
-

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
  - score:  assoziativ array ? 
  
    - setScore(scoreId, score)
    - getScore(scoreId) return score
    - calcBonus()
    - calcTotal()

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
  
  
## Dokumentation
