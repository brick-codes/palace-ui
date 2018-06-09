somethingLoaded = false;
playerToken = '';
lobbyToken = '';

socket = new WebSocket("ws://dev.brick.codes:3012");

var newLobbyBlob = new Blob(
    [JSON.stringify(
        {
            "NewLobby": {
                "max_players" : 4,
                "password"    : "",
                "lobby_name"  : "brickhouse",
                "player_name" : "matt"
            }
        }
    )],
    {type:'application/json'}
);

function init() {
    if (somethingLoaded) {
        socket.send(newLobbyBlob);
        socket.send(newLobbyBlob);
        socket.send(newLobbyBlob);
        socket.send(newLobbyBlob);
        socket.send(newLobbyBlob);
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

window.setInterval(retrieveLobbies, 30000);

function retrieveLobbies() {

    var listLobbiesBlob = new Blob(
        [JSON.stringify("ListLobbies")],
        {type:'application/json'}
    );

    socket.send(listLobbiesBlob);
}

function updateTable(lobbies) {

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

    var dataTable = new DataTable("#lobbies", {
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
