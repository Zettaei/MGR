import { useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";
import config from "../../../config";
import Axios from "axios";
import SwalError from "../../utils/SwalError";
import user from "../../global/currentUser";


function LoginUpper() {
    const [isLoggingIn, setIsLoggingIn] = createSignal(false);
    const [warning, setWarning] = createSignal("");

    const inputRef = {};
    const [inputEmail, setInputEmail] = createSignal("");
    const [inputPassword, setInputPassword] = createSignal("");
    const [inputRememberMe, setInputRememberMe] = createSignal(false);
    const navigate = useNavigate();

    function simpleValidate({ email, password }) {

        if (email === "" || password === "") {
            if (email === "") inputRef.email.style.borderColor = "red";
            if (password === "") inputRef.password.style.borderColor = "red";

            setWarning("Please enter every form to login.");
            return false;
        }

        if (password.length < config.MIN_PASSWORD_LENGTH || password.length > config.MAX_PASSWORD_LENGTH) {
            inputRef.password.style.borderColor = "red";

            setWarning("Password length must be at least " + config.MIN_PASSWORD_LENGTH + " characters and at most " + config.MAX_PASSWORD_LENGTH + " characters long.");
            return false;
        }

        if (!config.PASSWORD_REGEX.test(password)) {
            inputRef.password.style.borderColor = "red";

            setWarning("Password must contain only Character, Number and Symbol.");
            return false;
        }

        if (config.EMAIL_REGEX.test(email)) {
            inputRef.email.style.borderColor = "red";

            setWarning("Email is not a valid email.");
            return false;
        }

        return true;
    }

    function clearFormWarning() {
        Object.keys(inputRef).map((input) => {
            inputRef[input].style.borderColor = "";
        });
        setWarning("");
    }

    async function login({ email, password, rememberMe }) {
        const payload = {
            email, password, rememberMe
        }

        await Axios.post(config.api_path + "/login", payload, { withCredentials: true })
            .then((res) => {
                if (res.data.message === "success") {
                    user.setCurrentUser({
                        access: res.data.access,
                        username: res.data.user.username,
                        tag: res.data.user.tag
                    });
                    console.log("login", user.currentUser());
                    window.sessionStorage.removeItem("mgl");
                    navigate("/");
                }
            })
            .catch((err) => {
                setIsLoggingIn(false);

                if (!err.response) {
                    SwalError(err)
                }

                if (err.response.data.error === "email") {
                    inputRef.email.style.borderColor = "red";
                    setWarning("Email is already used.");
                }
                else if (err.response.data.error === "unknown") {
                    SwalError(err);
                }
                else if (err.response.data.error === "form") {
                    setWarning("Something is wrong. Please try refresh the page.");
                }
                else if (err.response.data.error === "none") {
                    inputRef.email.style.borderColor = "red";
                    inputRef.password.style.borderColor = "red";
                    setWarning("Email or Password incorrected or don't exist.");
                }
            })


        console.log("loginUpper", user.currentUser());


        ///// vvvv THIS IS THE WAY TO DO REFRESHABLE?????? LETS GOOOOO
        // Do isLoggedIn and and stuff like that next
        // also dont forget to fix the bug "Assignment to constant variable when try-
        // -to login second time/ fourth time (even numbers)

        //     setTimeout(async () => {

        //         retryableAxios(async () => {

        //             await Axios.get(config.api_path + "/check", config.auth_header(currentUser))
        //                 .then((res) => {
        //                     if (res.status === 202) {
        //                         user.setCurrentUser({
        //                             access: res.data.access,
        //                             user: res.data.user
        //                         });
        //                     }
        //                 })
        //         })

        //     //////////////////////////////////////

        //     }, 20000);
    }

    function handleLogin(e) {
        clearFormWarning();

        const payload = {
            email: inputEmail(),
            password: inputPassword(),
            rememberMe: inputRememberMe()
        }

        const success = simpleValidate(payload);

        if (success) {
            setIsLoggingIn(true);
            login(payload).finally(() => {
                setIsLoggingIn(false);
            });
        }
        return;
    }

    return (
        <>
            <form action={""} onSubmit={(e) => { e.preventDefault() }} autoComplete={false}>
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Log In</div>
                    </div>
                    <div className="card-body">
                        <Show when={!isLoggingIn()}
                            fallback={
                                <div className="my-5 text-center">
                                    <span class="fa-solid fa-spinner fa-spin-pulse fs-1" />
                                </div>
                            }
                        >
                            <div className="mt-3 mx-5">
                                <div>Email</div>
                                <input className="form-control"
                                    ref={(ref) => { inputRef.email = ref }}
                                    name="email"
                                    value={inputEmail()}
                                    onInput={(e) => { setInputEmail(e.target.value) }} />
                            </div>

                            <div className="mt-3 mx-5">
                                <div>Password</div>
                                <input className="form-control"
                                    ref={(ref) => { inputRef.password = ref }}
                                    type="password"
                                    autoComplete="off"
                                    name="password"
                                    value={inputPassword()}
                                    onInput={(e) => { setInputPassword(e.target.value) }} />
                            </div>

                            <div className="mt-4 ms-5 form-check">
                                <label className="form-check-label">
                                    <input type="checkbox" className="form-check-input"
                                        name="rememberMe"
                                        checked={inputRememberMe()}
                                        onChange={(e) => setInputRememberMe((flag) => !flag)}
                                        ref={(ref) => { inputRef.rememberMe = ref }} />
                                    Remember Me
                                </label>
                            </div>

                            <div className="mt-3 mx-5 text-danger">
                                {warning()}
                            </div>

                            <div className="mt-5 text-center mb-3">
                                <button className="btn btn-primary"
                                    type="submit"
                                    onClick={handleLogin}>
                                    <span className="fa fa-check me-2" />
                                    Log In
                                </button>
                            </div>
                        </Show>
                    </div>
                </div>
            </form>
        </>
    );
}

export default LoginUpper;