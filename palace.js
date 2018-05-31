cards = {"hands":[6,6,6,6],"face_up_three":[[{"value":"Eight","suit":"Diamonds"},{"value":"Six","suit":"Hearts"},{"value":"Ten","suit":"Hearts"}],[{"value":"Six","suit":"Spades"},{"value":"Nine","suit":"Diamonds"},{"value":"Queen","suit":"Spades"}],[{"value":"Eight","suit":"Clubs"},{"value":"Eight","suit":"Hearts"},{"value":"Four","suit":"Diamonds"}],[{"value":"Three","suit":"Clubs"},{"value":"Two","suit":"Spades"},{"value":"Seven","suit":"Clubs"}]],"face_down_three":[3,3,3,3],"top_card":{"value":"King","suit":"Spades"},"pile_size":1,"cleared_size":0}

numPlayers = cards['hands'].length;
playerName = 'Richard';
setNum = 3;
backNum = 1;

window.onload = update;

function update() {

    for (i = 0; i < numPlayers; i++) {
 
        var parentElement = document.getElementById('other-players');

        if (true) { // if player is not you

            newHtml = '<h3>' + playerName + '</h3><p>' + cards['hands'][i] + ' cards in hand</p>'

            for (j = 0; j < cards['face_up_three'][i].length; j++) {
                newHtml += '<img src="img/set-' + setNum + '/' + getCardName(cards['face_up_three'][i][j]) + '.svg"';
                newHtml += ' title="' + cards['face_up_three'][i][j]['value'].toLowerCase() + ' of ';
                newHtml += cards['face_up_three'][i][j]['suit'].toLowerCase() + '" width="60px">';
            }

            newHtml += '</br>';

            for (j = 0; j < cards['face_down_three'][i]; j++) {
                newHtml += '<img src="img/backs/back-' + backNum + '.svg" width="60px">';
            }

            document.getElementById('player-' + i).innerHTML = newHtml;
        }
    }
}

function getCardName(card) {

    cardName = ''

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
