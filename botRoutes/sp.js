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
        bot.telegram.sendMessage(process.env.DEBUG_CHANNEL, error.message)
    }
}

SpMenu.prototype.checkNewRequests = async function (ctx) {
    try {
        const me = await ServiceProvider.findOne({telegram_id: ctx.from.id})
        .catch(err => {
        bot.telegram.sendMessage(process.env.DEBUG_CHANNEL, err.message)
        throw new Error(err.message)
        })
            ctx.answerCbQuery()
            if(!me)
                throw new Error("You have not signed up incorrectly. Please signup /start")
            let myTeam = me.sp_team 

            myTeam += "_health"
            let searchQuery
            if(me.isSenior){
                searchQuery = {health_team: myTeam, is_accepted: false, is_discarded: false}
            } else {
                searchQuery = {health_team: myTeam, is_accepted: false,  is_discarded: false, is_forwarded_to: {$elemMatch: {$eq: me._id}}}
            }
            const myRequests = await Request.find(searchQuery)
            .catch(err => {
                bot.telegram.sendMessage(process.env.DEBUG_CHANNEL, err.message)
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
                bot.telegram.sendMessage(process.env.DEBUG_CHANNEL, error.message)
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
        bot.telegram.sendMessage(process.env.DEBUG_CHANNEL, error.message)
        ctx.reply(error.message)
    }
}

SpMenu.prototype.accpetRequest = async function (setting, remark, requestId, messageId, ctx) {
    const myTelegramId = ctx.from.id

    try {
        const me = await ServiceProvider.findOne({telegram_id: myTelegramId})
            .catch(err =>{
                bot.telegram.sendMessage(process.env.DEBUG_CHANNEL, err.message)
                throw new Error(err.message)
            })
        
        const request = await Request.findById(requestId)
            .catch(err =>{
                bot.telegram.sendMessage(process.env.DEBUG_CHANNEL, err.message)
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
                console.log(err);
                let error = new Error ("Appointment already existed")
                if(err.code == 11000)
                    error.statusCode = 11000
                bot.telegram.sendMessage(process.env.DEBUG_CHANNEL, err.message)
                
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
        bot.telegram.sendMessage(process.env.DEBUG_CHANNEL, error.message)
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
        const appointedSP = await ServiceProvider.findById(serviceProviderId)
        const forwarededReq = await Request.findOne({_id: requestId, is_forwarded_to: {$elemMatch: {$eq: serviceProviderId}}})
        
        console.log(forwarededReq);
        if(forwarededReq){
            ctx.answerCbQuery()
            return ctx.sendMessage(`The request is already forwarded to Dr ${appointedSP.f_name}. Get /home`)
        }

        const request = await Request.findByIdAndUpdate(requestId, {$push: {"is_forwarded_to": appointedSP._id}}, {new: 'true'})
        const student = await Student.findOne({telegram_id: request.telegram_id})
        
        if(request.is_accepted){
            return ctx.reply("The appointment has already been accepted. Get /home ")
        }
        ctx.answerCbQuery()
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
        }).catch(err => {
            ctx.reply(err.message)
            bot.telegram.sendMessage(process.env.DEBUG_CHANNEL, err.message)
            
        })

        let spFname = appointedSP.f_name.replace(/^\w/, (c) => c.toUpperCase());
        ctx.reply(`The Request is forwarded to Dr.${spFname}`)

        setTimeout(() => {
            ctx.deleteMessage(messageId)
        }, 5000)
    } catch (error) {
        bot.telegram.sendMessage(process.env.DEBUG_CHANNEL, error.message)
        ctx.reply(error.message)
    }
    
} 

SpMenu.prototype.concludeAppointment = async function (appointmentId, messageId,ctx) {
    try {
        const app = await Appointment.findByIdAndUpdate(appointmentId, {$set: {status: "concluded"}})
        
        ctx.deleteMessage(messageId)

        ctx.reply("Appointment concluded! Please go /home for other menus")
    } catch (error) {
        bot.telegram.sendMessage(process.env.DEBUG_CHANNEL, error.message)
        ctx.reply(error.message)
        ctx.reply("Please go /home")
    }
}

SpMenu.prototype.discardRequest = async function (requestId, spId, ctx) {
    try {
        
        const request = await Request.findById(requestId)
        const sp = await ServiceProvider.findById(spId)
        const student = await Student.findOne({telegram_id: request.telegram_id})

        const seniors = await ServiceProvider.find({sp_team: sp.sp_team, _id: {$ne: sp._id}})
        ctx.answerCbQuery()
        console.log(seniors);
        
        if(sp.isSenior){
            await Request.findByIdAndUpdate(requestId, {$set: {is_discarded: true}})
            bot.telegram.sendMessage(student.telegram_id, `A request you made at ${request.issued_at.toLocaleString()} ${request.diagnosis.remark? `with a remark <b>${request.diagnosis.remark}</b> ` : ""} was declined. Please make another request.`)
            ctx.deleteMessage()
        } else {
            const updatedReq = await Request.findByIdAndUpdate(requestId, {$pull: {is_forwarded_to: requestId}})

            seniors.forEach(senior => {
                console.log(senior);
                const declineLetter = `Dr. ${sp.f_name} has declined a the forwarded request ${request.diagnosis.remark? `with a remark <b>${request.diagnosis.remark}</b> ` : ""}made by Student <tg-spoiler>${student.f_name}</tg-spoiler>.\n\nPlease check the request at /home`
                bot.telegram.sendMessage(senior.telegram_id, declineLetter, {parse_mode: "HTML"})
            })
            ctx.sendMessage(`Request Discarded. Get /home`)
            ctx.deleteMessage()
        }
    } catch (error) {
        bot.telegram.sendMessage(process.env.DEBUG_CHANNEL, error.message)
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
                callback_data: `DR_${requestId}_${sp._id}`
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
        .catch((err) => {
            bot.telegram.sendMessage(process.env.DEBUG_CHANNEL, err.message)
        })
    return fellowKeyboards
}


const spMenu = new SpMenu()

module.exports = { spMenu }
