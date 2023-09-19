const mongoose = require("mongoose")

const whiteListSchema = new mongoose.Schema({
    id : {
        type: String
    }, 
    
    is_bot : {
        type: Boolean
    }, 
    
    first_name : {
        type: String
    }, 
    
    last_name : {
        type: String
    }, 
    
    username : {
        type: String
    }, 
    
    language_code : {
        type: String
    },

    isAdmin : {
        type: Boolean
    }
})

const WhiteList = mongoose.model('WhiteList', whiteListSchema)

const studentSchema = new mongoose.Schema({
	stud_id: {
		type: String,
		required: [true, "Student ID cannot be set empty"],
	},
	f_name: String,
	l_name: String,
	// full_name: String,
	email: {
		type: String,
		required: [true, "Email cannot be empty"],
		unique: [true, "Email already registered"],
	},
	phone_no: {
		type: String,
		required: [true, "Phone No cannot be empty"],
	},
	telegram_id: {
		type: String,
		unique: [true, "Telegram ID already registered"]
	},
	ed_info: {
		batch: {
			type: String,
			// enum: ['PC1', 'PC2', 'C1', 'C2', 'intern']
		},
		department:{
			type: String,
			enum: ["medicine", "anesthesia", "dental", "mrt", "laboratory"]
		},
	},
	diagnosis: [{}, {}, {}],
})

const Student = mongoose.model("Student", studentSchema)

const adminSchema = new mongoose.Schema({
	provider_id: {
		type: String,
		required: [true, "Student ID cannot be set empty"],
	},
	f_name: {
		type: String,
		required: [true, "First name cannot be empty"],
	},
	l_name: {
		type: String,
		required: [true, "Last name cannot be empty"],
	},
	email: {
		type: String,
		required: [true, "Email cannot be emoty"],
		unique: true
	},
	phone_no: {
		type: String,
		required: [true, "Phone No cannot be empty"],
	},
	telegram_id: {
		type: String,
		required: [true, "Telegram ID cannot be empty"],
		unique: true
	},
	educational_bkg: {
		type: String,
	},
	sp_team: {
		type: String,
		enum: ["physical", "mental"]
	},
	// Add Some Additional
	speciality: {
		type: String,
	},
	office_location: String,
	available_at: [{
		startAt: {
			type: Number,
			//required: [true, "Starting time must be set"],
		},
		endAt: {
			type: Number,
			//required: [true, "ending time must be set"],
		},
		date: {
			type: [String],
			enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
		}
	}],
})

const Admin = mongoose.model("Admin", adminSchema)

const serviceProviderSchema = new mongoose.Schema({
	provider_id: {
		type: String,
		required: [true, "Student ID cannot be set empty"],
	},
	f_name: {
		type: String,
		required: [true, "First name cannot be empty"],
	},
	l_name: {
		type: String,
		required: [true, "Last name cannot be empty"],
	},
	email: {
		type: String,
		required: [true, "Email cannot be emoty"],
		unique: true
	},
	phone_no: {
		type: String,
		required: [true, "Phone No cannot be empty"],
	},
	telegram_id: {
		type: String,
		required: [true, "Telegram ID cannot be empty"],
		unique: true
	},
	educational_bkg: {
		type: String,
	},
	sp_team: {
		type: String,
		enum: ["physical", "mental"]
	},
	// Add Some Additional
	speciality: {
		type: String,
	},
	office_location: String,
	available_at: [{
		startAt: {
			type: Number,
			//required: [true, "Starting time must be set"],
		},
		endAt: {
			type: Number,
			//required: [true, "ending time must be set"],
		},
		date: {
			type: [String],
			enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
		}
	}],
})

const ServiceProvider = mongoose.model('ServiceProvider', serviceProviderSchema)

const requestSchema = new mongoose.Schema({
	telegram_id: {
		type: String,
		required: [true, "Request needs to have a Student ID"],
	},
	health_team: {
		type: String,
		// required: [true, "Request team need to be stated"],
	},
	provider_id: {
		type: String,
		// required: [true, "Service Provider cannot be empty"],
	},
	issued_at: {
		type: Date,
		default: Date.now
	},
	urgency: String,
	diagnosis : {
		code1 : {
			type : Boolean,
			required: [true, "Suicidal wasn't set"],
			default:false
		},

		code2 : {
			type : Boolean,
			required: [true, "Homocidal wasn't set"],
			default:false
		},

		code3 : {
			type : Boolean,
			required: [true, "Mood wasn't set"],
			default:false
		},

		code4 : {
			type : Boolean,
			required: [true, "Mood wasn't set"],
			default:false
		},

		code5 : {
			type : Boolean,
			required: [true, "Substance abuse wasn't set"],
			default:false
		},

		code6 : {
			type : Boolean,
			required: [true, "Insomnia wasn't set"],
			default:false
		},

		remark : {
			type : String,
		}
	}
})
const Request = mongoose.model("Request", requestSchema)

const AppointmentSchema = new mongoose.Schema({
	student_id: {
		type: String,	// mongoose.Schema.ObjectId
		//required: [true, "An appointment must have the ID of the Student"]
	},
	request_id: {
		type: mongoose.Schema.ObjectId,
		ref: 'Request',
		//required: [true, "Request must be refered by the appointment"]
	},
	service_provider_id: {
		type: String,
		// required: [true, "An appointment must have the ID of the Service Provider"]
	},
	time: {
		type: Date,
		// required: [true, "Starting time must be specified"]
	},
	status: {
		type: String,
		enum: ["rejected", "pending", "Accepted"],
		default: "pending"
	},
	remark: String
})

const Appointment = mongoose.model("Appointment", AppointmentSchema)

const sessionSchema = new mongoose.Schema({
    key : {
        type : String,
        require : [true, "Key wasn't given"]
    },
    data: {
        role: {
            type: Number,
            required: [true, "Role Number must be given"]
        },
        token: {
            type: String,
            required: [true, "Telegram token must be given"]
        },
        issued_time: {
            type: Date,
            dafault: Date.now() 
        }
    },
	expiresAt: {
		type : Date,
		default : (new Date(Date.now() + (3 * 24 * 60 * 60 * 1000)))
	}
})

const Session = mongoose.model('Session', sessionSchema)

const PaymentSchema = new mongoose.Schema({
	first_name: String,
	last_name: String,
	email: String,
	currency: { 
		type: String,
		enum: ["ETB", "USD"]
	},
	amount: { 
		type: Number
	},
	charge: {
		type: Number,
	},
	status: {
		type: String,
		enum: ["success", "pending", "failed"]
	}, 
	reference: {
		type: String
	},
	created_at: {
		type: String
	}, 
	type: String,
	tx_ref: String,
	payment_method: String,
	customization: {
		title: String,
		description: String,
	}

})

const Payment = mongoose.model("Payment", PaymentSchema)

module.exports = {Student, ServiceProvider, Admin, Request, Appointment, Session, WhiteList, Payment}