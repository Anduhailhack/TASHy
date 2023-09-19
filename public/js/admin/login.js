const loginBtn = document.getElementById("login-btn");

let loginCaption = document.getElementById("caption");
loginCaption.classList.remove("warning");

loginBtn.addEventListener("click", (event) => {
	let email = document.getElementById("email").value;
	loginCaption.innerText = "Enter your email to login.";

	if (webApp.isValidEmail(email)){
		loginBtn.setAttribute('disabled', 'disabled')
		loginBtn.setAttribute('style', 'opacity: 0.5;');

		axios.post("/admin/login", {
			email,
			initData : webApp.getInitData()
		})
		.then(res => {
			loginCaption.classList.remove("warning");
			loginCaption.innerText = res.data.result.msg;

			if(res.data.status === "success"){
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
					console.log(err)
					loginCaption.classList.add("warning");
					loginCaption.innerText = err.message;
					loginBtn.removeAttribute("disabled")
					loginBtn.removeAttribute("style")
				})
			}
		})
		.catch((err) => {
			console.log(err)
			loginCaption.classList.add("warning");
			loginCaption.innerText = err.message;
			loginBtn.removeAttribute("disabled")
			loginBtn.removeAttribute("style")	
		})
		// fetch("/admin/login", {
		// 	method: "post",
		// 	headers : {
		// 		"Content-Type" : "application/json"
		// 	},
		// 	body : JSON.stringify({
		// 		email,
		// 		initData : webApp.getInitData()
		// 	})
		// })
		// .then(res => res.json())
		// .then((res)=>{
		// 	if (res.status === "success"){
		// 		fetch('/admin/verify')
		// 		.then( result => result.text() )
		// 		.then( result => {
		// 			let parser = new DOMParser();
		// 			doc = parser.parseFromString( result, 'text/html' );
		// 			document.replaceChild( doc.documentElement, document.documentElement );

		// 			const script = document.querySelector('script[src="https://telegram.org/js/telegram-web-app.js?1"]');
		// 			const newScript = document.createElement('script');
		// 			newScript.src = script.src;

		// 			const script3 = document.querySelector('script[src="/js/admin/verify.js"]');
		// 			const newScript3 = document.createElement('script');
		// 			newScript3.src = script3.src;

		// 			script.replaceWith(newScript);
		// 			script3.replaceWith(newScript3)
		// 		}).catch((err) => {
		// 			console.log(err)
		// 			loginCaption.classList.add("warning");
		// 			loginCaption.innerText = "Please try again.";
		// 			loginBtn.removeAttribute("disabled")
		// 			loginBtn.removeAttribute("style")	
		// 		})
		// 	}else if (res.status === "error"){
		// 		loginCaption.classList.add("warning");
		// 		loginCaption.innerText = res.result.msg;
		// 		loginBtn.removeAttribute("disabled")
		// 		loginBtn.removeAttribute("style")
		// 	}else if (res.status === "unauthorized"){
		// 		loginCaption.classList.add("warning");
		// 		loginCaption.innerText = res.result.msg;
		// 		loginBtn.removeAttribute("disabled")
		// 		loginBtn.removeAttribute("style")
		// 	}
				
		// }).catch((err)=>{
		// 	console.err(err);
		// 	loginCaption.classList.add("warning");
		// 	loginCaption.innerText = "Unknown error happend, please try again.";
		// 	loginBtn.removeAttribute("disabled")
		// 	loginBtn.removeAttribute("style")
		// })
	}
	else {
		loginCaption.classList.add("warning");
		loginCaption.innerText = "'" + email + "'" + " is not a valid email.";
	}
});
