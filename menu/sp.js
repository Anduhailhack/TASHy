class ServiceProvider {
    constructor (bot) {
        this.bot = bot
    }

    async home (userId, f_name) {
        this.bot.telegram.sendMessage(userId, 
            `Hello ${f_name},\n You would be able to do your Service Provider Operation From here!`,
            {
                parse_mode: "HTML",
                reply_markup : {
                    inline_keyboard :[
                        [
                            {
                                text: "📆 Check Requests",
                                callback_data: "check-requests"
                            },
                        ],
                        [
                            {
                                text: "📆🖊 Check Appointment",
                                callback_data: "check-my-appointments"
                            },
                        ],
                        [
                            {
                                text: "Logout",
                                callback_data : "sp_logout"
                            },
                        ],
                    ]
                }
            }
        )
    }
}

module.exports = { ServiceProvider }