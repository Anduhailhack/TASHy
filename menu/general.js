const {Session} = require('./../database/SchemaModels')
const {ServiceProvider} = require('./../menu/sp')
const {Student} = require('./../menu/student')

class General {
    static db
    
    static homeTxt = "🏠 <b>Home: </b>"

   static loginTxt = `🗝 <b>Login:</b>\n 
    How would you like to proceed? \n
    Click the following button to fill out your credentials.`
 

    static signupTxt = `📃 <b>Sign up</b> \n
    How would you like to proceed? \n
    Click the following buttons to fill out your form.`

    static aboutUsTxt = "This is a medical or mental health consultation booking bot developed by the SAC developers team for AAU SoM students."

    constructor(db){
        General.db = db
    }
    
    async home(ctx) {

        try {
            await ctx.deleteMessage()
        } catch (error) {
        }
        
        ctx.sendMessage(General.homeTxt, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🗝 Login", callback_data: "login" }],
                    [{ text: "📃 Sign Up", callback_data: "signup" }],
                    [{ text: "🧑‍⚕️ About SAC 👨‍⚕️", callback_data: "about_us" }],
                ],
            },
        })
    }

	async login(ctx) {
        try {
            await ctx.deleteMessage()
        } catch (error) {
        }
    
        const buttons = Array(
            [
                {
                    text: "👨‍🎓 Student 🧑‍🎓",
                    web_app: {
                        url: process.env.BASE_WEB_APP + "/stud/login",
                    }
                }
            ],
          //  [
         //       {
        //            text: "💰 I want to donate",
       //             web_app: {
      //                  url: process.env.BASE_WEB_APP + "/donate",
    //                }
   //             }
   //         ],
            [{ text: "« back home", callback_data:"home" }]
        )

        await General.db.getWhiteListedSP(ctx.update.callback_query.from.id, (result) => {
            if (result && result.status){
                buttons.splice(1, 0, [
                    {
                        text: "🧑‍⚕️ Service Provider 👨‍⚕️",
                        web_app: {
                            url: process.env.BASE_WEB_APP + "/sp/login",
                        },
                    }
                ])
            }
        })

        await General.db.getWhiteListedAdmin(ctx.update.callback_query.from.id, (result) => {
            if (result && result.status){
                buttons.splice(1, 0, [
                    {
                        text: "🧑‍⚕️👨‍⚕️ Admin 👮‍♂️👮‍♀️",
                        web_app: {
                            url: process.env.BASE_WEB_APP + "/admin/login",
                        },
                    }
                ])
            }
        })
    
        ctx.sendMessage(
            General.loginTxt, {
                parse_mode: "HTML",
                reply_markup : { 
                    inline_keyboard : buttons
                }
            }	
        )
    }

	async signup(ctx) {
        try {
            await ctx.deleteMessage()
        } catch (error) {
        }
    
        const buttons = Array(
            [
                {
                    text: "👨‍🎓 Student 🧑‍🎓",
                    web_app: {
                        url: process.env.BASE_WEB_APP + "/stud/signup",
                    }
                }
            ],
//           [
//                {
//                    text: "💰 I want to donate",
//                    web_app: {
//                        url: process.env.BASE_WEB_APP + "/donate",
//                    }
//                }
//            ],
            [{ text: "« back home", callback_data:"home" }]
        )

        await General.db.getWhiteListedSP(ctx.update.callback_query.from.id, (result) => {
            if (result && result.status){
                
                buttons.splice(1, 0, [
                    {
                        text: "🧑‍⚕️ Service Provider 👨‍⚕️",
                        web_app: {
                            url: process.env.BASE_WEB_APP + "/sp/signup",
                        },
                    }
                ])
                
            }
        })

        await General.db.getWhiteListedAdmin(ctx.update.callback_query.from.id, (result) => {
            if (result && result.status){
                buttons.splice(1, 0, [
                    {
                        text: "🧑‍⚕️👨‍⚕️ Admin 👮‍♂️👮‍♀️",
                        web_app: {
                            url: process.env.BASE_WEB_APP + "/admin/signup",
                        },
                    }
                ])
            }
        })
        
        ctx.sendMessage(
            General.signupTxt, {
                parse_mode: "HTML",
                reply_markup : { 
                    inline_keyboard : buttons
                }
            }	
        )
    }

	async aboutUs(ctx) {
        try {
            await ctx.deleteMessage();
        } catch (error) {
        }
    
        ctx.sendMessage(General.aboutUsTxt, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "« back",
                            callback_data: "home",
                        },
                    ],
                ],
            },
        })
    }
}

module.exports = { General }
