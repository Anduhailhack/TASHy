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

(!process.env.NODE_ENV ||
process.env.NODE_ENV !== "production") && 
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
bot.action("home", general.home)
bot.action("login", general.login)
bot.action("signup", general.signup)
bot.action("about_us", general.aboutUs)

bot.action("sp-menu", ctx => serviceProvider.home(ctx.from.id, ""))
bot.action("my-requests", (ctx) => studMenu.getRequestsStatus(ctx))
bot.action("my-appointments", (ctx) => studMenu.getAppointmentStatus(ctx))

bot.action("check-requests", (ctx) => spMenu.checkNewRequests(ctx))
bot.action("check-my-appointments", (ctx) => spMenu.checkAppointments(ctx))

bot.action(/acceptRequest_(.+)/, ctx => {
	let setting, remark
	const requestId = ctx.match[1]
	ctx.reply("Give me the time and date of your Appointment.{Date, Place} <i>Make your response in one text message</i>", {
		parse_mode: "HTML"
	})
	bot.on("message", (ctx) => {
		if(!setting){
			setting = ctx.message.text
			ctx.reply("Please, add some additional information that you think is necessary. \n\n<b>Make all in one Text</b>I will be sending it to the student.", {
				parse_mode: "HTML"
			})

		}
		else if(!remark){
			remark = ctx.message.text
			console.log(remark);

			spMenu.accpetRequest(setting, remark, requestId, ctx)
		}
		
	})
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