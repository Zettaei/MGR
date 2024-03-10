import user from "../global/currentUser";


function userRefresh(res) {
    if (res.status === 202) {
        user.setCurrentUser({
            access: res.data.access,
            username: res.data.user.username,
            tag: res.data.user.tag
        });
        return true;
    }
}

// return true if successfully validate 
//    / 
// false if not to retry after refresh token has been use or proceed as guests
async function retryableAxios(callback, loop = 2) {

    let result;

    for (let i = 0; i < loop; i++) {
        // callback is AxiosRequest
        result = await callback();
        if (result) {
            break;
        }
    }

    return;
}

export default {
    retryableAxios,
    userRefresh
};