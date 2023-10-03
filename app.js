const express = require("express")
const path = require("path")
const { Telegraf, Telegram } = require("telegraf")
const { MongoDb } = require("./database/Mongo")

const { ServiceProvider } = require("./menu/sp")
const { Admin } = require("./menu/admin")
const { Student } = require("./menu/student")
const { General } = require("./menu/general")

const {studMenu} = require('./botRoutes/stud')
const {spMenu} = require('./botRoutes/sp')

const studentRoute = require("./routes/student")
const adminRoute = require("./routes/admin")
const spRoute = require("./routes/sp");
const { Session } = require("./database/SchemaModels")

require("dotenv").config()

const db = new MongoDb()
const botToken = process.env.BOT_TOKEN || ""
const bot = new Telegraf(botToken)

const app = express()

app.use(express.json())
app.use(express.static(path.join(__dirname, "./public")))
app.set("view engine", "ejs")

app.use("/sp", (req, res, next) => {res.locals.db = db; res.locals.bot = bot; next()}, spRoute)
app.use("/admin", (req, res, next) => {res.locals.db = db; res.locals.bot = bot; next()}, adminRoute)
app.use("/stud", (req, res, next) => {res.locals.db = db; res.locals.bot = bot; next()}, studentRoute)

app.listen(process.env.PORT || 3000, "localhost", () => {
	console.log(`Server listening on port ${process.env.PORT || 3000}.`)
})

const general = new General(db)
const serviceProvider = new ServiceProvider(bot)
const admin = new Admin(bot)
const student = new Student(bot)

bot.start(general.home)

bot.command('home', (ctx, next) => db.isValidSession(ctx, next), async ctx => {
	const key = `${ctx.from.id}:${ctx.from.id}`

	const userSession = await Session.findOne({key})

	if(userSession.data.role == process.env.USER_ROLE)
		return student.home(ctx.from.id, "")
	else if(userSession.data.role == process.env.SP_ROLE)
		return serviceProvider.home(ctx.from.id, "")

})

bot.action("home", general.home)
bot.action("login", general.login)
bot.action("signup", general.signup)
bot.action("about_us", general.aboutUs)
bot.action("logout", general.logout)
//Student
bot.action("my-requests", (ctx, next) => db.isValidSession(ctx, next),(ctx) => studMenu.getRequestsStatus(ctx))
bot.action("my-appointments", (ctx, next) => db.isValidSession(ctx, next), (ctx) => studMenu.getAppointmentStatus(ctx))

//Service Provider
bot.action("sp-menu", (ctx, next) => db.isValidSession(ctx, next),  (ctx, next) => {ctx.deleteMessage(); next()}, ctx => serviceProvider.home(ctx.from.id, ""))
bot.action("check-requests", (ctx, next) => db.isValidSession(ctx, next), (ctx) => spMenu.checkNewRequests(ctx))
bot.action("check-my-appointments", (ctx, next) => db.isValidSession(ctx, next), (ctx) => spMenu.checkAppointments(ctx))

bot.action(/acceptRequest_(.+)/, (ctx, next) => db.isValidSession(ctx, next), ctx => {
	let setting, remark
	const requestId = ctx.match[1]
	let messageId = ctx.update.callback_query.message.message_id
	ctx.answerCbQuery()

	ctx.reply("Give me the time and date of your Appointment.{Date, Place} <i>Make your response in one text message</i>\n\nText me <i><b>cancel</b></i> to cancel setup.", {
		parse_mode: "HTML"
	})
	let prompt = "init"
	bot.on("message", async (ctx) => {
		if(prompt == "init"){
			setting = await ctx.message.text
			if(/^\s*c\s*a\s*n\s*c\s*e\s*l\s*$/i.test(setting)) return ctx.reply("Appointment setup canceled. Press /home to get to homepage")
				else prompt = "accepted"


			ctx.reply("Please, add some additional information that you think is necessary. \n\n<b>Make all in one Text</b>\nI will be sending it to the student.\n\nText me <i><b>cancel</b></i> to cancel setup.", {
				parse_mode: "HTML"
			})
		}
		else if(prompt == "accepted"){
			remark = ctx.message.text

			if(/^\s*c\s*a\s*n\s*c\s*e\s*l\s*$/i.test(remark)) return ctx.reply("Appointment setup canceled. Press /home to get to homepage")
	   			else prompt = "init"	

			await spMenu.accpetRequest(setting, remark, requestId, messageId, ctx)
		} 
		
		
	})
})

bot.action(/FRT_(.+)_(.+)/, (ctx, next) => db.isValidSession(ctx, next), ctx => {
	// FRT: ForwardRequestTo;
	const requestId = ctx.match[1]
	const spId = ctx.match[2]
	ctx => ctx.answerCbQuery()
	let messageId = ctx.update.callback_query.message.message_id

	spMenu.forwardRequest(requestId, spId, messageId, ctx)
	//Forward Request 
})

bot.action(/conclude_(.+)/, (ctx, next) => db.isValidSession(ctx, next), ctx => {
	const appId = ctx.match[1]
	ctx => ctx.answerCbQuery()

	let messageId = ctx.update.callback_query.message.message_id

	spMenu.concludeAppointment(appId, messageId,ctx)
})

bot.action(/DR_(.+)_(.+)/, (ctx, next) => db.isValidSession(ctx, next), ctx => {
	//Discard Request
	const requestId = ctx.match[1]
	const spId = ctx.match[2]
	console.log(spId);

	spMenu.discardRequest(requestId, spId, ctx)
})
// bot.action("sp_logout", serviceProvider.logout)
// bot.action("y_sp_logout", serviceProvider.yesLogout)
// bot.action("n_sp_logout", serviceProvider.noLogout)
// bot.action("reject_stud_request", serviceProvider.rejectStudRequest)
// bot.action("y_reject_stud_request", serviceProvider.yesRejectStudRequest)
// bot.action("n_reject_stud_request", serviceProvider.noRejectStudRequest)



bot.catch((err, ctx) => {
	console.error("Error occured in bot : ", err)
})

bot.launch()