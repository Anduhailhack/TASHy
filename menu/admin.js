class Admin {
    constructor (bot) {
        this.bot = bot
    }

    async home (userId, f_name) {
        this.bot.telegram.sendMessage(userId, 
            `Welcome Home ${f_name}, You have logged in successfully! \n You would be able to do your Service Provider Operation From here!`,
            {
                parse_mode: "HTML",
                reply_markup : {
                    inline_keyboard :[
                        [
                            {
                                text: "🤕 Check patient requests",
                                web_app : {
                                    url : process.env.BASE_WEB_APP + "/sp/check_requests",
                                }
                            },
                        ],
                        [
                            {
                                text: "📆 Check Appointments",
                                web_app : {
                                    url : process.env.BASE_WEB_APP + "/sp/check_appointments",
                                }
                            },
                        ],
                        [
                            {
                                text: "📆🖊 Set appointments",
                                web_app : {
                                    url : process.env.BASE_WEB_APP + "/sp/set_appointments",
                                }
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

module.exports = { Admin }