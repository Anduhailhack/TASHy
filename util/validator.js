const crypto = require("crypto")

function isEmail(email) {
	return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}

function isName(name){
	let isValid = (name.length > 3);
	return isValid && /^[a-zA-Z]+$/.test(name)
}

function isValidInitData (telegramInitData){
    const urlParams = new URLSearchParams(telegramInitData);

    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    urlParams.sort();

    let dataCheckString = '';
    for (const [key, value] of urlParams.entries()) {
        dataCheckString += `${key}=${value}\n`;
    }
    dataCheckString = dataCheckString.slice(0, -1);

    const secret = crypto.createHmac('sha256', 'WebAppData').update(process.env.BOT_TOKEN || '');
    const calculatedHash = crypto.createHmac('sha256', secret.digest()).update(dataCheckString).digest('hex');
    return calculatedHash == hash;
}

function isValidDiagnosis (diagnosis){
    if (!(diagnosis.code1 && (diagnosis.code1 == 'true' || diagnosis.code1 == 'false'))){
        return false
    }
    if (!(diagnosis.code2 && (diagnosis.code2 == 'true' || diagnosis.code2 == 'false'))){
        return false
    }
    if (!(diagnosis.code3 && (diagnosis.code3 == 'true' || diagnosis.code3 == 'false'))){
        return false
    }
    if (!(diagnosis.code4 && (diagnosis.code4 == 'true' || diagnosis.code4 == 'false'))){
        return false
    }
    if (!(diagnosis.code5 && (diagnosis.code5 == 'true' || diagnosis.code5 == 'false'))){
        return false
    }
    if (!(diagnosis.code6 && (diagnosis.code6 == 'true' || diagnosis.code6 == 'false'))){
        return false
    }

    return true
}

module.exports = {isEmail, isName, isValidInitData, isValidDiagnosis}