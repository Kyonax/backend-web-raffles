const Exe = require('../../tools/functions'); const Api = require('../../tools/api_raflle_platform');
require("dotenv").config(); const ConfigWinner = require('./config/getWinnerRaffle');


module.exports = {
    run: async function () {
        this.api_tickets();
        
        //this.get_winner();
    },
    api_tickets: async function () {
        let _data_tickets = await Exe.axiosGet(process.env.REACT_APP_API_DATA_PATH);
        let _data_store = await Api.getAll(); _data_tickets = _data_tickets.data
        let _objTicketsData = {};

        for (var i in _data_store) {
            let { reference, id, winner } = _data_store[i], _participants = 0, _tickets = 0, _rot = 0;
            for (var j in _data_tickets) {
                let { tituloitem, tickets, rotgastado } = _data_tickets[j];
                if (reference === tituloitem) {
                    _tickets += parseInt(tickets);
                    _rot += parseInt(rotgastado);
                    _participants++
                }
            }
            _objTicketsData = {
                id: id,
                reference: reference,
                data: {
                    total_users: _participants,
                    total_tickets: _tickets,
                    total_rot: _rot
                }
            }

            let _updateObj = JSON.parse(winner);
            _updateObj.data_users_raffle = _objTicketsData.data;
            await Api.patchCard(id, "winner", JSON.stringify(_updateObj));
        }

    }, check_winner: async function () {
        let _data_tickets = await Exe.axiosGet(process.env.REACT_APP_API_DATA_PATH);
        let _data_store = await Api.getAll(); _data_tickets = _data_tickets.data; _objTicketsData = {};
        let _objWinners = {};

        for (var i in _data_store) {
            let { reference, id, winner } = _data_store[i], _array_winners = [], key_exist_winner = true;


            JSON.parse(winner).result.forEach(_winner => {
                if (_winner.wallet !== "Not Winner Yet") {

                    let _tickets = 0, _rot = 0, _signatures = [], _percentage = 0;

                    for (var j in _data_tickets) {
                        let { tituloitem, tickets, rotgastado, billetera, signature } = _data_tickets[j];

                        if (tituloitem === reference) {
                            if (billetera === _winner.wallet) {
                                _tickets = _tickets + parseInt(tickets); _rot = _rot + parseInt(rotgastado); _signatures.push(signature);
                            }
                        }

                    }

                    //console.log(`Wallet: ${_winner.wallet} Tickets: ${_tickets} Rot: ${_rot}`);
                    _percentage = (_tickets * 100) / JSON.parse(winner).data_users_raffle.total_tickets;
                    let _claimed = "Claimed";
                    if (_winner.wallet === "Not Winner Yet") _claimed = "Not-Claimed-Yet"
                    if (!_percentage) _percentage = 0

                    _percentage = String(_percentage).substring(0, 5)

                    _array_winners.push({
                        wallet: _winner.wallet,
                        percentage: _percentage,
                        tickets: _tickets,
                        tokens: _rot,
                        claimed: _claimed
                    })
                } else {
                    key_exist_winner = false;
                }


            });


            if (key_exist_winner !== false) {
                _objWinners[id] = {
                    id: id,
                    data: {
                        result: _array_winners,
                        amount: JSON.parse(winner).amount,
                        data_users_raffle: JSON.parse(winner).data_users_raffle
                    }

                }
            }
        }

        if (Object.keys(_objWinners).length > 0) {
            for (var i in _objWinners) {
                await Api.patchCard(_objWinners[i].id, "winner", JSON.stringify(_objWinners[i].data));
                console.log(_objWinners[i].data, `Raffle: ${_objWinners[i].id}`)
            }
        }

    }, get_winner: async function () {
        let _allCards = await Api.getAll();

        const arrangeData = async (props, index) => {
            console.log(props.obj[index].id);
            await ConfigWinner.setRaffleToWin(props.obj[index].id);
        };
        let props = { obj: _allCards }, _props = Exe.propsObject(props, "data");

        Exe.loopMethodEach(arrangeData, _props, 3000, 0, Object.keys(_allCards).length);
        //ConfigWinner.setRaffleToWin(13);
    }
}