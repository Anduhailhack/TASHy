const sendReqBtn = document.querySelector("#btn-send-req")
const sendReqCap = document.querySelector("#caption");

sendReqBtn.addEventListener('click', envent => {
    sendReqCap.classList.remove("warning");
    const health_team = document.querySelector("#sp_team")
    const code1 = document.querySelector("input[name=code_1]:checked") || 'false'
    const code2 = document.querySelector("input[name=code_2]:checked") || 'false'
    const code3 = document.querySelector("input[name=code_3]:checked") || 'false'
    const code4 = document.querySelector("input[name=code_4]:checked") || 'false'
    const code5 = document.querySelector("input[name=code_5]:checked") || 'false'
    const code6 = document.querySelector("input[name=code_6]:checked") || 'false'
    const remark = document.querySelector("#remarks")

    if (!code1 || !code2 ||
        !code3 || !code4 ||
        !code5 || !code6) {
        sendReqCap.classList.add("warning")
        sendReqCap.innerText = "Fill the following questionier accordingly." 
        return;
    }

    axios.post("/stud/send-request", {
        health_team : health_team.value,
        diagnosis : {
            code1 : code1.value,
            code2 : code2.value,
            code3 : code3.value,
            code4 : code4.value,
            code5 : code5.value,
            code6 : code6.value,
            remark : remark.value
        },
        initData : webApp.getInitData()
    })
    .then((res) => {
        sendReqCap.classList.remove("warning");
        sendReqCap.innerText = res.data.result.msg;

        if (res.data.status === "success"){
            webApp.showAlert(res.data.result.msg)
            webApp.close()
        }
    })
    .catch((err)=>{
        console.log(err)
        sendReqCap.classList.add("warning");
        sendReqCap.innerText = err.message;

        if (err.response.data && err.response.data.status === "error"){
            sendReqCap.classList.add("warning");
            sendReqCap.innerText = err.response.data.result.msg;
            sendReqBtn.removeAttribute("disabled")
            sendReqBtn.removeAttribute("style")
        }else if (err.response.data && err.response.data.status === "unauthorized"){
            axios
                .get("/stud/login/")
				.then( res => {
					let parser = new DOMParser();
					doc = parser.parseFromString( res.data, 'text/html' );
					document.replaceChild( doc.documentElement, document.documentElement );

					const script = document.querySelector('script[src="https://telegram.org/js/telegram-web-app.js?1"]');
					const newScript = document.createElement('script');
					newScript.src = script.src;

					const script3 = document.querySelector('script[src="/js/stud/login.js"]');
					const newScript3 = document.createElement('script');
					newScript3.src = script3.src;

					script.replaceWith(newScript);
					script3.replaceWith(newScript3)
				})
				.catch(err => {
					sendReqCap.classList.add("warning");
					sendReqCap.innerText = err.message;
					sendReqBtn.removeAttribute("disabled")
					sendReqBtn.removeAttribute("style")
				})
        }else {
            sendReqBtn.removeAttribute('disabled')
            sendReqBtn.style.opacity = 1
            sendReqCap.classList.add("warning");
            sendReqCap.innerText = err.message;
        }
    })
})