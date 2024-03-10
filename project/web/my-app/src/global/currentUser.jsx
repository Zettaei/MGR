import { createSignal } from "solid-js";
import Axios from "axios";
import config from "../../config";
import AuthAxiosFunc from "../utils/AuthAxiosFunc";

const [currentUser, setCurrentUser] = createSignal({});
const [isLogin, setIsLogin] = createSignal(null);
const [isLoading, setIsLoading] = createSignal();

async function fetchCurrentUser() {

    setIsLoading(true);

    if (isLogin() !== false) {
        await Axios.get(config.api_path + "/currentUser", config.auth_header(currentUser))
            .then((res) => {
                const newSession = {
                    access: res.data.access,
                    username: res.data.user.username,
                    tag: res.data.user.tag
                }
                setIsLogin(true);
                setCurrentUser(newSession);
            })
            .catch((err) => {
                if (err.response.status === 401) {
                    setIsLogin(false);
                }
            })
    }
    setIsLoading(false);

}

export default { currentUser, setCurrentUser, fetchCurrentUser, isLogin, setIsLogin, isLoading, setIsLoading };