playerToken = '';
lobbyToken = '';

var socket = new WebSocket("ws://dev.brick.codes:3012");

var listLobbiesBlob = new Blob(
    [JSON.stringify("ListLobbies")],
    {type:'application/json'}
);

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

socket.addEventListener('open', function (event) {
    socket.send(newLobbyBlob);
});

socket.addEventListener('message', function (event) {
    var reader = new FileReader();
    reader.addEventListener("loadend", function() {
        playerToken = reader.result['player_id'];
        lobbyToken  = reader.result['lobby_id'];
    });
    reader.readAsText(event.data);
});

document.onload = update();

function update() {

    console.log(document.querySelector("#lobbies"));

    var dataTable = new DataTable("#lobbies", {
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
