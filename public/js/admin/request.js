const forwardBtn = document.getElementById("forward")
const appointBtn = document.getElementById("appoint")
const rejectBtn = document.getElementById("reject")

forwardBtn.addEventListener('click', (event) => {
    axios.get("/admin/forward-team" + window.location.search + "&initData=" + webApp.getInitData()) 
    .then(res => {
        console.log(res)
    })
    .catch(err => {
        console.log(err)
    })

})