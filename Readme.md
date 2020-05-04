# Kniffel-Server

Studiengang Interactive Media Design, Sommersemester 2020.

Leander Schmidt, Florian Beck, Garrit Schaap.

## Spielablauf

Um dem Server beizutreten, muss ein persönlicher Nutzername angelegt werden. Nutzernamen können mehrfach vorkommen, allerdings empfiehlt es sich der Unterscheidbarkeit halber, einen möglichst eindeutigen und einmaligen Nutzernamen zu wählen.

Nachdem man dem Server beigetreten ist, befindet man sich zunächst in der Lobby, wo einem alle vorhandenen Spiele angezeigt werden, sowie deren Größe und wieviele Spieler bereits beigetreten sind.

Hier kann man nun einem vorhandenen Spiel beitreten oder ein neues Spiel erstellen. Dabei werden der Name des Spiels sowie die maximale Spielerzahl (Größe) festgelegt und ob das Spiel den vollständigen Kniffel-Block spielen soll oder nur die obere Hälfte.

Sind alle Spieler beigetreten, kann das Spiel gestartet werden. Dabei wird ein zufälliger Startspieler festgelegt. Dann wird reihum je bis zu dreimal gewürfelt, wobei jedes Mal Würfel gesperrt werden können, ein Feld gewählt und das Ergebnis darin gespeichert, sofern es noch frei ist.

Verlässt ein Spieler während des Spiels den Raum, wird dies den restlichen Spielern angezeigt, der Spieler wird entfernt und es ist automatisch der nächste Spieler an der Reihe.

Ist das Spiel beendet kann es, sofern gewünscht, neu gestartet werden.

Verlassen alle Spieler ein Spiel, wird es gelöscht.

## Einbindung der Client-Bibliothek

### Ablegen der Dateien im Ordnerpfad

Die Client-Bibliothek besteht aus der Klasse `Client` und einer eingebundenen Verschlüsselungsmethode. Sie liegt in folgender Ordnerstruktur vor:

- Client Library
  - client.js
  - libraries
    - md5.js

Diese Ordnerstruktur muss im Ordnerpfad der Javascript-Anwendung abgelegt werden.

### Einbinden der Klasse Client

Die Klasse `Client` wird wie folgt in den Javascript-Code eingebunden:

```javascript
import Client from "./path/client.js";

let client = new Client();
```

`path` wird dabei durch den Ordnerpfad entsprechend der tatsächlichen Ordnerstruktur ersetzt.

Außerdem muss die Einbindung in den `head`-Bereich der HTML-Datei erfolgen:

```html
<head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js"></script>
  <script src="./libraries/md5.js"></script>
  <script type="module" src="./test.js"></script>
</head>
```

### Verbindung zum Server herstellen

Die Verbindung zum Server wird durch Aufruf der Methode `client.connect()` hergestellt. Ein Aufruf kann wie folgt aussehen:

```javascript
client.connect("user", "ILoveIMD2020", "https://www.beispielserver.de/");
```

## Verwenden der Methoden und Eventhandler

### Spiel anlegen oder vorhandenem Spiel beitreten

Ist man mit dem Server verbunden, kann man einem Spiel beitreten oder selbst ein Spiel anlegen.
Hierzu kann man eine Liste der vorhandenen Spiele abrufen:

```javascript
client.getGamesList();
```

Um einem Spiel beizutreten, ruft man

```javascript
client.joinGame(name);
```

auf, wobei man den Namen des Spiels als Parameter übergibt.

Ein neues Spiel erstellt man wie folgt:

```javascript
client.createGame("IMD-Club", 5, true);
```

wobei man den Namen des Spiels und die maximale Spielerzahl übergibt.
Der dritte Parameter legt fest, ob ein einfaches (`false`) oder vollständiges (`true`) Kniffel-Spiel erstellt werden soll.

### Spielablauf

#### Spielstart

Ein Spiel kann gestartet werden, sobald ihm Spieler beigetreten sind. Hierzu wird die Methode `startGame()` aufgerufen:

```javascript
client.startGame();
```

Es wird dabei stets das Spiel gestartet, dem der Spieler beigetreten ist, der die Methode aufruft.

#### Spielzüge

Ein Spielzug besteht aus bis zu dreimal Würfeln, ggf. Sperren von Würfeln, Wählen eines Feldes und Speichern. Nachfolgend ist ein beispielhafter Spielzug dargestellt.

```javascript
client.roll();
client.roll([1, 4]);
client.roll([0, 1, 4]);
client.saveResult(client.fields.THREES);
```

