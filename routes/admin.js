const router = require("express").Router()
const path = require("path")
const {
	isEmail, 
	isValidInitData
} = require("../util/validator")

const { Admin } = require("../menu/admin")

const { sendEmail } = require("../util/email")
const { createToken, verifyToken } = require("../util/jwt");

(!process.env.NODE_ENV ||
    process.env.NODE_ENV !== "production") && 
    require("dotenv").config()

router.get("/login", async (req, res) => {
	res.render(path.join('admin', 'login'))
})

router.get("/signup", async (req, res) => {
	res.render(path.join('admin', 'signup'))
})

router.get("/verify", async (req, res) => {
	res.render(path.join('admin','verify'))
})

router.get("/request", async (req, res) => {
    const { id } = req.query
    const { db } = res.locals

    db.getRequest(id, async (result) => {
        if (result.status){
            if (result.result && result.result.telegram_id){
                await db.getStudent(result.result.telegram_id, async (studInfo) => {
                    if (studInfo.status) {

                        res.render(path.join('admin','request'), {data : result.result, student : studInfo.result})
                    }
                })
            }
        }
    })
})

router.get("/forward-team", async (req, res) => {
    const { id, initData } = req.query
    const { db } = res.locals

    if(!isValidInitData(initData)){
		res.status(401).json({
			status: "error",
			result: {
				msg: "Invalid request!"
			}
		})
		return
	}

    
    res.end()
})

router.post("/login", async (req, res) => {
    const { email, initData } = req.body
    const { db } = res.locals

	if(!isEmail(email) || !isValidInitData(initData)){
		res.status(401).json({
			status: "error",
			result: {
				msg: "Invalid request!"
			}
		})
		return
	}

    db.checkAdmin(email, (result) => {
        if (result.status) {
            sendEmail(
                result.email,
                token = createToken(
                    result.email,
                    result._id,
                    process.env.ADMIN_ROLE
                ),
                (isSuccess) => {
                    if (isSuccess)
                        res.status(200).json({
                            status: "success",
                            result: {
                                msg: "You should receive an email, with a verification token.",
                            }
                        });
                    else
                        res.status(500).json({
                            status: "error",
                            result: {
                                msg: "Could not send an email.",
                            },
                        });
                }
            );
        } else {
            res.status(401).json({
                status: "unauthorized",
                result: result.result,
            });
        }
    })
})

router.post("/signup", async (req, res) => {
    const {provider_id, f_name, l_name, email, phone_no,
		educational_bkg, speciality, health_team,
		office_location, available_at, initData} = req.body;
    
    const { db } = res.locals
	
        
    if (!isValidInitData(initData))
    {
        res.status(401).json({
            status: "error",
            result: {
                msg: "Not a valid request."
            }
        })
		return;
	}
    
    const decodedUrlParams = new URLSearchParams(initData);
    const userId = JSON.parse(decodedUrlParams.get("user")).id;

    db.addAdmin(
        provider_id, f_name, l_name, email, phone_no, 
        userId, educational_bkg, health_team, speciality,
        office_location, available_at,
        (result) => {
            if (result.status) {
                db.checkAdmin(email, (result) => {
                    if (result.status) {
                        sendEmail(
                            result.email,
                            createToken(
                                result.email,
                                result._id,
                                process.env.ADMIN_ROLE
                            ),
                            (isSuccess) => {
                                console.log(isSuccess)
                                if (isSuccess)
                                    res.status(200).json({
                                        status: "success",
                                        result: {
                                            msg: "You should receive an email, with a verification token.",
                                        },
                                    });
                                else
                                    res.status(500).json({
                                        status: "error",
                                        result: {
                                            msg : result.msg,
                                            err: result.err.message
                                        }
                                    })
                            }
                        );
                    } else 
                        res.status(401).json({
                            status: "error",
                            result: result.err,
                        });
                    
                });
            } else {
                res.status(400).json({
                    status: "error",
                    result: {
                        msg:
                            result.err.code === 11000
                                ? "Email or your telegram ID already exists."
                                : "Error in adding a user to database.",
                        err: result.err,
                    },
                });
            }
        }
    );
})

router.post("/verify", async (req, res) => {
    const { token, initData} = req.body;
    const { db, bot } = res.locals

	if(!token || !isValidInitData(initData)){
		res.status(401).json({
			status: "error",
			result: {
				msg: "Not a valid request."
			}
		})
		return;
	}

	const decodedUrlParams = new URLSearchParams(initData);
	const userId = JSON.parse(decodedUrlParams.get("user")).id;
	const fName = JSON.parse(decodedUrlParams.get("user")).first_name;

    try {
		verifyToken(token, (err, decodedToken) => {
			if (
				err ||
				!decodedToken.hasOwnProperty("id") ||
				!decodedToken.hasOwnProperty("email") ||
				!decodedToken.hasOwnProperty("role") ||
				decodedToken.role !== process.env.ADMIN_ROLE
			) {
				res.status(403).json({
					status: "unauthorized",
					result: { msg: "Invalid token, please try again" },
				});
			} else {       
                db.addSession(`${userId}:${userId}`, {
                    token : `${token}`,
                    role : decodedToken.role
                }, (retVal) => {
                    if (retVal && retVal.status) {
                        res.json({
                            status: "success",
                            result: {
                                msg: "Authenticated successfully."
                            },
                        })
                        
                        let admin = new Admin(bot);
                        admin.home(userId, fName);
                    }else if (retVal && !retVal.status) {
                        res.status(401).json({
                            status: "error",
                            result: {
                                msg: "Couldn't set a session."
                            }
                        })
                    }
                })
			}
		})
	} catch (error) {
        console.log(error)
		res.status(400).json({ status: "error" });
	}
})



module.exports = router