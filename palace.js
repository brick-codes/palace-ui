const lobbyOwnerIconHtml = '<img class=\"table-icons\" src=\"./img/icons/crown.svg\" title=\"Lobby Owner\"> ';
somethingLoaded = false;
lobbiesDataTable = null;
playerDataTable = null;
playerToken = '';
lobbyToken = '';
playerName = '';
curPhase = '';
turnNumber = null;
gameStates = [];
latestGameState = null;
hand = null;
selectedCards = [];
recentCards = [];
setNum = 3;
backNum = 1;
turnLength = null;
timerIsActive = false;
turnEndTime = null;

socket = new WebSocket("wss://dev.brick.codes/palace");

function init() {
    if (somethingLoaded) {
        createLobbiesTable();
        loadEventListeners();
        retrieveLobbies();
    }  else {
        somethingLoaded = true;
    }
}

socket.onopen = init;
window.onload = init;

socket.addEventListener('message', function (event) {
    var reader = new FileReader();
    reader.addEventListener("loadend", function() {
        object = JSON.parse(reader.result);
        console.log('Message received from server: ');
        console.log(object);
        if ('NewLobbyResponse' in object) {
            if ('Ok' in object['NewLobbyResponse']) {
                playerToken = object['NewLobbyResponse']['Ok']['player_id'];
                lobbyToken  = object['NewLobbyResponse']['Ok']['lobby_id'];
                enterLobbyScreen([], object['NewLobbyResponse']['Ok']['max_players'], true);
            } else if ('Err' in object['NewLobbyResponse']) {
                var errorResponseString = 'Error creating lobby: ';
                if (object['NewLobbyResponse']['Err'] == 'LessThanTwoMaxPlayers') {
                    window.alert(errorResponseString + 'Max players must be at least 2.');
                } else if (object['NewLobbyResponse']['Err'] == 'EmptyLobbyName') {
                    window.alert(errorResponseString + 'Lobby name cannot be empty.');
                } else if (object['NewLobbyResponse']['Err'] == 'EmptyPlayerName') {
                    window.alert(errorResponseString + 'Player name cannot be empty.');
                } else {
                    window.alert(errorResponseString + 'Unknown error.');
                }
            }
        } else if ('JoinLobbyResponse' in object) {
            if ('Ok' in object['JoinLobbyResponse']) {
                playerToken = object['JoinLobbyResponse']['Ok']['player_id'];
                enterLobbyScreen(object['JoinLobbyResponse']['Ok']['lobby_players'], object['JoinLobbyResponse']['Ok']['max_players'], false);
            } else if ('Err' in object['JoinLobbyResponse']) {
                var errorResponseString = 'Error joining lobby: ';
                if (object['JoinLobbyResponse']['Err'] == 'LobbyNotFound') {
                    window.alert(errorResponseString + 'Lobby not found.');
                } else if (object['JoinLobbyResponse']['Err'] == 'LobbyFull') {
                    window.alert(errorResponseString + 'Lobby is full.');
                } else if (object['JoinLobbyResponse']['Err'] == 'BadPassword') {
                    window.alert(errorResponseString + 'Invalid password.');
                } else if (object['JoinLobbyResponse']['Err'] == 'GameInProgress') {
                    window.alert(errorResponseString + 'Game is in progress.');
                } else if (object['JoinLobbyResponse']['Err'] == 'EmptyPlayerName') {
                    window.alert(errorResponseString + 'Player name cannot be empty.');
                } else {
                    window.alert(errorResponseString + 'Unknown error.');
                }
            }
        } else if ('ListLobbiesResponse' in object) {
            updateLobbiesTable(object['ListLobbiesResponse']);
        } else if ('PlayerJoinEvent' in object) {
            updatePlayerTable(object['PlayerJoinEvent']['new_player_name']);
        } else if ('RequestAiResponse' in object) {
            if ('Ok' in object['RequestAiResponse']) {
                // success, do nothing
            } else if ('Err' in object['RequestAiResponse']) {
                var errorResponseString = 'Error requesting AI: ';
                if (object['RequestAiResponse']['Err'] == 'NotLobbyOwner') {
                    window.alert(errorResponseString + 'Only the lobby owner can request an AI (you\'re not the lobby owner).');
                } else if (object['RequestAiResponse']['Err'] == 'LessThanOneAiRequested') {
                    window.alert(errorResponseString + 'You must request at least one AI.');
                } else if (object['RequestAiResponse']['Err'] == 'LobbyNotFound') {
                    window.alert(errorResponseString + 'Lobby could not be found (it may be expired).');
                } else if (object['RequestAiResponse']['Err'] == 'LobbyTooSmall') {
                    window.alert(errorResponseString + 'Not enough space in lobby.');
                } else {
                    window.alert(errorResponseString + 'Unknown error.');
                }
            }
        } else if ('StartGameResponse' in object) {
            if ('Ok' in object['StartGameResponse']) {
                // do nothing here; GameStartEvent triggers switch to game screen
            } else if ('Err' in object['StartGameResponse']) {
                var errorResponseString = 'Error starting game: ';
                if (object['StartGameResponse']['Err'] == 'LobbyNotFound') {
                    window.alert(errorResponseString + 'Lobby not found (might be expired).');
                } else if (object['StartGameResponse']['Err'] == 'NotLobbyOwner') {
                    window.alert(errorResponseString + 'Only the lobby owner can start the game (you\'re not the lobby owner).');
                } else if (object['StartGameResponse']['Err'] == 'LessThanTwoPlayers') {
                    window.alert(errorResponseString + 'There must be at least two players to start the game.');
                } else if (object['StartGameResponse']['Err'] == 'GameInProgress') {
                    window.alert(errorResponseString + 'This game is already in progress.');
                } else {
                    window.alert(errorResponseString + 'Unknown error.');
                }
            }
        } else if ('GameStartEvent' in object) {
            turnNumber = object['GameStartEvent']['turn_number'];
            hand = object['GameStartEvent']['hand'];
            playerNames = object['GameStartEvent']['players'];
            gameLoop();
        } else if ('PublicGameStateEvent' in object) {
            gameStates.push(object['PublicGameStateEvent']);
            if (object['PublicGameStateEvent']['active_player'] != turnNumber) {
                timerIsActive = false;

            } else {
                var innerBar = document.getElementById('timer-bar-inner').style['background-color'] = 'blue';
                turnEndTime = new Date();
                turnEndTime.setSeconds(turnEndTime.getSeconds() + turnLength);
            }
            // curPhase = object['PubliclatestGameStateEvent']['cur_phase']; // setup, play, complete
/*             hands = object['PubliclatestGameStateEvent']['hands'];
            faceUpThree = object['PubliclatestGameStateEvent']['face_up_three'];
            faceDownThree = object['PubliclatestGameStateEvent']['face_down_three'];
            topCard = object['PubliclatestGameStateEvent']['top_card'];
            pileSize = object['PubliclatestGameStateEvent']['pile_size'];
            clearedSize = object['PubliclatestGameStateEvent']['cleared_size'];
            CurPhase = object['PubliclatestGameStateEvent']['cur_phase']; // setup, play, complete
            activePlayer = object['PubliclatestGameStateEvent']['active_player'];
            lastCardsPlayed = object['PubliclatestGameStateEvent']['last_cards_played'];*/
        } else if ('HandEvent' in object) {
            hand = object['HandEvent'];
        } else {
            console.log("Unknown object: ");
            console.log(object);
        }
    });
    reader.readAsText(event.data);
});

