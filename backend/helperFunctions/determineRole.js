const determinUserRole = (adminInviteToken)=>{
    let role = "member";

    if(adminInviteToken && adminInviteToken === process.env.ADMIN_INVITE_TOKEN){
        role = "admin";
    }

    return role;
}

module.exports = determinUserRole;