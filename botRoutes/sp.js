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

const SpMenu = function(){
    
}

SpMenu.prototype.checkAppointments = async function (ctx) {
    const myTelegramId = ctx.from.id
    try {
        const me = await ServiceProvider.findOne({telegram_id: myTelegramId})
            .catch(err => {
                throw new Error(err.message)
            })

        const myAppointments = await Appointment.find({service_provider_id: me.provider_id})

        if(myAppointments.length == 0){
            ctx.deleteMessage()
            return ctx.reply("<b>No Appointments. </b>", {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Main Menu",
                                callback_data: "sp-menu"
                            }
                        ]
                    ]
                }
            })
        }

        myAppointments.forEach(async appointment => {
            const student = await Student.findOne({stud_id: appointment.student_id})
            const appointmentLetter = `<b>Appointment. </b> \n\nStatus: <b>${appointment.status}</b>\n\nName: ${student.f_name}\nPhone Number: ${student.phone_no}\nTime and Date: <b>${appointment.time} </b>\n\n\n${appointment.remark}\n`
            bot.telegram.sendMessage(myTelegramId, appointmentLetter, {
                parse_mode: "HTML"
            })
        })
        
        //await Promise.all()
        
        ctx.reply("<b>Get Back to Main Menu. </b>", {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Main Menu",
                            callback_data: "sp-menu"
                        }
                    ]
                ]
            }
        })

    } catch (error) {
        
    }
}

SpMenu.prototype.checkNewRequests = async function (ctx) {
    
    try {
        const me = await ServiceProvider.findOne({telegram_id: ctx.from.id})
            .catch(err => {
                throw new Error(err.message)
            })
        let myTeam = me.sp_team 
        myTeam += "_health"
        const myRequests = await Request.find({health_team: myTeam, is_accepted: false})
            .catch(err => {
                throw new Error(err.message)
            }) 
            console.log(me.sp_team);
        if(myRequests.length == 0){
            ctx.deleteMessage()
            return ctx.reply("<b>No New Requests. </b>", {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Main Menu",
                                callback_data: "sp-menu"
                            }
                        ]
                    ]
                }
            })
        }
        myRequests.forEach(request => {
            const requestView = `<u><b>Request</b></u> \n${request.diagnosis.code1 == true? `<b>Suicidal Ideation: </b>true`: ""}\n${request.diagnosis.code2 == true? `<b>Homicidal Ideation: </b>true`: ""}\n${request.diagnosis.code3 == true? `<b>Depressive Feelings: </b>true`: ""}\n${request.diagnosis.code4 == true? `<b>Low Mood: </b>true`: ""}\n${request.diagnosis.code5 == true? `<b>Alcohol Withdrawal: </b>true`: ""}\n${request.diagnosis.code6 == true? `<b>Insomnia: </b>true`: ""}\n\n <b>Made at</b>: ${request.issued_at.toLocaleString()}`
            bot.telegram.sendMessage(ctx.from.id, requestView, makeRequestAcceptOptions(request._id))
        })

        ctx.reply("<b>Get Back to Main Menu. </b>", {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Main Menu",
                            callback_data: "sp-menu"
                        }
                    ]
                ]
            }
        })
        
    } catch (error) {
        ctx.reply(error.message)
    }
}

SpMenu.prototype.accpetRequest = async function (setting, remark, requestId, ctx) {
    const myTelegramId = ctx.from.id

    try {
        const me = await ServiceProvider.findOne({telegram_id: myTelegramId})
            .catch(err =>{
                throw new Error(err.message)
            })
        
        const request = await Request.findById(requestId)
            .catch(err =>{
                throw new Error(err.message)
            })
        
        const student = await Student.findOne({telegram_id: request.telegram_id})
            .catch(err =>{
                throw new Error(err.message)
            })

        const appointmentObj  = {
            student_id: student.stud_id,
            request_id: requestId,
            service_provider_id: me.provider_id,
            time: setting,
            remark
        }

        await Request.findByIdAndUpdate(requestId, {$set: {is_accepted: true}})

        const appointment = await Appointment.create(appointmentObj)
            .catch(err => {
                throw new Error(err.message)
            })

        const telegramIDs = [myTelegramId, student.telegram_id]

        telegramIDs.forEach(id => {
            const appointmentLetter = `<b>Appointment Checked!</b> \n\nName: ${student.f_name}\nPhone Number: ${student.phone_no}\nTime and Date: <b>${setting} </b>\n\n\n${remark}`
            bot.telegram.sendMessage(id, appointmentLetter, {
                parse_mode: "HTML"
            })
        })

        ctx.reply("<b>Get Back to Main Menu. </b>", {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Main Menu",
                            callback_data: "sp-menu"
                        }
                    ]
                ]
            }
        })

    } catch (error) {
        
    }

}

const makeRequestAcceptOptions = function (request_id){
    return {
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "Accept",
                        callback_data: `acceptRequest_${request_id}`
                    }
                ]
                //     {
                //         text: "Reject",
                //         callback_data: `acceptRequest_${request_id}`
                //     }
                // ],
                // [
                //     {

                //     },
                //     {

                //     }
                // ]
            ]
        }
    }
}


const spMenu = new SpMenu()

module.exports = { spMenu }