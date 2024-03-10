import LoginLower from "./LoginLower";
import LoginUpper from "./LoginUpper";
import Navbar from "../Navbar";
import user from "../../global/currentUser";

function Login() {

    return (
        <>
            <LoginUpper user={user} />
            <LoginLower />
        </>
    );
}

export default Login;