const mongoose = require("mongoose")
const { 
	Admin, 
	ServiceProvider, 
	Student, 
	Request, 
	Session, 
	Appointment, 
	WhiteList,
	Payment
 } = require("./SchemaModels");

(!process.env.NODE_ENV ||
	process.env.NODE_ENV !== "production") && require("dotenv").config()

const MongoDb = function () {
	mongoose.connect("mongodb://0.0.0.0:27017/SAC_Wellness_System").then(() => {
		console.log("MongoDB Connection Successful")
	})
}

MongoDb.prototype.addSession = async function(key, data, callback){
    const userSession = await Session.findOneAndRemove({ key : key })

    const schema = new Session({
        key,
        data
    })
    
    schema.save({
        upsert : true
    }).then(function (retVal){
        const ret = {
            status: true,
            result: {
                msg: "New session added to the db",
                data : retVal
            }
        }
        return callback(ret)
    }).catch(function (errVal){
        const ret = {
            status: false,
            result: {
                msg: "Error while adding the session to the database",
                error : errVal
            }
        }
        return callback(ret)
    })
}

MongoDb.prototype.removeSesseion = async function (key, callback){
    const userSession = await Session.findOneAndRemove({ key : key })

    if (userSession) {
        const ret = {
            status: true,
            result: {
                msg: `Session of user ${key} has been removed.`,
                data : userSession
            }
        }
        return callback(ret)
    }else {
        const ret = {
            status: false,
            result: {
                msg: "Session already removed.",
                data : userSession
            }
        }
        return callback(ret)
    }
}

MongoDb.prototype.getSession = async function (key, callback)  {

    const userSession = await Session.findOne({ key : key })

    if (userSession) {
        const ret = {
            status: true,
            result: {
                msg: "Successfuly retured the session of the user",
                data : userSession
            }
        }
        return callback(ret)
    }else {
        const ret = {
            status : false,
            result: {
                msg: "Can not get session from the db",
                data : userSession
            }
        }
        return callback(ret)
    }
}

MongoDb.prototype.addAdmin = async function (
	provider_id, f_name, l_name, email, phone_no, 
	telegram_id, educational_bkg, sp_team, speciality,
	office_location, available_at, callback
) {
	await Admin.create({
		provider_id, f_name, l_name, email, phone_no, 
		telegram_id, educational_bkg, sp_team, speciality,
		office_location, available_at
	})
		.then((data) => {
			const ret = { status: true, data : data }
			callback(ret)
		})
		.catch((err) => {
			const ret = {status: false, msg: "Error while Inserting to Database", err: err}
			callback(ret)
		})
}

MongoDb.prototype.addStudent = async function (
	stud_id,
	f_name,
	m_name,
	l_name,
	email,
	phone_no,
	telegram_id,
	ed_info,
	diagnosis,
	callback
) {
	await Student.create({
		stud_id,
		f_name,
		m_name,
		l_name,
		email,
		phone_no,
		telegram_id,
		ed_info,
		diagnosis,
	})
	.then((data) => {
			const ret = { status: true, result : {data : data}}
			callback(ret)
		})
		.catch((err) => {
			const ret = {status: false, msg: "Error while Inserting to Database", err : err}
			callback(ret)
		})
}

MongoDb.prototype.addServiceProvider = async function (
	provider_id, f_name, m_name, l_name, email, phone_no, 
	telegram_id, educational_bkg, sp_team, speciality,
	office_location, available_at, callback
) {
	await ServiceProvider.create({
		provider_id, f_name, m_name, l_name, email, phone_no, 
		telegram_id, educational_bkg, sp_team, speciality,
		office_location, available_at
	})
		.then((data) => {
			const ret = { status: true, data : data }
			callback(ret)
		})
		.catch((err) => {
			const ret = {status: false, msg: "Error while Inserting to Database", err: err}
			callback(ret)
		})
}

MongoDb.prototype.getServiceProviderById = async function (telegram_id, callback){
	const serviceProvider = await ServiceProvider.findOne({ telegram_id })

    if (serviceProvider) {
		
        const ret = {
            status: true,
            result: {
                msg: "Successfuly retured the service provider.",
                data : serviceProvider
            }
        }
        return callback(ret)
    }else {
        const ret = {
            status : false,
            result: {
                msg: "Can not get service provider from the db",
                data : serviceProvider
            }
        }
        return callback(ret)
    }
}

MongoDb.prototype.getWhiteListedSP = async function (telegram_id, callback){
	const whiteListed = await WhiteList.findOne({ id : telegram_id })

    if (whiteListed) {
		
        const ret = {
            status: true,
            result: {
                msg: "Successfuly retured the service provider.",
                data : whiteListed
            }
        }
        return callback(ret)
    }else {
        const ret = {
            status : false,
            result: {
                msg: "Can not get service provider from the db",
                data : whiteListed
            }
        }
        return callback(ret)
    }
}

MongoDb.prototype.getWhiteListedAdmin = async function (telegram_id, callback){
	const whiteListed = await WhiteList.findOne({ id : telegram_id, is_admin : true })

    if (whiteListed) {
		
        const ret = {
            status: true,
            result: {
                msg: "Successfuly retured the service provider.",
                data : whiteListed
            }
        }
        return callback(ret)
    }else {
        const ret = {
            status : false,
            result: {
                msg: "Can not get service provider from the db",
                data : whiteListed
            }
        }
        return callback(ret)
    }
}

