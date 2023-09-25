class Student {

    static welcome = `Welcome Home <b>f_name</b>, you have logged in successfully! You would be able to do your student operations from here!`;
	static signup =
		`📃 <b>Sign up</b> \n
		How would you like to proceed? \n
		Click the following buttons to fill out your form. \n
		⚠️<em>If it is not openning and you are on telegram proxy but not on VPN, connect your 
		VPN and try again. </em>`;
	static home = "🏠 <b>Home: </b>";
	static about_us = "We are SAC";

    constructor (bot) {
        this.bot = bot
    }

    home(userId, f_name) {
        this.bot.telegram.sendMessage(userId, Student.welcome.replace("f_name", f_name),
		{
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
							callback_data: "my-appointments",
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
							callback_data : "sp_logout"
						},
					],
				]
			}
		}
	)
    }

	notifyAdmin(stud_info, {data}, db) {
		db.getLoggedInAdmins(async res => {
			if (res.status){
				for (let i = 0; i < res.result.length; i++){
					console.log(res.result[i].key.split(":")[0])
					await setTimeout(()=>{
						this.bot.telegram.sendMessage(
							res.result[i].key.split(":")[0],
							this._msg(stud_info.result[0], data.diagnosis.remark),
							{
								parse_mode : "HTML",
								reply_markup : {
									inline_keyboard :[
										[
											{
												text: "👍 Accept",
												web_app : {
													url : process.env.BASE_WEB_APP + "/admin/request?id=" + data._id,
												}
											},
										],
										[
											{
												text: "👎 Nop reject",
												callback_data: "reject_request"
											},
										]
									]
								}
							}
						)
					}, 3000)
				}
			}
		})
	}

	_msg({f_name, l_name, email, phone_no}, remark) {
		return `
🖋 Name : <b>${f_name} ${l_name}</b>
✉️ Email : <a href="mailto:${email}">${email}</a>
☎️ Phone N<u>o</u> : <a href="tel:${phone_no}">${phone_no}</a>
🗒 Remark : ${remark}
		`
	}
}

module.exports = { Student }