Dabei werden die gesperrten Würfel `roll()` in Form ihrer Indizes in einem Array übergeben. Das Feld wird beim Speichern in Form eines Werts aus dem Enumerable `client.fields` übergeben. Für eine Übersicht aller möglichen Werte, siehe unten in der [Methodenübersicht](#methodenübersicht).

#### Spielende oder Verlassen eines Spiels

Nach Spielende kann ein Spiel neu gestartet werden. Dabei verbleiben alle Spieler im Spiel, die Würfel und alle gespeicherten Felder werden zurückgesetzt:

```javascript
client.restartGame();
```

Ein Spiel kann zu jedem Zeitpunkt durch Aufrufen der `leaveGame()`-Methode verlassen werden:

```javascript
client.leaveGame();
```

Dabei wird das zugehörige Spielerobjekt gelöscht und der nächste Spieler kommt automatisch an die Reihe. Selbiges gilt, wenn die Verbindung zum Server durch einen Reload oder fehlende Internetverbindung unterbrochen wird.

Verlassen alle Spieler ein Spiel, wird dieses gelöscht.

## Methodenübersicht

Nachfolgend sind noch einmal alle Methoden von `Client` aufgeführt:

- `connect(username, password, url (optional))`
  Stellt die Verbindung zum Server her. Das Passwort für den Serverbeitritt wird vom Serverbetreiber zur Verfügung gestellt. `username` entspricht dem Anzeigenamen auf dem Server.
  Wird keine URL übergeben, wird die Default-Option `"localhost:3000/"` aufgerufen.

- `getGamesList()`
  Sendet eine Anfrage an den Server, eine Liste der vorhandenen Spiele zu senden.

- `createGame(name, size, complete)`
  Sendet eine Anfrage an den Server, ein neues Spiel zu erstellen.
  Der Parameter `complete` kann auf `true` (vollständiges Spiel, oberer und unterer Block werden gespielt) oder `false` (einfaches Spiel, nur der erste Block wird gespielt) gesetzt werden.

- `joinGame(name)`
  Sendet eine Anfrage an den Server, dem gewählten Spiel beizutreten. Dieses wird als Parameter übergeben (Spielname als String).

- `leaveGame()`
  Sendet eine Anfrage an den Server, das Spiel zu verlassen. Kann nur aufgerufen werden, wenn man zuvor einem Spiel beigetreten ist.

- `startGame()`
  Sendet eine Anfrage an den Server, das Spiel zu starten. Kann nur aufgerufen werden, wenn man zuvor einem Spiel beigetreten ist und das Spiel noch nicht begonnen hat.

- `roll([])`
  Sendet eine Anfrage an den Server, zu würfeln. Kann nur aufgerufen werden, wenn man zuvor einem Spiel beigetreten ist und das Spiel gestartet wurde.
  Sollen Würfel gesperrt werden, müssen sie als Array mit den Indizes der gewählten Würfel übergeben werden.
  Sollen also bspw. der erste und der vierte Würfel nicht erneut gewürfelt werden, muss `roll()` als Parameter `[0, 3]` übergeben werden.

- `saveResult(selectedField)`
  Sendet eine Anfrage an den Server, das Würfelergebnis im gewählten Feld zu speichern.
  Das gewählte Feld wird als Parameter übergeben. Hierzu wird es aus dem `client.fields`-Enumerable ausgewählt.
  Soll also bspw. das Würfelergebnis als Viererpasch gespeichert werden, wird als Parameter `client.fields.FOUROFAKIND` übergeben.

  Das `client.fields`-Enumerable enthält folgende Parameter:

  - `ONES` (Einser)
  - `TWOS` (Zweier)
  - `THREES` (Dreier)
  - `FOURS` (Vierer)
  - `FIVES` (Fünfer)
  - `SIXES` (Sexer)
  - `THREEOFAKIND` (Dreierpasch)
  - `FOUROFAKIND` (Viererpasch)
  - `FULLHOUSE` (Full House)
  - `SMALLSTRAIGHT` (kleine Straße)
  - `LARGESTRAIGHT` (große Straße)
  - `KNIFFEL` (Kniffel)
  - `CHANCE` (Chance)

  Ist beim Erstellen des Spiels der Modus auf `complete = false` gesetzt worden, dürfen nur Felder aus dem oberen Block gewählt werden!

- `restartGame()`
  Sendet eine Anfrage an den Server, das gegenwärtige Spiel neu zu starten. Kann nur aufgerufen werden, wenn man zuvor einem Spiel beigetreten ist und das Spiel gestartet wurde.

## Eventhandler-Übersicht

Nachfolgend sind noch einmal alle Eventhandler von `Client` aufgeführt:

// Eventhandler einfügen!

connection.updatePlayers(_players_, _playerNow_)

    _players_: Array mit den Spielern {name: name, score: Object mit den Scores}
    _playerNow_: Index des aktuellen Zug Spielers

connection.diceRolled(_values_)

    _values_: Array mit den gewürfelten Werten in der Rheinfolge, wie sie gewürfelt wurden

## Exception Handling

Nachfolgend ist eine Liste aller möglichen Fehlermeldungen auf Client-Seite dargestellt:

// Fehler beim Verbinden zum Server?

- 100 Fehler beim Erstellen eines Spiels (createGame)

  - 101: You cannot create a game. You are already in a game.
  - 102: A Game with this name exists already.
  - 103: A game needs at least one player.

- 200 Fehler beim Beitreten (joinGame)

  - 201: You cannot join a game. You are already in a game.
  - 202: A game with this name does not exist.
  - 203: This game is full.
  - 204: This game already started.

- 300 Fehler beim Würfeln (roll)

  - 301: You cannot roll. You are not in the game.
  - 302: You cannot roll. The game did not start yet.
  - 303: You cannot roll. It is not your turn.
  - 304: You already rolled 3 times.

- 400 Fehler beim Starten eines Spiels (startGame)

  - 401: Game could not be started. You are not in any game.
  - 402: This game has already been started.

- 500 Fehler beim Speichern (saveResults)

  - 501: You cannot save the score. You are not in this game.
  - 502: You cannot save the score. The game did not start yet.
  - 503: You cannot save the score. It is not your turn.
  - 504: The score could not be saved. The field is not empty.
  - 505: The score could not be saved. The field does not exist.

- 600 Fehler beim Spielneustart (restartGame)

  - 601: You could not restart the game. You are not in any game.

- 700 Fehler beim Verlassen (leaveGame)

  - 701: You could not leave the game. You are not in any game.
