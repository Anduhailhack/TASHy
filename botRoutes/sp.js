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
            ctx.answerCbQuery()
            if(!me)
                throw new Error("You have not signed up incorrectly. Please signup /start")
                
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
        ctx.answerCbQuery()

        myAppointments.forEach(async appointment => {
            const appKeyboard = []
            if(appointment.status == "pending"){
                appKeyboard.push([
                    {
                        text: "conclude",
                        callback_data: `conclude_${appointment._id}`
                    }
                ])
            } else if (appointment.status == "concluded"){
                appKeyboard.push([
                    {
                        text: "🏁concluded",
                        callback_data: `concludedApp_${appointment._id}`
                    }
                ])
            }
            const student = await Student.findOne({stud_id: appointment.student_id})
            const appointmentLetter = `<b>Appointment. </b> \n\nStatus: <b>${appointment.status}</b>\n\nName: ${student.f_name}\nPhone Number: ${student.phone_no}\nTime and Date: <b>${appointment.time} </b>\n\n\n${appointment.remark}\n`
            bot.telegram.sendMessage(myTelegramId, appointmentLetter, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: appKeyboard
                }
            })
        })
        
        //await Promise.all()
        setTimeout(()=> {
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

        }, 5000)

    } catch (error) {
        ctx.reply(error.message)

    }
}

SpMenu.prototype.checkNewRequests = async function (ctx) {
    try {
        const me = await ServiceProvider.findOne({telegram_id: ctx.from.id})
        .catch(err => {
            throw new Error(err.message)
        })
            ctx.answerCbQuery()
            if(!me)
                throw new Error("You have not signed up incorrectly. Please signup /start")
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
        ctx.answerCbQuery()

        await myRequests.forEach(async request => {
            try {
                const user = await Student.findOne({telegram_id: request.telegram_id})
                if(!user)
                    return bot.telegram.sendMessage(ctx.from.id,"User Not Found")   

                const requestView = `<u><b>Request</b></u> ${request.diagnosis.remark? `\n<b>${request.diagnosis.remark}</b>\n` : ""}${request.diagnosis.code1 == true? `\n<b>Suicidal Ideation: </b>true`: ""}${request.diagnosis.code2 == true? `\n<b>Homicidal Ideation: </b>true`: ""}${request.diagnosis.code3 == true? `\n<b>Depressive Feelings: </b>true`: ""}${request.diagnosis.code4 == true? `\n<b>Low Mood: </b>true`: ""}${request.diagnosis.code5 == true? `\n<b>Alcohol Withdrawal: </b>true`: ""}${request.diagnosis.code6 == true? `\n<b>Insomnia: </b>true`: ""}\n\n request made by <b>${user.f_name +" "+ user.m_name} \nIssued At</b>: ${request.issued_at.toLocaleString()}`
                bot.telegram.sendMessage(ctx.from.id, requestView, {
                    parse_mode: "HTML",
                    reply_markup : {
                        inline_keyboard: await makeRequestAcceptOptions(me, request._id)
                    }
                })
                
            } catch (error) {
                console.log(error);
                throw error
            }
        })

        const chatId = ctx.from.id
        setTimeout(() => {
            bot.telegram.sendMessage(chatId, `${myRequests.length} unresponded Requests<b> \nGet Back to Main Menu. </b>`, {
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
        }, 5000)
        
    } catch (error) {
        ctx.reply(error.message)
    }
}

SpMenu.prototype.accpetRequest = async function (setting, remark, requestId, messageId, ctx) {
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
    console.log(appointmentObj);


        await Request.findByIdAndUpdate(requestId, {$set: {is_accepted: true}})

        const appointment = await Appointment.create(appointmentObj)
            .catch(err => {
                console.log(err);
                let error = new Error ("Appointment already existed")
                if(err.code == 11000)
                    error.statusCode = 11000
                

                throw error
            })

        const telegramIDs = [myTelegramId, student.telegram_id]

        telegramIDs.forEach(id => {
            const appointmentLetter = `<b>Appointment Checked!</b> \n\nName: ${student.f_name}\nPhone Number: ${student.phone_no}\nTime and Date: <b>${setting} </b>\n\n\n${remark}\n\n Go /home and <i>check Requests</i> for more information about your <b>doctor</b>`
            bot.telegram.sendMessage(id, appointmentLetter, {
                parse_mode: "HTML"
            })
        })

        ctx.deleteMessage(messageId)

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
        console.log(error);
        if(error.statusCode == 11000){
            ctx.reply("<b>Appointment has already been set. </b>", {
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
        } else {
            ctx.reply(error.message)
        }
    }

}

SpMenu.prototype.forwardRequest = async function (requestId, serviceProviderId, messageId, ctx) {
    try {
        const request = await Request.findById(requestId)
        const appointedSP = await ServiceProvider.findById(serviceProviderId)
        const student = await Student.findOne({telegram_id: request.telegram_id})
        
        if(request.is_accepted){
            return ctx.reply("The appointment has already been accepted ")
        }

        let reqText = `<u><b>Forwarded New Request</b></u>${request.diagnosis.remark? `\n<b>${request.diagnosis.remark}</b>\n` : ""} ${request.diagnosis.code1 == 'true'? `\n<b>Suicidal Ideation: </b>true`: ""}${request.diagnosis.code2 == 'true'? `\n<b>Homicidal Ideation: </b>true`: ""}${request.diagnosis.code3 == 'true'? `\n<b>Depressive Feelings: </b>true`: ""}${request.diagnosis.code4 == 'true'? `\n<b>Low Mood: </b>true`: ""}${request.diagnosis.code5 == 'true'? `\n<b>Alcohol Withdrawal: </b>true`: ""}${request.diagnosis.code6 == 'true'? `\n<b>Insomnia: </b>true`: ""} \n\n\nStudent's Name: <tg-spoiler><b>${student.f_name}</b></tg-spoiler>\nPhone Number: <tg-spoiler><b>${student.phone_no}</b></tg-spoiler>`

        bot.telegram.sendMessage(appointedSP.telegram_id, reqText, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Accept",
                            callback_data: `acceptRequest_${request._id}`
                        }
                    ]
                ]
            }
        })


        let spFname = appointedSP.f_name.replace(/^\w/, (c) => c.toUpperCase());
        ctx.reply(`The Request is forwarded to Dr.${spFname}`)

        setTimeout(() => {
            ctx.deleteMessage(messageId)
        }, 5000)
    } catch (error) {
        console.log(error);
    }
    
} 

SpMenu.prototype.concludeAppointment = async function (appointmentId, messageId,ctx) {
    try {
        const app = await Appointment.findByIdAndUpdate(appointmentId, {$set: {status: "concluded"}})
        
        ctx.deleteMessage(messageId)

        ctx.reply("Appointment concluded! Please go /home for other menus")
    } catch (error) {
        ctx.reply(error.message)
        ctx.reply("Please go /home")
    }
}

const makeRequestAcceptOptions = async function (sp, requestId){
    let fellowKeyboards = [
        [    
            {
                text: "Accept",
                callback_data: `acceptRequest_${requestId}`
            },
            {
                text: "Discard",
                callback_data: `discardRequest_${requestId}`
            }
        ]
    ]

    await db.getFellowServiceProviders(sp.sp_team)
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
        .catch((err) => {})

    //console.log(fellowKeyboards);


    return fellowKeyboards
}


const spMenu = new SpMenu()

module.exports = { spMenu }