window.setInterval(retrieveLobbies, 60000);

function loadEventListeners() {

    document.getElementById('private-checkbox').addEventListener('click', function() {
        document.getElementById('password-input').disabled = !document.getElementById('private-checkbox').checked;
    });

    document.getElementById('create-lobby-button').addEventListener('click', function() {

        var maxPlayers = Number(document.getElementById('max-players-input').value);
        var lobbyName = document.getElementById('lobby-name-input').value;
        var turnLimit = Number(document.getElementById('turn-timer-input').value);
        playerName = document.getElementById('owner-name-input').value;
        if (document.getElementById('private-checkbox').checked) {
            var password = document.getElementById('password-input').value;
        } else {
            var password = '';
        }

        if (lobbyName == '' || playerName == '') {
            window.alert('Error creating lobby.\nPlease make sure to fill out all required fields.');
        } else if (maxPlayers < 2 || maxPlayers > 8) {
            window.alert('Error creating lobby.\nPlease enter a max players amount between 2 and 8 (inclusive).');
        } else if (document.getElementById('private-checkbox').checked && password == '') {
            window.alert('Error creating lobby.\nFor a private lobby, please enter a password.');
        } else if (turnLimit < 0 || turnLimit > 255) {
            window.alert('Error creating lobby.\nPlease entera turn timer length between 0 and 255 (inclusive).\(Note: 0 means no turn limit.)');
        } else {
            var newLobbyBlob = new Blob(
                [JSON.stringify(
                    {
                        "NewLobby": {
                            "max_players" : maxPlayers,
                            "password"    : password,
                            "lobby_name"  : lobbyName,
                            "player_name" : playerName,
                            "turn_timer"  : turnLimit
                        }
                    }
                )],
                {type:'application/json'}
            );
            socket.send(newLobbyBlob);
        }
    });

    document.getElementById('lobbies-table').addEventListener('click', function(event) {

        if (event.target && event.target.matches('span#join-lobby')) {

            playerName = prompt("Please enter your name:", "");

            if (event.target.getAttribute('password-protected') == 'true') {
                var password = prompt("This lobby is private. Please enter the password:", "");
            } else {
                var password = "";
            }

            lobbyToken = event.target.getAttribute('lobby-id');

            var joinLobbyBlob = new Blob(
                [JSON.stringify(
                    {
                        "JoinLobby": {
                            "lobby_id"    : lobbyToken,
                            "player_name" : playerName,
                            "password"    : password
                        }
                    }
                )],
                {type:'application/json'}
            );

            socket.send(joinLobbyBlob);
        }
    });

    document.getElementById('refresh-lobbies-button').addEventListener('click', function() {
        retrieveLobbies();
    });
}

