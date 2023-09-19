const tokenBtn = document.getElementById("verify-btn");

let verifyCaption = document.getElementById("caption");
verifyCaption.classList.remove("warning");

tokenBtn.addEventListener("click", (event) => {
	let token = document.getElementById("token").value;
	verifyCaption.innerText = "Enter your verification token down here.";
		
	if (token){
		fetch('/admin/verify', {
			method: "post",
			headers: {
				"Content-Type" : "application/json"
			},
			body: JSON.stringify({ 
				token,
				initData : webApp.getInitData(),
				initDataUnsafe : webApp.getInitDataUnsafe()
			})
		})
		.then(res => res.json())
		.then((data) => {
			console.log(data)
			if (data.status && data.status == "success"){
				webApp.showAlert(data.result.msg)
				webApp.close()
			}else if ( data.status && data.status == "unauthorized"){
				verifyCaption.classList.add("warning")
				verifyCaption.innerText = data.result.msg
			}
			else {
				verifyCaption.classList.add("warning")
				verifyCaption.innerText = "Invalid Token, Try again"
			}
		}).catch((err) => {
			verifyCaption.classList.add("warning");
			verifyCaption.innerText = "Unrecognized response from the server.";
			console.log(err);
		})
	}
	else {
		verifyCaption.classList.add("warning");
		verifyCaption.innerText = "Token cannot be empty.";
	}
});
