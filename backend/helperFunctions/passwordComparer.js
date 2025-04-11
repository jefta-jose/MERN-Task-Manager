const bcrypt = require("bcryptjs");
const { unauthorized } = require("./responseHelper");

const isMatch = async(password, existinguserPassword, res)=> {
    const matchingPassword = await bcrypt.compare(password, existinguserPassword);

    if(!matchingPassword){
        return unauthorized(res, "Invalid Email or Password");
    };
}

module.exports = isMatch;