function retrieveLobbies() {

    var listLobbiesBlob = new Blob(
        [JSON.stringify("ListLobbies")],
        {type:'application/json'}
    );

    socket.send(listLobbiesBlob);
}

function createLobbiesTable(data = []) {
    lobbiesDataTable = new DataTable("#lobbies-table", {
        data: data,
        searchable: true,
        perPageSelect: false,
        firstLast: true,
        sortable: true,
        labels: {
            placeholder: 'Search for a lobby',
            noRows: 'No lobbies found',
            info: 'Showing {start} to {end} of {rows} lobbies'
        }
    });
}

function createPlayerTable(players = []) {

    var rows = [];

    for (var i = 0; i < players.length; i++) {
        var playerString = (i == 0 ? lobbyOwnerIconHtml : '') + players[i];
        rows[i] = [playerString];
    }

    var data = {
        "headings": [
            "Player Name"
        ],
        "data": rows
    };

    playerDataTable = new DataTable("#player-table", {
        data: data,
        searchable: false,
        perPageSelect: false,
        firstLast: true,
        sortable: false,
        labels: {
            noRows: 'Lobby is currently empty',
            info: 'Showing {start} to {end} of {rows} players'
        }
    })
}

function updateLobbiesTable(lobbies) {

    lobbiesDataTable.destroy();

    rows = [];

    for (var i = 0; i < lobbies.length; i++) {
        rows[i] = [
            '<span id="join-lobby" lobby-id="' + lobbies[i]['lobby_id'] + '" password-protected="' + lobbies[i]['has_password'] + '">' + lobbies[i]['name'] + '</span>',
            lobbies[i]['owner'],
            '' + lobbies[i]['cur_players'] + '/' + lobbies[i]['max_players'],
            (lobbies[i]['turn_timer'] == 0) ? 'No turn timer' : '' + lobbies[i]['turn_timer'] + ' seconds',
            lobbies[i]['has_password'] ? '<img class="table-icons" src="./img/icons/lock.svg">' : '<img class="table-icons" src="./img/icons/unlock.svg">',
            getAgeString(lobbies[i]['age']),
            lobbies[i]['started'] ? 'In Progress (spectate)' : 'Waiting to Begin'
        ];
    }

    var data = {
        "headings": [
            "Lobby Name",
            "Lobby Owner",
            "Number of Players",
            "Turn Timer",
            "Password Protected?",
            "Lobby Age",
            "Game Status"
        ],
        "data": rows
    };

    createLobbiesTable(data);

    lobbiesDataTable.columns().sort(5);
}

function updatePlayerTable(newPlayerName) {
    if (!playerDataTable.hasRows) {
        newPlayerName = lobbyOwnerIconHtml + newPlayerName;
    }
    playerDataTable.rows().add([newPlayerName]);
    document.getElementById('current-players-counter').innerHTML = Number(document.getElementById('current-players-counter').innerHTML) + 1;
    if (Number(document.getElementById('current-players-counter').innerText) >= Number(document.getElementById('max-players-counter').innerText)) {
        if (document.getElementById('add-bot-button')) {
            document.getElementById('add-bot-button').disabled = true;
        }
    }
}

