const loginBtn = document.getElementById("login-btn");

loginBtn.addEventListener("click", (event) => {
	let email = document.getElementById("email").value;
	let loginCaption = document.getElementById("caption");
	loginCaption.classList.remove("warning");
	loginCaption.innerText = "Enter your email to login.";

	if (webApp.isValidEmail(email)){
		loginBtn.setAttribute('disabled', 'disabled')
		loginBtn.setAttribute('style', 'opacity: 0.5;');

		fetch("/stud/login", {
			method: "post",
			headers : {
				"Content-Type" : "application/json"
			},
			body : JSON.stringify({
				email,
				initData : webApp.getInitData()
			})
		})
		.then(res => res.json())
		.then((res)=>{
			if (res.status === "success"){
				fetch("/stud/verify")
				.then( result => result.text() )
				.then( result => {
						let parser = new DOMParser();
						doc = parser.parseFromString( result, 'text/html' );
						document.replaceChild( doc.documentElement, document.documentElement );

						const script = document.querySelector('script[src="https://telegram.org/js/telegram-web-app.js?1"]');
						const newScript = document.createElement('script');
						newScript.src = script.src;

						const script3 = document.querySelector('script[src="/js/stud/verify.js"]');
						const newScript3 = document.createElement('script');
						newScript3.src = script3.src;

						script.replaceWith(newScript);
						script3.replaceWith(newScript3)
					});
			} else if (res.status === "error"){
				loginCaption.classList.add("warning");
				loginCaption.innerText = res.result.msg;
				loginBtn.removeAttribute("disabled")
				loginBtn.removeAttribute("style")
			}else if (res.status === "unauthorized"){
				loginCaption.classList.add("warning");
				loginCaption.innerText = res.result.msg;
				loginBtn.removeAttribute("disabled")
				loginBtn.removeAttribute("style")
			}
				
		}).catch((err)=>{
			console.log(err)
			loginCaption.classList.add("warning");
			loginCaption.innerText = "Unknown error happend, please try again.";
			loginBtn.removeAttribute("disabled")
			loginBtn.removeAttribute("style")
		})
			
	} else {
		loginCaption.classList.add("warning");
		loginCaption.innerText = "'" + email + "'" + " is not a valid email.";
	}
});
