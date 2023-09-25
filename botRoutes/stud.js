const { MongoDb } = require('./../database/Mongo')
const {Telegraf} = require('telegraf')
require('dotenv').config()

const bot = new Telegraf(process.env.BOT_TOKEN)

const db = new MongoDb()

const { 
	ServiceProvider, 
	Student, 
	Request, 
	Session, 
	Appointment, 
 } = require("./../database/SchemaModels");

const StudMenu = function(){


}

StudMenu.prototype.getRequestsStatus = async function (ctx) {
    const telegram_id = ctx.from.id
    const studentInlineButtonOption =  {
        parse_mode: "HTML",
        reply_markup : {
            inline_keyboard :[
                [
                    {
                        text: "🤕 Send requests",
                        web_app : {
                            url : process.env.BASE_WEB_APP + "/stud/send-request",
                        }
                    },
                ],
                [
                    {
                        text: "📆 My appointments",
                        callback_data: "my-appointments"
                    },
                ],
                [
                    {
                        text: " My requests",
                        callback_data: "my-requests"
                    },
                ],
                [
                    {
                        text: "👋 Logout",
                        callback_data : "sp_logout"
                    },
                ],
            ]
        }
    }
    //let requests, appointments

    try {
        console.log(telegram_id);
        const requests = await Request.find({telegram_id})
            .catch(err => {
                throw new Error(err.messge)
            })
            console.log(requests);
        
        if(requests.length == 0){
            ctx.sendMessage("You have not requested any diagnosis request till now. \n<b>Please Send a request</b>", studentInlineButtonOption)
        }
        else {
            requests.forEach(req => {
                let reqMessage =  `You have requested one request to the <b>${req.health_team}</b> team on <b>${req.issued_at.toLocaleString()}</b> ${req.diagnosis.remark !== ''? `with a remark <b>${req.diagnosis.remark}</b>` : ""}.\n`
                ctx.sendMessage(reqMessage, {
                    parse_mode: "HTML"
                })
            })
            ctx.sendMessage("These are your requests. Please <b>My Appointmenst</b> to see their status", studentInlineButtonOption)
        }
    } catch (error) {
        ctx.sendMessage(error.message)
    }
}

StudMenu.prototype.getAppointmentStatus = async function (ctx) {
    const telegram_id = ctx.from.id
    const studentInlineButtonOption =  {parse_mode: "HTML",
    reply_markup : {
        inline_keyboard :[
            [
                {
                    text: "🤕 Send requests",
                    web_app : {
                        url : process.env.BASE_WEB_APP + "/stud/send-request",
                    }
                },
            ],
            [
                {
                    text: "📆 My appointments",
                    callback_data: "my-appointments"
                },
            ],
            [
                {
                    text: " My requests",
                    callback_data: "my-requests"
                },
            ],
            [
                {
                    text: "👋 Logout",
                    callback_data : "sp_logout"
                },
            ],
        ]
        }
    }
    //let requests, appointments

    try {

        const student = await Student.findOne({telegram_id})
        //console.log(student);

        if(!student)
            throw new Error ("No Student registed. Please /start and sign up again")

        const student_id = student.stud_id

        const appointments = await Appointment.find({student_id})
            .catch(err => {
                throw new Error(err.messge)
            })
            console.log(appointments);
        
        if(appointments.length == 0){
            ctx.sendMessage("All your requests are not yet appointed by any Doctor \n<b>Please Wait till the doctor responds. We will notify you</b>", studentInlineButtonOption)
        }
        else {
            appointments.forEach(async app => {
                const req = await Request.findById(app.request_id)
                    .catch(err => {
                        throw new Error("Appointment not Found")
                    })
  
                let appMessage =  `You are appointed to the <b>${req.health_team}</b> team on <b>${req.issued_at.toLocaleString()}</b> ${app.remark !== ''? `with a remark <b>${app.remark}</b>` : ""}.\n`
                ctx.sendMessage(appMessage, {
                    parse_mode: "HTML"
                })
            })
            ctx.sendMessage("These are your Appointments. Please <b>My Appointmenst</b> to see their status", studentInlineButtonOption)
        }
    } catch (error) {
        ctx.sendMessage(error.message)
    }
}

StudMenu.prototype.sendServiceProviders = async function (userId, sp_team, diagnosis, student) {
    try {
        const sps = await ServiceProvider.find({sp_team})
        sps.forEach(sp => {
            console.log(sp);
            let reqText = `<u><b>UpComing New Request</b></u> \n${diagnosis.code1 == 'true'? `<b>Suicidal Ideation: </b>true`: ""}\n${diagnosis.code2 == 'true'? `<b>Homicidal Ideation: </b>true`: ""}\n${diagnosis.code3 == 'true'? `<b>Depressive Feelings: </b>true`: ""}\n${diagnosis.code4 == 'true'? `<b>Low Mood: </b>true`: ""}\n${diagnosis.code5 == 'true'? `<b>Alcohol Withdrawal: </b>true`: ""}\n${diagnosis.code6 == 'true'? `<b>Insomnia: </b>true`: ""} \n\n\nName: <b>${student.f_name}</b>\nPhone Number: <b>${student.phone_no}</b>`
            bot.telegram.sendMessage(sp.telegram_id, reqText, {
                parse_mode: "HTML",
                reply_markup : {
                    inline_keyboard: [
                        [
                            {
                                text: "Main Menu",
                                callback_data: "sp-menu"
                            },
                        ],
                    ]
                }
            })
        })

        console.log("Done");
    } catch (error) {
        console.log(error);
        bot.telegram.sendMessage(userId, `${sp_team} Doctor will review your Request`)
    }
}

const studMenu = new StudMenu()

module.exports = { studMenu }