function enterLobbyScreen(players, maxPlayers, isLobbyOwner = false) {

    document.getElementById('create-lobby').remove();
    document.getElementById('lobbies-table-div').style.display = 'none';

    document.getElementById('table-header').innerHTML = 'Lobby: Waiting for Game to Begin';
    document.getElementById('table-header').style.textAlign = 'center';

    document.getElementById('num-players').innerHTML = "Players: <span id=\"current-players-counter\">" + players.length + "</span>/<span id=\"max-players-counter\">" + maxPlayers + "</span>";
    if (isLobbyOwner) {
        lobbyControls  = "<form id=\"lobby-buttons\">";
        lobbyControls += "<button type=\"button\" id=\"add-bot-button\">Add Bot</button> ";
        lobbyControls += "<button type=\"button\" id=\"start-game-button\">Start Game</button>";
        lobbyControls += "</form>";
        document.getElementById('lobby-controls').innerHTML = lobbyControls;

        document.getElementById('add-bot-button').addEventListener('click', function() {
            var requestAiBlob = new Blob(
                [JSON.stringify(
                    {
                        "RequestAi": {
                            "lobby_id"  : lobbyToken,
                            "player_id" : playerToken,
                            "num_ai"    : 1
                        }
                    },
                )],
                {type:'application/json'}
            );
            socket.send(requestAiBlob);
        });

        document.getElementById('start-game-button').addEventListener('click', function() {
            var startGameBlob = new Blob(
                [JSON.stringify(
                    {
                        "StartGame": {
                            "player_id" : playerToken,
                            "lobby_id"  : lobbyToken
                        }
                    }
                )],
                {type:'application/json'}
            );
            socket.send(startGameBlob);
        });
    }
    document.getElementById('player-info').style.display = 'block';

    createPlayerTable(players);
    updatePlayerTable([playerName]);
    document.getElementById('player-table-div').style.display = 'block';
}

