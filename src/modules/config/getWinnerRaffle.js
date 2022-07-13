const functions = require('../../../tools/functions'), Api = require('../../../tools/api_raflle_platform');
const axios = require('axios')
require("dotenv").config();

module.exports = {
    getWinnerRaffle: async function (key) {
        let API = process.env.REACT_APP_API_DATA_PATH + ""; let _winner;

        await axios.get(API).then((api_data_) => {
            let array_api_data = [], array_sort_users = [], array_members = []
            array_api_data.push(api_data_)

            array_api_data[0].data.forEach(data => {
                if (data.tituloitem === key) {

                    for (let index = 0; index < data.tickets; index++) {
                        array_sort_users.push({
                            wallet: data.billetera,
                            percentage_win: "% De Probabilidades",
                            tickets: 0,
                            all_tickets: 0
                        });
                    }
                    functions.shuffleArray(array_sort_users)
                }
            });

            for (let index = 0; index < array_sort_users.length; index++) {
                var count = 0;
                array_sort_users.forEach((v) => (v.wallet === array_sort_users[index].wallet && count++));
                array_sort_users[index].tickets = count;
                array_sort_users[index].all_tickets = array_sort_users.length;
                array_sort_users[index].percentage_win = `${((count * 100) / array_sort_users.length).toFixed(2)}% Probabilidades`;
            }
            array_sort_users.forEach(data => {
                let key = false
                array_members.forEach(data_ => {
                    if (data_ === data.wallet) {
                        key = true;
                    }
                });

                if (key === false) {
                    array_members.push(data.wallet);
                }
            });

            _winner = functions.chooseRandomItem(array_sort_users)
            this.showWinnerRaffle(_winner)

        })
        return _winner
    },
    setRaffleToWin: async function (key) {
        const monthsLong = {
            jan: '0', feb: '1', mar: '2', apr: '3',
            may: '4', jun: '5', jul: '6', aug: '7',
            sep: '8', oct: '9', nov: '10', dec: '11',
        };

        let _cardObj = await Api.getCard(key), _dateCard = JSON.parse(_cardObj[0].date);
        let day = _dateCard.end.split(' ')[0]; month = _dateCard.end.split(' ')[1]; time = _dateCard.end.split(' ')[2];
        let hour = time.split(':')[0], minutes = time.split(':')[1], seconds = time.split(':')[2]; month = monthsLong[String(month).toLowerCase()];

        let date_card = new Date(Date.UTC(2022, parseInt(month), parseInt(day), parseInt(hour), parseInt(minutes), parseInt(seconds), 0));
        let now_date = new Date(); let _now_date = now_date.getTime(), _date_card = date_card.getTime();
        let left_time = _date_card - _now_date; date_card = date_card.toUTCString(); now_date = now_date.toUTCString()
        let left_day = Math.floor(left_time / (1000 * 60 * 60 * 24)),
            left_hours = Math.floor((left_time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)), left_minutes = Math.floor((left_time % (1000 * 60 * 60)) / (1000 * 60)),
            left_seconds = Math.floor((left_time % (1000 * 60)) / 1000);

        let _dateUpdate = {
            day: left_day,
            month: month,
            time: {
                hour: left_hours,
                minutes: left_minutes,
                seconds: left_seconds
            }
        }
        if (left_day <= 0 && left_hours <= 0 && left_minutes <= 0 && left_seconds <= 0) {
            this.run_winners(key);
        } else {
            console.log(date_card)
            console.log(now_date)
            console.log(_dateUpdate);
        }

    },
    showWinnerRaffle: async function (winner) {
        console.log(winner)
    }, run_winners: async function (key) {
        let _obj = await Api.getCard(key), _winners = JSON.parse(_obj[0].winner), index = 0;


        for (let index = 0; index < _winners.result.length; index++) {

            let _member_winner = await this.getWinnerRaffle(_obj[0].reference);

            if (_member_winner.wallet === _winners.result[index].wallet) {                
                console.log("It's the Same")
                console.log(`Data: ${_winners.result[index].wallet} Winner: ${_member_winner.wallet} Index: ${index}`)
                index--; 
            }
            

        }


    }
}