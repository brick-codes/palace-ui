somethingLoaded = false;
dataTable = null;
playerToken = '';
lobbyToken = '';

socket = new WebSocket("ws://dev.brick.codes:3012");

function init() {
    if (somethingLoaded) {
        createTable();
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
            playerToken = object['player_id'];
            lobbyToken  = object['lobby_id'];
            retrieveLobbies();
        } else if ('JoinLobbyResponse' in object) {
            playerToken = object['player_id'];
        } else if ('LobbyList' in object) {
            updateTable(object['LobbyList']);
        } else {
            console.log("Unknown object: ");
            console.log(object);
        }
    });
    reader.readAsText(event.data);
});

window.setInterval(retrieveLobbies, 5000);

function loadEventListeners() {

    document.getElementById('private-checkbox').addEventListener('click', function() {
        document.getElementById('password-input').disabled = !document.getElementById('private-checkbox').checked;
    });

    document.getElementById('create-lobby-button').addEventListener('click', function() {
        var newLobbyBlob = new Blob(
            [JSON.stringify(
                {
                    "NewLobby": {
                        "max_players" : Number(document.getElementById('max-players-input').value),
                        "password"    : document.getElementById('password-input').value,
                        "lobby_name"  : document.getElementById('lobby-name-input').value,
                        "player_name" : document.getElementById('owner-name-input').value
                    }
                }
            )],
            {type:'application/json'}
        );

        socket.send(newLobbyBlob);
    });
}

function retrieveLobbies() {

    var listLobbiesBlob = new Blob(
        [JSON.stringify("ListLobbies")],
        {type:'application/json'}
    );

    socket.send(listLobbiesBlob);
}

function createTable(data = []) {
    dataTable = new DataTable("#lobbies", {
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

function updateTable(lobbies) {

    dataTable.destroy();

    rows = [];

    for (var i = 0; i < lobbies.length; i++) {
        rows[i] = [
            lobbies[i]['name'],
            lobbies[i]['owner'],
            '' + lobbies[i]['cur_players'] + '/' + lobbies[i]['max_players'],
            lobbies[i]['has_password'],
            lobbies[i]['age'],
            lobbies[i]['started']
        ];
    }

    var data = {
        "headings": [
            "Lobby Name",
            "Lobby Owner",
            "Number of Players",
            "Public or Private",
            "Lobby Age",
            "In Progress",
        ],
        "data": rows
    };

    createTable(data);
}
