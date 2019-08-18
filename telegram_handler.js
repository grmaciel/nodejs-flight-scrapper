const TelegramBot = require('node-telegram-bot-api');
const db = require('./db.js');

class TelegramHandler {

    constructor() {
        // if (this.bot != null) return
        this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
        this.defineFindListener();
    }

    defineFindListener() {
        // Matches "/find"
        this.bot.onText(/\/find (.+)/, (msg, match) => {
            try {
                // 'msg' is the received Message from Telegram
                // 'match' is the result of executing the regexp above on the text content of the message
                const chatId = msg.chat.id;
                const requestData = match[1];
                console.log("FIND -> chatId: " + chatId + ", data: " + requestData);

                // match needs to match with this regex [A-Z a-z]{3,}\-[A-Z a-z]{3,}\s\d+\/\d+\/\d+\-\d+\/\d+\/\d+\s\d+\-\d+
                var rePattern = new RegExp(/[A-Z a-z]{3,}\-[A-Z a-z]{3,}\s\d+\/\d+\/\d+\-\d+\/\d+\/\d+\s\d+\-\d+/);

                const hasMatch = requestData.match(rePattern) != null;
                if (!hasMatch) {
                    this.bot.sendMessage(chatId, "Your query doesn't match, please follow the pattern '/find Blumenau-Berlin 01/10/19-01/10/20 14-20'");
                    return;
                }

                // break down the departure and destination by [A-Z a-z]{3,}\-[A-Z a-z]{3,}\s
                rePattern = new RegExp(/[A-Z a-z]{3,}\-[A-Z a-z]{3,}\s/);
                var tempMatchResult = requestData.match(rePattern)[0].split("-");
                const departure = tempMatchResult[0].trim();
                const destination = tempMatchResult[1].trim();

                // break down the dates from to by \s\d+\/\d+\/\d+\-\d+\/\d+\/\d+\s
                rePattern = new RegExp(/\s\d+\/\d+\/\d+\-\d+\/\d+\/\d+\s/);
                tempMatchResult = requestData.match(rePattern)[0].split("-");
                const dateFrom = tempMatchResult[0].trim();
                const dateTo = tempMatchResult[1].trim();

                // break down the amount of days by \s\d+\-\d+
                rePattern = new RegExp(/\s\d+\-\d+/);
                tempMatchResult = requestData.match(rePattern)[0].split("-");
                const minDays = tempMatchResult[0].trim();
                const maxDays = tempMatchResult[1].trim();

                // save to db those variable + chatId
                const orderId = db.save(chatId, departure, destination, dateFrom, dateTo, minDays, maxDays);

                const confirmationMessage = "Confirmed flight search:" +
                "\nFrom " + departure + " to " + destination +
                "\nBetween dates " + dateFrom + " to " + dateTo +
                "\nBetween " + minDays + " to " + maxDays + " days" +
                "\nIt will search on the next batch and send the results back to you." +
                "\nTo cancel this search, send /cancel " + orderId;

                // send to the chat
                this.bot.sendMessage(chatId, confirmationMessage);
            } catch(err) {
                console.log(err.message);
            }
        });

        this.bot.onText(/\/cancel (.+)/, (msg, match) => {
            try {
                const chatId = msg.chat.id;
                const requestData = match[1];
                console.log("CANCEL -> chatId: " + chatId + ", data: " + requestData);
            } catch(err) {
                console.log(err.message);
            }
        });
    }

    sendMessage(chatId, message) {
        this.bot.sendMessage(chatId, message);
    }
}

module.exports = new TelegramHandler();