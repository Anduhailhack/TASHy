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
    ctx.answerCbQuery()
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
                        callback_data : "logout"
                    },
                ],
            ]
        }
    }
    //let requests, appointments

    try {
        // console.log(telegram_id);
        const requests = await Request.find({telegram_id})
            .catch(err => {
                throw new Error(err.messge)
            })
        
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

            setTimeout(() => {
                ctx.sendMessage("These are your requests. Please <b>My Appointmenst</b> to see their status", studentInlineButtonOption) 
            }, 5000)
        }
    } catch (error) {
        ctx.sendMessage(error.message)
    }
}

StudMenu.prototype.getAppointmentStatus = async function (ctx) {
    ctx.answerCbQuery()

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
                    callback_data : "logout"
                },
            ],
        ]
        }
    }
    //let requests, appointments

    try {

        const student = await Student.findOne({telegram_id})
        // console.log(student);

        if(!student)
            throw new Error ("No Student registed. Please /start and sign up again")

        const student_id = student.stud_id

        const appointments = await Appointment.find({student_id})
            .catch(err => {
                throw new Error(err.messge)
            })
            // console.log(appointments);
        
        if(appointments.length == 0){
            ctx.sendMessage("All your requests are not yet appointed by any Doctor \n<b>Please Wait till the doctor responds. We will notify you</b>", studentInlineButtonOption)
        }
        else {
            appointments.forEach(async app => {
                const req = await Request.findById(app.request_id)
                    .catch(err => {
                        throw new Error("Appointment not Found")
                    })
                const sp = await ServiceProvider.findOne({provider_id: app.service_provider_id})
                let appMessage =  `Your appointment to the <b>${req.health_team}</b> team has been accepted on ${req.issued_at.toLocaleString().slice(',')[0]}. \nThe date and time of your appointment with your doctor will be <b><i> ${app.time}</i></b> ${app.remark !== ''? `with a remark <b>${app.remark}</b>` : ""}.\n\nDoctor: <tg-spoiler>${sp.f_name}</tg-spoiler>\nContact Numeber: <tg-spoiler>${sp.phone_no}</tg-spoiler>`
                ctx.sendMessage(appMessage, {
                    parse_mode: "HTML"
                })
            })
            setTimeout(() => {
                ctx.sendMessage("These are your Appointments. Please <b>My Appointmenst</b> to see their status", studentInlineButtonOption)
            }, 5000)
        }
    } catch (error) {
        ctx.sendMessage(error.message)
    }
}

StudMenu.prototype.sendServiceProviders = async function (userId, sp_team, diagnosis, student, requestId) {
    try {
        const sps = await ServiceProvider.find({sp_team, isSenior: true})
        // console.log(sp_team);
        
        sps.forEach(async sp => {
            let fellowKeyboards = [
                [    
                    {
                        text: "Accept",
                        callback_data: `acceptRequest_${requestId}_${sp._id}`
                    },
                    {
                        text: "Discard",
                        callback_data: `discardRequest_${requestId}`
                    }
                ]
            ]
            await db.getFellowServiceProviders(sp_team)
                .then(fellows => {
                    // console.log(fellows);
                    fellows.forEach(fellow => {
                        fellowKeyboards.push(
                            [
                                {
                                    text: `Forward to Dr. ${fellow.f_name}`,
                                    callback_data: `FRT_${requestId}_${fellow._id}`
                                }
                            ]
                        )

                    })
                })

            
                
            let reqText = `<u><b>UpComing New Request</b></u> ${diagnosis.remark? `\n<b>${diagnosis.remark}</b>\n` : ""}${diagnosis.code1 == 'true'? `\n<b>Suicidal Ideation: </b>true`: ""}${diagnosis.code2 == 'true'? `\n<b>Homicidal Ideation: </b>true`: ""}${diagnosis.code3 == 'true'? `\n<b>Depressive Feelings: </b>true`: ""}${diagnosis.code4 == 'true'? `\n<b>Low Mood: </b>true`: ""}${diagnosis.code5 == 'true'? `\n<b>Alcohol Withdrawal: </b>true`: ""}${diagnosis.code6 == 'true'? `\n<b>Insomnia: </b>true`: ""} \n\n\nName: <b>${student.f_name}</b>\nPhone Number: <b>${student.phone_no}</b>`
            
            bot.telegram.sendMessage(sp.telegram_id, reqText, {
                parse_mode: "HTML",
                reply_markup : {
                    inline_keyboard: fellowKeyboards
                }
            })
        })

        // console.log("Done");
    } catch (error) {
        // console.log(error);
        bot.telegram.sendMessage(userId, `${sp_team} Doctor will review your Request`)
    }
}

const studMenu = new StudMenu()

module.exports = { studMenu }