MongoDb.prototype.addRequest = async function (
	telegram_id,
	health_team,
	provider_id,
	urgency,
	diagnosis,
	callback
) {
	
	await Request.create({
		telegram_id,
		health_team,
		provider_id,
		urgency,
		diagnosis
	})
		.then((data) => {
			const ret = { status: true, data : data }
			callback(ret)
		})
		.catch((err) => {
			const ret = {status: false, msg: "Error while Inserting to Database", err : err }
			callback(ret)
		})
}

MongoDb.prototype.getRequest = async function (id, callback) {
	const request = await Request.findOne({ _id : id })

    if (request) {
        const ret = {
            status: true,
            result: request
        }
        return callback(ret)
    }else {
        const ret = {
            status : false,
            result: request
        }
        return callback(ret)
    }
}

MongoDb.prototype.setAppointment = async function (
	student_id,
	request_id, 
	service_provider_id, 
	time,
	remark,
	callback
) {
	await Appointment.create({
		student_id,
		request_id,  
		service_provider_id, 
		time,
		remark
	})
		.then((data) => {
			console.log(data)
			const ret = { status: true, ...data }
			callback(ret)
		})
		.catch((err) => {
			console.log("ERROrR",err)
			const ret = {status: false, msg: "Error while Inserting to Database", ...err}
			callback(ret)
		})
}

MongoDb.prototype.getServiceProviderTeam = async function (sp_team, callback) {
	try {
		await ServiceProvider.find({ sp_team }).then(result => {
			const ret = { status: true, result : result }
			callback(ret)
		}).catch(err => {
			const ret = { status: false, msg: err }
			callback(ret)
		})
	} catch (err) {
		const ret = { status: false, msg: err.message }
		callback(ret)
	}
}

MongoDb.prototype.getStudent = async function (telegram_id, callback) {
	try {
		
		await Student.findOne({ telegram_id }).then(result => {
			const ret = { status: true, result : result }			
			callback(ret)
		}).catch(err => {
			const ret = { status: false, msg: err }
			callback(ret)
		})
	} catch (err) {
		const ret = { status: false, msg: err.message }
		callback(ret)
	}
}

MongoDb.prototype.getAllAdmins = async function (callback) {
	try {
		
		await Admin.find({}).then(result => {
			const ret = { status: true, result : result }			
			callback(ret)
		}).catch(err => {
			const ret = { status: false, msg: err }
			callback(ret)
		})
	} catch (err) {
		const ret = { status: false, msg: err.message }
		callback(ret)
	}
}

MongoDb.prototype.getLoggedInAdmins = async function (callback) {
	try {
		await Session.find({"data.role" : process.env.ADMIN_ROLE})
		.then(result => {
			const ret = { status: true, result : result }			
			callback(ret)
		}).catch(err => {
			const ret = { status: false, msg: err }
			callback(ret)
		})
	} catch (err) {
		const ret = { status: false, msg: err.message }
		callback(ret)
	}
}

MongoDb.prototype.getAppointment = async function (appointmentId, callback){
	const appoint = await Appointment.findById({appointmentId})

	if(appoint){
		const ret = {
			status: true,
			result: appoint
		}

		callback(ret)
	}else {
		const ret = {
			status: false,
			result: {
				data : {},
				msg : "Appointment not found."
			}
		}

		callback(ret)
	}
}

MongoDb.prototype.checkAdmin = async function(email, callback){
    try {
        const user = await Admin.findOne({email})

        if(!user){
            const ret = {status: false, msg: `No Admin with this email ${email}`}
            callback(ret)
        } else {
            const ret = {status: true, _id: user._id, email: user.email}
            callback(ret)
        }
    } catch (error) {
        callback({status:false, ...error})

    }
}

MongoDb.prototype.checkServiceProvider = async function(email, callback){
	try {
		const user = await ServiceProvider.findOne({email})
        if(!user){
			const ret = {status: false, msg: `No Service Provider with this email ${email} was found.`}
            return callback(ret)
        } else {
			const ret = {status: true, _id: user._id, email: user.email}
            return callback(ret)
        }
    } catch (error) {
    	callback({status:false, msg: error.message})
    }
}

MongoDb.prototype.checkStudent = async function(email, callback){
    try {
        const user = await Student.findOne({email})

        if(!user){
            const ret = {status: false, msg: `No Stuednt with this email ${email} was found.`}
            return callback(ret)
        } else {
            const ret = {status: true, _id: user._id, email: user.email}
            callback(ret)
        }
    } catch (error) {
        callback({status:false, ...error})
    }
}

MongoDb.prototype.getFellowServiceProviders = function (sp_team) {
	return new Promise(async (resolve, reject) => {
		await ServiceProvider.find({sp_team, isSenior: false})
			.then (fellows => {
				if(fellows.length == 0)
					return reject ({
						status: false,
						result: {
							msg: `No fellow ${sp_team} doctors at the moment`
						}
					}) 
				resolve(fellows)
			})
			.catch (err => {
				reject ({
					status: false,
					result: {
						msg: err.message || "Internal Problem Happened"
					}
				}) 
			})
	})
}
module.exports = { MongoDb }