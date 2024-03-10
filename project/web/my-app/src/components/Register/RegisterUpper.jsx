import Swal from "sweetalert2";
import Axios from "axios";
import config from "../../../config";
import { createSignal, Show } from "solid-js";
import SwalError from "../../utils/SwalError";
import { useNavigate } from "@solidjs/router";


function RegisterUpper() {

    const [isRegistering, setIsRegistering] = createSignal(false);
    const [warning, setWarning] = createSignal("");

    const inputRef = {};
    const [inputEmail, setInputEmail] = createSignal("");
    const [inputUsername, setInputUsername] = createSignal("");
    const [inputPassword, setInputPassword] = createSignal("");
    const [inputConfirmPassword, setInputConfirmPassword] = createSignal("");
    const navigate = useNavigate();

    function simpleValidate({ email, username, password, confirmPassword }) {

        if (email === "" || username === "" || password === "" || confirmPassword === "") {
            Object.keys(inputRef).map((input) => {
                if (inputRef[input].value == "") {
                    inputRef[input].style.borderColor = "red";
                }
            });
            setWarning("Please enter every form to register.");
            return false;
        }

        if (password.length < config.MIN_PASSWORD_LENGTH || password.length > config.MAX_PASSWORD_LENGTH) {
            inputRef.password.style.borderColor = "red";
            inputRef.confirmPassword.style.borderColor = "red";

            setWarning("Password length must be at least " + config.MIN_PASSWORD_LENGTH + " characters and at most " + config.MAX_PASSWORD_LENGTH + " characters long.");
            return false;
        }

        if (!config.USERNAME_REGEX.test(username)) {
            inputRef.username.style.borderColor = "red";

            setWarning("Username is " + config.MIN_USERNAME_LENGTH + " to " + config.MAX_USERNAME_LENGTH + " characters in length and must contain only Character, Number and Symbol.");
            return false;
        }

        if (!config.PASSWORD_REGEX.test(password)) {
            inputRef.password.style.borderColor = "red";
            inputRef.confirmPassword.style.borderColor = "red";

            setWarning("Password is " + config.MIN_PASSWORD_LENGTH + " to " + config.MAX_PASSWORD_LENGTH + " characters in length and must contain only Character, Number and Symbol.");
            return false;
        }

        if (config.EMAIL_REGEX.test(email)) {
            inputRef.email.style.borderColor = "red";

            setWarning("Email is not a valid email.");
            return false;
        }

        if (password !== confirmPassword) {
            inputRef.password.style.borderColor = "red";
            inputRef.confirmPassword.style.borderColor = "red";

            setWarning("Password and Confirm Password are not the same.");
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

    async function register({ email, username, password }) {

        const payload = { email, username, password }

        // this also check if email usable
        return await Axios.post(config.api_path + "/register", payload)
            .then((res) => {
                Swal.fire({
                    title: "Success",
                    text: "Your Account has been successfully registered",
                    position: "bottom",
                    timer: 2000,
                    icon: "success",
                    allowOutsideClick: true,
                    showCloseButton: false,
                    showConfirmButton: false,
                })
                    .finally(() => {
                        navigate("/login");
                    });

                return false;
            })
            .catch((err) => {
                setIsRegistering(false);

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
                else if (err.response.data.error === "username") {
                    inputRef.username.style.borderColor = "red";
                    setWarning("Too many of that username has been used.");
                }

            });

        return false
    }

    async function handleRegister(e) {
        clearFormWarning();

        const payload = {
            email: inputEmail(),
            username: inputUsername(),
            password: inputPassword(),
            confirmPassword: inputConfirmPassword()
        }

        const success = simpleValidate(payload);

        if (success) {
            setIsRegistering(true);
            register(payload)
                .finally(() => {
                    setIsRegistering(false);
                });
        }
        return;
    }

    return (
        <>
            <div className="card">
                <div className="card-header">
                    <div className="card-title">Register</div>
                </div>
                <div className="card-body">

                    <Show when={!isRegistering()}
                        fallback={
                            <div className="my-5 text-center">
                                <span class="fa-solid fa-spinner fa-spin-pulse fs-1" />
                            </div>
                        }
                    >
                        <form action={""} onSubmit={(e) => { e.preventDefault() }} autoComplete={false}>
                            <div className="mt-3 mx-5">
                                <div>Email</div>
                                <input className="form-control"
                                    placeholder="someone@example.com"
                                    ref={(ref) => { inputRef.email = ref }}
                                    name="email"
                                    value={inputEmail()}
                                    onInput={(e) => { setInputEmail(e.target.value) }} />
                            </div>
                            <div className="mt-3 mx-5">
                                <div>Username</div>
                                <input className="form-control"
                                    placeholder=""
                                    ref={(ref) => { inputRef.username = ref }}
                                    autoComplete="off"
                                    name="username"
                                    value={inputUsername()}
                                    onInput={(e) => { setInputUsername(e.target.value) }} />
                                <div class="form-text">
                                    Your username must be {config.MIN_USERNAME_LENGTH}-{config.MAX_USERNAME_LENGTH} characters long, can contain letters, numbers and underscore ( _ ) .
                                </div>
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
                            <div className="mt-3 mx-5">
                                <div>Confirm Password</div>
                                <input className="form-control"
                                    ref={(ref) => { inputRef.confirmPassword = ref }}
                                    type="password"
                                    autoComplete="off"
                                    name="confirmPassword"
                                    value={inputConfirmPassword()}
                                    onInput={(e) => { setInputConfirmPassword(e.target.value) }} />
                                <div class="form-text">
                                    Your password must be {config.MIN_PASSWORD_LENGTH}-{config.MAX_PASSWORD_LENGTH} characters long, can contain letters, numbers and some special characters .
                                </div>
                            </div>


                            <div className="mt-3 mx-5 text-danger" style={{ height: "0px" }}>
                                {warning()}
                            </div>

                            <div className="mt-5 text-center mb-3">
                                <button type="submit" className="btn btn-danger ms-3"
                                    onClick={handleRegister}>
                                    <span className="fa fa-user me-2" />
                                    Register
                                </button>
                            </div>
                        </form>

                    </Show>

                </div>
            </div >
        </>
    );
}

export default RegisterUpper;