function getAgeString(age) {
    if (age >= 31557600) {
        return Math.floor((age / 31557600)) + " years";
    } else if (age >= 2629800) {
        return Math.floor((age / 2629800)) + " months";
    } else if (age >= 86400) {
        return Math.floor((age / 86400)) + " days";
    } else if (age >= 3600) {
        return Math.floor((age / 3600)) + " hours";
    } else if (age >= 60) {
        return Math.floor((age / 60)) + " minutes";
    } else {
        return Math.floor(age) + " seconds";
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function turnTimer(effectiveTurnLength) {
    var now = new Date();
    if (timerIsActive && turnEndTime > now) {
        var percentRemaining = ((turnEndTime - now) / 1000) / effectiveTurnLength;
        var innerBar = document.getElementById('timer-bar-inner');
        if (percentRemaining <= 0.2) {
            innerBar.style['background-color'] = 'red';
        }
        document.getElementById('timer-bar-inner').style.width = ('' + (percentRemaining * 100) + '%');
        setTimeout(turnTimer, 1000, effectiveTurnLength);
    }
}

async function gameLoop() {
    while (true) {
        while (gameStates.length == 0) {
            await sleep(10);
        }
        latestGameState = gameStates.shift();
        updateGameScreen();
        await sleep(2000);
    }
}

function updateGameScreen() {

    var trueLastValue = null;
    var lastIndex = 0;
    recentCards = latestGameState['last_cards_played'].reverse().concat(recentCards);
    recentCards = recentCards.slice(0, latestGameState['pile_size']);
    for (lastIndex = 0; lastIndex < recentCards.length; lastIndex++) {
        if (trueLastValue == null) {
            if (recentCards[lastIndex]['value'] != 'Four') {
                trueLastValue = recentCards[lastIndex]['value'];
            }
        } else {
            if (recentCards[lastIndex]['value'] != 'Four' && trueLastValue != null && recentCards[lastIndex]['value'] != trueLastValue) {
                break;
            }
        }
    }

    recentCards = recentCards.slice(0, lastIndex);

    if (trueLastValue != null) {
        while (recentCards[recentCards.length - 1]['value'] == 'Four') {
            recentCards = recentCards.slice(0, recentCards.length - 1);
        }
    }

    // TIMER BAR
    newHtml = '<div id="timer-bar-outer">';
    newHtml += '<div id="timer-bar-inner" style="visibility:hidden">';
    newHtml += '</div>';
    newHtml += '</div>';

    // TABLE CARDS 
    newHtml += '<div id="other-players">';
    for (i = 0; i < latestGameState['hands'].length; i++) {
        if (i != turnNumber) { // if player is not you
            newHtml += generateTableHtml(i, playerNames[String(i)], turnNumber, setNum, backNum, 60);
        }
    }
    newHtml += '</div>';

    // CARD STACK
    newHtml += '<div id="center-area"><div id="card-stack">';
    if (latestGameState['top_card']) {
        newHtml += generateCardHtml(latestGameState['top_card'], setNum, 150);
    } else {
        newHtml += generateCardHtml({'value':'Two', 'suit':'Clubs'}, setNum, 150, false, true);
    }
    newHtml += '</div>';
    newHtml += '<div id="stack-info"><span id="stack-info-span">'
    newHtml += 'Top of the stack:<ul>';
    for (var i = 0; i < recentCards.length; i++) {
        newHtml += '<li>' + recentCards[i]['value'] + ' of ' + recentCards[i]['suit'] + '</li>';
    }
    newHtml += '</ul>';
    newHtml += 'Cards on the stack: ' + latestGameState['pile_size'] + '</span></div>';
    newHtml += '</div>';

    // PLAYER CARDS
    newHtml += '<div id="my-cards">';
    // player's table cards
    newHtml += '<div class="my-table" id="player-' + turnNumber + '">';
    newHtml += generateTableHtml(turnNumber, playerName, turnNumber, setNum, backNum, 100);
    newHtml += '</div>';
    // player's hand cards
    newHtml += '<div class="hand-cards" id="player-' + turnNumber + '">';
    hand = sortCards(hand);
    for (var i = 0; i < hand.length; i++) {
        var selectable = false;
        if (latestGameState['active_player'] == turnNumber) {
            selectable = true;
        }
        newHtml += generateCardHtml(hand[i], setNum, 100, selectable);
    }
    newHtml += '</br><button type="button" id="play-cards"'
    if (latestGameState['active_player'] != turnNumber) {
        newHtml += ' disabled';
    }
    newHtml += '>Play Cards</button>'
    newHtml += '</div>';
    newHtml += '</div>';

    document.getElementById('landing').innerHTML = newHtml;

    if (latestGameState['active_player'] == turnNumber) {
        var now = new Date();
        var effectiveTurnLength = (turnEndTime - now) / 1000;
        document.getElementById('timer-bar-inner').style.visibility = 'visible';
        timerIsActive = true;
        turnTimer(effectiveTurnLength);
    }

    document.getElementById('my-cards').addEventListener('click', function(event) {

        if (event.target && event.target.matches('img.card-front-img') && !event.target.classList.contains('card-disabled')) {

            event.target.classList.toggle('card-selected');
            var cardName = event.target.getAttribute('title');

            if (event.target.classList.contains('card-selected')) { // card becomes selected

                selectedCards.push(cardName);
                currentCards = document.querySelectorAll('img.card-front-img');

                if (latestGameState['cur_phase'] == 'Setup') {
                    if (selectedCards.length >= 3) {
                        for (var i = 0; i < currentCards.length; i++) {
                            if (!currentCards[i].classList.contains('card-selected')) {
                                currentCards[i].classList.add('card-disabled');
                            }
                        }
                    }
                } else {
                    var value = selectedCards[0].split(' ')[0];
                    for (var i = 0; i < currentCards.length; i++) {
                        if (!currentCards[i].classList.contains('card-selected') && currentCards[i].getAttribute('card-value') != value) {
                            currentCards[i].classList.add('card-disabled');
                        }
                    }
                }
            } else { // card becomes unselected
                var index = selectedCards.indexOf(cardName);
                selectedCards.splice(index, 1);

                if (latestGameState['cur_phase'] == 'Setup') {
                    disabledCards = document.querySelectorAll('img.card-disabled');
                    for (var i = 0; i < disabledCards.length; i++) {
                        disabledCards[i].classList.remove('card-disabled');
                    }
                } else {
                    if (selectedCards.length == 0) {
                        for (var i = 0; i < currentCards.length; i++) {
                            currentCards[i].classList.remove('card-disabled');
                        }
                    }
                }
            }
        }
    });

    document.getElementById('play-cards').addEventListener('click', function() {
        var cardObjects = [];
        for (var i = 0; i < selectedCards.length; i++) {
            var cardInfo = selectedCards[i].split(' of ');
            cardObjects.push({
                'value' : cardInfo[0],
                'suit'  : cardInfo[1]
            })
        }
        if (latestGameState['cur_phase'] == 'Setup') {
            var chooseFaceupBlob = new Blob(
                [JSON.stringify(
                    {
                        'ChooseFaceup': {
                            'lobby_id'   : lobbyToken,
                            'player_id'  : playerToken,
                            'card_one'   : cardObjects[0],
                            'card_two'   : cardObjects[1],
                            'card_three' : cardObjects[2]
                        }
                    }
                )],
                {type:'application/json'}
            );
            socket.send(chooseFaceupBlob);
            selectedCards = [];
        } else if (latestGameState['cur_phase'] == 'Play') {
            var makePlayBlob = new Blob(
                [JSON.stringify(
                    {
                        'MakePlay': {
                            'lobby_id'  : lobbyToken,
                            'player_id' : playerToken,
                            'cards'     : cardObjects
                        }
                    }
                )]
            );
            socket.send(makePlayBlob);
            selectedCards = [];
        }
    });
}

function generateTableHtml(playerId, playerName, myId, setNum, backNum, cardWidth) {

    html = '<div class="player" id="player-' + playerId + '">';

    if (playerId != myId) {
        html += '<h3>';
        if (latestGameState['active_player'] == playerId) {
            html += ' <img class="table-icons" src="./img/icons/star.svg">';
        }
        html += playerName + ' (' + (playerId+1) + ')</h3>';
        html += '<p>' + latestGameState['hands'][playerId] + ' cards in hand</p>';
    }

    for (j = 0; j < latestGameState['face_up_three'][playerId].length; j++) {
        var selectable = false;
        if (playerId == latestGameState['active_player'] && (latestGameState['cur_phase'] == 'Setup' || latestGameState['hands'][myId] == 0)) {
            selectable = true;
        }
        html += generateCardHtml(latestGameState['face_up_three'][playerId][j], setNum, cardWidth, selectable);
    }

    html += '</br>';

    for (j = 0; j < latestGameState['face_down_three'][playerId]; j++) {
        html += '<img class="card" src="img/backs/back-' + backNum + '.svg" width="' + cardWidth + 'px">';
    }

    html += '</div>';

    return html;
}

function generateCardHtml(card, setNum, width, selectable = false, transparent = false) {
    html  = '<img src="img/set-' + setNum + '/' + getCardName(card) + '.svg"';
    if (transparent) {
        html += ' style="opacity:0.0;"';
    } else {
        html += ' title="' + card['value'] + ' of ' + card['suit'] + '"';
    }
    if (selectable) {
        html += ' class="card card-front-img"';
    } else {
        html += ' class="card"';
    }
    html += ' card-value="' + card['value'] + '" width="' + width + 'px">';
    return html;
}

function getCardName(card) {

    cardName = '';

    switch (card['value']) {
        case 'Two':
            cardName += '2';
            break;
        case 'Three':
            cardName += '3';
            break;
        case 'Four':
            cardName += '4';
            break;
        case 'Five':
            cardName += '5';
            break;
        case 'Six':
            cardName += '6';
            break;
        case 'Seven':
            cardName += '7';
            break;
        case 'Eight':
            cardName += '8';
            break;
        case 'Nine':
            cardName += '9';
            break;
        case 'Ten':
            cardName += '10';
            break;
        case 'Jack':
            cardName += 'J';
            break;
        case 'Queen':
            cardName += 'Q';
            break;
        case 'King':
            cardName += 'K';
            break;
        case 'Ace':
            cardName += 'A';
            break;
    }

    return cardName + card['suit'][0];
}

function sortCards(cards) {
    var cardValues = {
        'Two':   2,
        'Three': 3,
        'Four':  4,
        'Five':  5,
        'Six':   6,
        'Seven': 7,
        'Eight': 8,
        'Nine':  9,
        'Ten':   10,
        'Jack':  11,
        'Queen': 12,
        'King':  13,
        'Ace':   14
    }
    var suitValues = {
        'Clubs':    0,
        'Diamonds': 1,
        'Hearts':   2,
        'Spades':   3
    }
    return cards.sort(function(a, b) {
        return ((cardValues[a['value']] * 10) + suitValues[a['suit']]) - ((cardValues[b['value']] * 10) + suitValues[b['suit']]);
    });
}
