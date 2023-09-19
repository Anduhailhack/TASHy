const express = require("express")
const path = require("path")
const { Telegraf } = require("telegraf")
const { MongoDb } = require("./database/Mongo")

const { ServiceProvider } = require("./menu/sp")
const { Admin } = require("./menu/admin")
const { Student } = require("./menu/student")
const { General } = require("./menu/general")

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

bot.start(general.home)
bot.action("home", general.home)
bot.action("login", general.login)
bot.action("signup", general.signup)
bot.action("about_us", general.aboutUs)

const serviceProvider = new ServiceProvider()

// bot.action("sp_logout", serviceProvider.logout)
// bot.action("y_sp_logout", serviceProvider.yesLogout)
// bot.action("n_sp_logout", serviceProvider.noLogout)
// bot.action("reject_stud_request", serviceProvider.rejectStudRequest)
// bot.action("y_reject_stud_request", serviceProvider.yesRejectStudRequest)
// bot.action("n_reject_stud_request", serviceProvider.noRejectStudRequest)


const admin = new Admin()
const student = new Student()

bot.catch((err, ctx) => {
	console.error("Error occured in bot : ", err)
})

bot.launch()