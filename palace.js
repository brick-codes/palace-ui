cards = {"hands":[6,6,6,6],"face_up_three":[[{"value":"Eight","suit":"Diamonds"},{"value":"Six","suit":"Hearts"},{"value":"Ten","suit":"Hearts"}],[{"value":"Six","suit":"Spades"},{"value":"Nine","suit":"Diamonds"},{"value":"Queen","suit":"Spades"}],[{"value":"Eight","suit":"Clubs"},{"value":"Eight","suit":"Hearts"},{"value":"Four","suit":"Diamonds"}],[{"value":"Three","suit":"Clubs"},{"value":"Two","suit":"Spades"},{"value":"Seven","suit":"Clubs"}]],"face_down_three":[3,3,3,3],"top_card":{"value":"King","suit":"Spades"},"pile_size":1,"cleared_size":0}

numPlayers = cards['hands'].length;
myName = 'Richard';
myId = 2;
setNum = 3;
backNum = 1;

window.onload = update;

function update() {

    var parentElement = document.getElementById('body');


    /////////////////
    // TABLE CARDS //
    /////////////////

    newHtml = '<div id="other-players">';

    for (i = 0; i < numPlayers; i++) {
        if (i != myId) { // if player is not you
            newHtml += generateTableHtml(i, "Richard", myId, setNum, backNum, 60);
        }
    }

    newHtml += '</div>';


    ////////////////
    // CARD STACK //
    ////////////////

    newHtml += '<div id="card-stack">';
    newHtml += generateCardHtml(cards['top_card'], setNum, 150);
    newHtml += '</div>';


    //////////////////
    // PLAYER CARDS //
    //////////////////

    newHtml += '<div id="my-cards">';

    // player's table cards
    newHtml += '<div class="my-table" id="player-' + myId + '">';
    newHtml += generateTableHtml(myId, myName, myId, setNum, backNum, 100);
    newHtml += '</div>';


    // player's hand cards
    newHtml += '<div class="hand-cards" id="player-' + myId + '">';

    newHtml += '</div>';

    newHtml += '</div>';

    document.getElementById('body').innerHTML = newHtml;
}

function generateTableHtml(playerId, playerName, myId, setNum, backNum, cardWidth) {

    html = '<div class="player" id="player-' + playerId + '">';

    if (playerId != myId) {
        html += '<h3>' + playerName + '</h3><p>' + cards['hands'][playerId] + ' cards in hand</p>';
    }

    for (j = 0; j < cards['face_up_three'][playerId].length; j++) {
        html += generateCardHtml(cards['face_up_three'][playerId][j], setNum, cardWidth);
    }

    html += '</br>';

    for (j = 0; j < cards['face_down_three'][playerId]; j++) {
        html += '<img src="img/backs/back-' + backNum + '.svg" width="' + cardWidth + 'px">';
    }

    html += '</div>';

    return html;
}

function generateCardHtml(card, setNum, width) {
    html  = '<img src="img/set-' + setNum + '/' + getCardName(card) + '.svg"';
    html += ' title="' + card['value'].toLowerCase() + ' of ';
    html += card['suit'].toLowerCase() + '" width="' + width + 'px">';
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
