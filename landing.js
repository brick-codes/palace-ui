somethingLoaded = false;
lobbiesDataTable = null;
playerDataTable = null;
playerToken = '';
lobbyToken = '';
playerName = '';

socket = new WebSocket("ws://dev.brick.codes:3012");

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
        if ('NewLobbyResponse' in object) {
            if ('Ok' in object['NewLobbyResponse']) {
                playerToken = object['NewLobbyResponse']['player_id'];
                lobbyToken  = object['NewLobbyResponse']['lobby_id'];
                enterLobbyScreen(true);
            } else {
                window.alert("Error creating lobby.\nPlease make sure all fields are filled and try again.");
            }
            retrieveLobbies();
        } else if ('JoinLobbyResponse' in object) {
            playerToken = object['player_id'];
            enterLobbyScreen(false);
        } else if ('ListLobbiesResponse' in object) {
            updateLobbiesTable(object['ListLobbiesResponse']);
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
        } else {
            var newLobbyBlob = new Blob(
                [JSON.stringify(
                    {
                        "NewLobby": {
                            "max_players" : maxPlayers,
                            "password"    : password,
                            "lobby_name"  : lobbyName,
                            "player_name" : playerName
                        }
                    }
                )],
                {type:'application/json'}
            );
            socket.send(newLobbyBlob);
        }
    });

    document.getElementById('lobbies-table').addEventListener('click', function(event) {

        if (event.target && event.target.matches('a#join-lobby')) {

            playerName = prompt("Please enter your name:", "");

            if (event.target.getAttribute('password-protected') == 'true') {
                var password = prompt("This lobby is private. Please enter the password:", "");
            } else {
                var password = "";
            }

            var joinLobbyBlob = new Blob(
                [JSON.stringify(
                    {
                        "JoinLobby": {
                            "lobby_id"    : event.target.getAttribute('lobby-id'),
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

function createPlayerTable(data = []) {
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
            '<a href id="join-lobby" lobby-id="' + lobbies[i]['lobby_id'] + '" password-protected="' + lobbies[i]['has_password'] + '">' + lobbies[i]['name'] + '</a>',
            lobbies[i]['owner'],
            '' + lobbies[i]['cur_players'] + '/' + lobbies[i]['max_players'],
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
            "Password Protected?",
            "Lobby Age",
            "Game Status"
        ],
        "data": rows
    };

    createLobbiesTable(data);

    lobbiesDataTable.columns().sort(5);
}

function updatePlayerTable(players) {

    playerDataTable.destroy();

    for (var i = 0; i < players.length; i++) {
        rows[i] = [
            players[i]
        ]
    }

    var data = {
        "headings": [
            "Player Name"
        ],
        "data": rows
    }

    createPlayerTable(data);
}

function enterLobbyScreen(isLobbyOwner = false) {

    document.getElementById('create-lobby').remove();
    document.getElementById('lobbies-table-div').style.display = 'none';

    document.getElementById('table-header').innerHTML = 'Lobby: Waiting for Game to Begin';
    document.getElementById('table-header').style.textAlign = 'center';

    createPlayerTable();
    updatePlayerTable([playerName]);
    document.getElementById('player-table-div').style.display = 'block';

    if (isLobbyOwner) {
        // diaplay lobby controls
    }
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
        return Math.floor(age)  + " seconds";
    }
}