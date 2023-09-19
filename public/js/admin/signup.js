const signupBtn = document.getElementById("signup-btn");
const signupCaption = document.getElementById("caption");

signupBtn.addEventListener("click", (event) => {
	signupCaption.classList.remove("warning");

	let providerId = document.getElementById("id").value;
	let fName = document.getElementById("f-name").value;
	let lName = document.getElementById("l-name").value;
	let email = document.getElementById("email").value;
	let phoneNo = document.getElementById("phone-no").value;
	let educationalBkg = document.getElementById("educational-bkg").value;
	let speciality = document.getElementById("speciality").value;
	let officeLocation = document.getElementById("office-location").value;
	let healthTeam = document.getElementById("health-team").value;
	
	let dateCheckbox = document.getElementsByName("dates")

	let startsAtTag = document.getElementsByName("start_at");
	let endsAtTag = document.getElementsByName("end_at");
	
	let available_at = []


	for (var i = 0; i < dateCheckbox.length; i++) {
		if (dateCheckbox[i].checked) {
			let startAt  = Date.parse((new Date()).toISOString().replace(/T.*/, "T" + startsAtTag[i].value))
			let endAt  = Date.parse((new Date()).toISOString().replace(/T.*/, "T" + endsAtTag[i].value))

			available_at.push({
				date: dateCheckbox[i].value,
				startAt : startAt,
				endAt : endAt
			})
		}
	}

	if (verify(providerId, fName, lName, email, phoneNo)){
		signupBtn.setAttribute('disabled', 'disabled')
		signupBtn.setAttribute('style', 'opacity: 0.5;');

		caption.innerText = ""

		axios.post("/admin/signup", {
			provider_id : providerId,
			f_name: fName,
			l_name: lName,
			email: email, 
			phone_no: phoneNo,
			educational_bkg: educationalBkg,
			health_team: healthTeam,
			speciality: speciality,
			office_location: officeLocation,
			available_at : available_at,
			initData : webApp.getInitData()
		})
		.then(res => {
			caption.classList.remove("warning");
			caption.innerText = res.data.result.msg;

			if(res.data.status === "success"){
				webApp.showAlert("You have successfully signed up. Please Verify your account by entering the token from your email.")
				axios.get("/admin/verify")
				.then( res => {
					let parser = new DOMParser();
					doc = parser.parseFromString( res.data, 'text/html' );
					document.replaceChild( doc.documentElement, document.documentElement );

					const script = document.querySelector('script[src="https://telegram.org/js/telegram-web-app.js?1"]');
					const newScript = document.createElement('script');
					newScript.src = script.src;

					const script3 = document.querySelector('script[src="/js/admin/verify.js"]');
					const newScript3 = document.createElement('script');
					newScript3.src = script3.src;

					script.replaceWith(newScript);
					script3.replaceWith(newScript3)
				})
				.catch(err => {
					caption.classList.add("warning");
					caption.innerText = err.message;
					signupBtn.removeAttribute("disabled")
					signupBtn.removeAttribute("style")
				})
			}
		})
		.catch(err => {
			if (err.response.data && err.response.data.status === "error"){
				caption.classList.add("warning");
				caption.innerText = err.response.data.result.msg;
				signupBtn.removeAttribute("disabled")
				signupBtn.removeAttribute("style")
			}else if (err.response.data && err.response.data.status === "unauthorized"){
				caption.classList.add("warning");
				caption.innerText = res.result.msg;
				signupBtn.removeAttribute("disabled")
				signupBtn.removeAttribute("style")
			}else {
				signupBtn.removeAttribute('disabled')
				signupBtn.style.opacity = 1
				caption.classList.add("warning");
				caption.innerText = err.message;
			}
		})
		/*
		fetch("/sp/signup", {
			method: "post",
			headers: {
				"Content-Type" : "application/json"
			},
			body: JSON.stringify({
				provider_id : providerId,
				f_name: fName,
				l_name: lName,
				email: email, 
				phone_no: phoneNo,
				educational_bkg: educationalBkg,
				health_team: healthTeam,
				speciality: speciality,
				office_location: officeLocation,
				available_at : available_at,
				initData : webApp.getInitData()
			})
		}).then((response)=> response.json())		//check
		.then((result) => {
			if(result.status){
				webApp.showAlert("You have successfully signed up. Please Verify your account by entering the token from your email.")
				fetch("/sp/verify")
				.then( response => response.text() )
				.then( result => {
					let parser = new DOMParser();
					doc = parser.parseFromString( result, 'text/html' );
					document.replaceChild( doc.documentElement, document.documentElement );

					const script = document.querySelector('script[src="https://telegram.org/js/telegram-web-app.js?1"]');
					const newScript = document.createElement('script');
					newScript.src = script.src;

					const script3 = document.querySelector('script[src="/js/sp/verify.js"]');
					const newScript3 = document.createElement('script');
					newScript3.src = script3.src;

					script.replaceWith(newScript);
					script3.replaceWith(newScript3)
				} )
			} else {
				signupBtn.removeAttribute('disabled')
				signupBtn.style.opacity = 1
				caption.classList.add("warning")
				caption.innerText = result.result.msg
			}
		}).catch((err) => {
			signupBtn.removeAttribute('disabled')
			signupBtn.style.opacity = 1
			if(err.data && err.data.result && 
			   err.data.result.error_code && 
			   err.data.result.error_code == 11000){
				webApp.showAlert("This email has already been registered. Please login.")
			}
		})
		*/
	}
})


const verify = function(providerId, fName, lName, email, phoneNo){
	if(!webApp.isTashID(providerId)){
		signupCaption.classList.add('warning')
		signupCaption.innerText = "Invalid TASH provider ID"
		return false
	}
	if(!webApp.isName(fName)){
		signupCaption.classList.add("warning")
		signupCaption.innerText = "Your First Name is not valid!"
		return false
	}

	if(!webApp.isName(lName)){
		signupCaption.classList.add("warning")
		signupCaption.innerText = "Your Last Name is not valid!"
		return false
	}
	if (!webApp.isValidEmail(email)) {
		signupCaption.classList.add("warning");
		signupCaption.innerText = "Your email is not a valid email!";
		return false;
	}
	if(!webApp.isPhoneNo(phoneNo)){
		caption.classList.add("warning");
		caption.innerText = "Your phone number is not a valid phone number!";
		return false;
	}
	return true;
}