import { Show, createEffect, createSignal, onMount } from "solid-js";
import config from "../../../config";
import user from "../../global/currentUser";
import Swal from "sweetalert2";
import AuthAxiosFunc from "../../utils/AuthAxiosFunc";
import Axios from "axios";
import SwalError from "../../utils/SwalError";
import { useNavigate } from "@solidjs/router";


function Settings() {

    const navigate = useNavigate();
    const [isLoading, setIsLoading] = createSignal(true);
    const [warningChangePassword, setWarningChangePassword] = createSignal("");
    const [warningRevoke, setWarningRevoke] = createSignal("");
    const [isSubmitting, setIsSubmitting] = createSignal(false);
    const [aboutMe, setAboutMe] = createSignal("");

    async function fetchAboutMe() {
        await AuthAxiosFunc.retryableAxios(async () => {
            return await Axios.get(config.api_path + "/aboutMe", config.auth_header(user.currentUser))
                .then((res) => {
                    if(AuthAxiosFunc.userRefresh(res)) return false;

                    if (res.status === 200) {
                        setAboutMe(res.data.aboutMe);
                    }

                    return true;
                })
                .catch((err) => {
                    setAboutMe("");
                    return true;
                })
        });

    }

    onMount(async () => {
        setIsLoading(true);
        await user.fetchCurrentUser();
        await fetchAboutMe();
        setIsLoading(false);
    });

    function formErrorClear(forms) {
        const key = Object.keys(forms);
        for (let i = 0; i < key.length; ++i) {
            forms[key[i]].style.borderColor = "";
        }
    }

    function simpleChangePasswordValidate({ currentForm, newForm, repeatForm }, { currentPassword, newPassword, repeatPassword }) {
        let incorrect = 0;

        if (currentPassword === "" || newPassword === "" || repeatPassword === "") {
            if (currentPassword === "") currentForm.style.borderColor = "red";
            if (newPassword === "") newForm.style.borderColor = "red";
            if (repeatPassword === "") repeatForm.style.borderColor = "red";
            setWarningChangePassword("Please enter every form.");
            return false;
        }

        if (newPassword.toString() !== repeatPassword.toString()) {
            newForm.style.borderColor = "red";
            repeatForm.style.borderColor = "red";
            setWarningChangePassword("New Password and Repeat Password are not the same.");
            return false;
        }

        if (currentPassword.length < config.MIN_PASSWORD_LENGTH || currentPassword.length > config.MAX_PASSWORD_LENGTH || !config.PASSWORD_REGEX.test(currentPassword)) {
            currentForm.style.borderColor = "red";
            ++incorrect;
        }

        if (newPassword.length < config.MIN_PASSWORD_LENGTH || newPassword.length > config.MAX_PASSWORD_LENGTH || !config.PASSWORD_REGEX.test(newPassword)) {
            newForm.style.borderColor = "red";
            repeatForm.style.borderColor = "red";
            ++incorrect;
        }


        if (incorrect) {
            setWarningChangePassword("Password pattern is incorrect. ");
            return false;
        }

        return true;
    }

    async function changePassword({ currentForm, newForm, repeatForm }, { currentPassword, newPassword }) {
        //// make api path and log out also delete all refresh Token
        await AuthAxiosFunc.retryableAxios(() => {
            return Axios.post(config.api_path + "/changePassword", { currentPassword, newPassword }, config.auth_header(user.currentUser))
                .then((res) => {
                    if (AuthAxiosFunc.userRefresh(res)) return false;

                    if (res.status === 200) {
                        Swal.fire({
                            title: "Success",
                            text: "Your Password has been changed",
                            icon: "success",
                            timer: config.SWAL_SUCCESS_TIMER_3
                        });
                        window.sessionStorage.removeItem(config.USERINFO_SESSIONSTORAGE_NAME);
                        user.setCurrentUser({});
                        navigate("/");
                        return true;
                    }
                })
                .catch((err) => {
                    if (err.response.status === 401) {
                        Swal.fire({
                            title: "Password Incorrect",
                            text: "Current Password is incorrect",
                            icon: "error"
                        });
                        currentForm.style.borderColor = "red";
                        setWarningChangePassword("Current Password is incorrect");
                    }
                    else {
                        SwalError(err);
                    }
                    return true;
                });
        })
    }

    function simpleRevokeOtherAccessValidate({ currentForm }, { currentPassword }) {

        if (currentPassword === "") {
            currentForm.style.borderColor = "red";
            setWarningRevoke("Please enter your Password.");
            return false;
        }

        if (currentPassword.length < config.MIN_PASSWORD_LENGTH || currentPassword.length > config.MAX_PASSWORD_LENGTH || !config.PASSWORD_REGEX.test(currentPassword)) {
            currentForm.style.borderColor = "red";
            setWarningRevoke("Password pattern is incorrect.");
            return false;
        }

        return true;
    }

    async function revokeOtherAccess({ currentForm }, { currentPassword }) {
        //// make api path and log out also delete all refresh Token EXCEPT THE ONE USING
        await AuthAxiosFunc.retryableAxios(async () => {
            return await Axios.post(config.api_path + "/revokeOtherAccess", { currentPassword }, config.auth_header(user.currentUser))
                .then((res) => {
                    if (AuthAxiosFunc.userRefresh(res)) return false;

                    if (res.status === 200) {
                        Swal.fire({
                            title: "Success",
                            text: "All Devices except this one have been logged out",
                            icon: "success",
                            timer: config.SWAL_SUCCESS_TIMER_3
                        });
                        return true;
                    }
                })
                .catch((err) => {
                    if (err.response.status === 401) {
                        Swal.fire({
                            title: "Password Incorrect",
                            text: "Password is incorrect",
                            icon: "error"
                        });
                        currentForm.style.borderColor = "red";
                        setWarningRevoke("Current Password is incorrect");
                    }
                    else {
                        SwalError(err);
                    }
                    return true;
                });
        })

    }

    async function changeAboutMe({ aboutMeForm }, { newAboutMe }) {
        await AuthAxiosFunc.retryableAxios(async () => {
            return await Axios.put(config.api_path + "/aboutMe/change", { newAboutMe }, config.auth_header(user.currentUser))
                .then((res) => {
                    if (AuthAxiosFunc.userRefresh(res)) return false;

                    if (res.status === 200) {
                        if (res.status === 200) {
                            Swal.fire({
                                title: "Success",
                                text: "Your About Me has been changed",
                                icon: "success",
                                timer: config.SWAL_SUCCESS_TIMER_3
                            });
                            return true;
                        }
                    }
                })
                .catch((err) => {
                    SwalError(err);
                });

            return true;
        });
    }

    function handleChangeAboutMe(e) {
        e.preventDefault();
        setIsSubmitting(true);

        const form = {
            aboutMeForm: e.target[0]
        }


        Swal.fire({
            title: "Change About Me",
            html: "<div>Change your About Me on your Profile?</div>",
            showCancelButton: true,
            showConfirmButton: true,
        })
            .then(async (swalRes) => {
                if (swalRes.isConfirmed) {
                    const payload = {
                        newAboutMe: form.aboutMeForm.value,
                    }

                    await changeAboutMe(form, payload);
                }
            })
            .catch((err) => {
                SwalError(err);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    }

    function handleChangePasswordSubmit(e) {
        e.preventDefault();
        setIsSubmitting(true);

        const forms = {
            currentForm: e.target[0],
            newForm: e.target[1],
            repeatForm: e.target[2]
        }

        Swal.fire({
            title: "Change Password",
            html: "<div>Change your Password?</div><div style='color: red;'>Will log you out from every devices <span style='font-weight: bold;'>including this one</span></div>",
            showCancelButton: true,
            showConfirmButton: true,
        })
            .then(async (swalRes) => {
                if (swalRes.isConfirmed) {

                    const payload = {
                        currentPassword: e.target[0].value,
                        newPassword: e.target[1].value,
                        repeatPassword: e.target[2].value
                    }
                    formErrorClear(forms);
                    if (simpleChangePasswordValidate(forms, payload)) {
                        await changePassword(forms, payload)
                    }

                    forms.currentForm.value = "";
                    forms.newForm.value = "";
                    forms.repeatForm.value = "";
                }
            })
            .catch((err) => {
                SwalError(err);
                forms.currentForm.value = "";
                forms.newForm.value = "";
                forms.repeatForm.value = "";
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    }

    function handleRevokeOtherAccess(e) {
        e.preventDefault();
        setIsSubmitting(true);

        const forms = {
            currentForm: e.target[0]
        }

        Swal.fire({
            title: "Revoke Other Access",
            html: "<div>Revoke all access from other devices?</div><div style='color: red;'>Will log you out from every devices <span style='font-weight: bold;'>but not this one</span></div>",
            showCancelButton: true,
            showConfirmButton: true,
        })
            .then(async (swalRes) => {
                if (swalRes.isConfirmed) {
                    const payload = {
                        currentPassword: e.target[0].value
                    }
                    formErrorClear(forms);
                    if (simpleRevokeOtherAccessValidate(forms, payload)) {
                        await revokeOtherAccess(forms, payload);
                    }
                    forms.currentForm.value = "";
                }
            })
            .catch((err) => {
                SwalError(err);
                forms.currentForm.value = "";
            })
            .finally(() => {
                setIsSubmitting(false);
            });

    }

    return (
        <div className="card Settings">
            <div className="card-header">Settings</div>
            <div className="card-body">

                <Show when={!isLoading()} fallback={
                    <div className="d-flex justify-content-center py-3">
                        <span className="fa-solid fa-spinner fa-spin-pulse fs-1" />
                    </div>
                }>

                    <div className="px-3 pt-4 pb-5">

                        <div className="mb-5">
                            <div className="mb-3 fw-bold h5 border-start border-dark border-5 px-2">
                                Info
                            </div>
                            <div className="input-group username mb-2">
                                <div className="input-group-text title">
                                    Username
                                </div>
                                <input className="form-control" value={user.currentUser().username} disabled />
                            </div>
                            <div className="input-group tag mb-4">
                                <div className="input-group-text title">
                                    Tag
                                </div>
                                <input className="form-control" value={user.currentUser().tag} disabled />
                            </div>
                            <form onSubmit={handleChangeAboutMe}>
                                <div>About Me</div>
                                <textarea className="form-control AboutMeBox mb-3" disabled={isSubmitting()}>
                                    {aboutMe()}
                                </textarea>
                                <button className="btn btn-warning submitButton" disabled={isSubmitting()}>
                                    Save Changes
                                </button>
                            </form>
                        </div>

                        <div className="mb-5">
                            <form onSubmit={handleChangePasswordSubmit} >
                                <div className="mb-3 fw-bold h5 border-start border-dark border-5 px-2">
                                    Change Password
                                </div>
                                <div className="input-group currentPassword mb-3">
                                    <div className="input-group-text title">
                                        Current Password
                                    </div>
                                    <input className="form-control" type="password" disabled={isSubmitting()} />
                                </div>
                                <div className="input-group currentPassword mb-2">
                                    <div className="input-group-text title">
                                        New Password
                                    </div>
                                    <input className="form-control" type="password" disabled={isSubmitting()} />
                                </div>
                                <div className="input-group currentPassword">
                                    <div className="input-group-text title">
                                        Repeat Password
                                    </div>
                                    <input className="form-control" type="password" disabled={isSubmitting()} />
                                </div>

                                <div className="text-secondary mb-3" style={"font-size: 0.7rem;"}>
                                    Your password must be {config.MIN_PASSWORD_LENGTH}-{config.MAX_PASSWORD_LENGTH} characters long, can contain letters, numbers and some special characters .
                                </div>

                                <div className="text-danger mb-1">{warningChangePassword()}</div>
                                <div className="d-flex align-items-end">
                                    <button type="submit" className="btn btn-warning submitButton py-2" disabled={isSubmitting()}>
                                        Save Changes
                                    </button>
                                    <div className="ms-3" style={"font-size: 0.9rem;"}>
                                        *Change Password will log you out from all device <span className="fw-bold">including this one</span>*
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="mb-5">
                            <form onSubmit={handleRevokeOtherAccess} >
                                <div className="mb-3 fw-bold h5 border-start border-dark border-5 px-2">
                                    Revoke Access
                                </div>
                                <div className="input-group currentPassword mb-3">
                                    <div className="input-group-text title">
                                        Current Password
                                    </div>
                                    <input className="form-control" type="password" disabled={isSubmitting()} />
                                </div>
                                <div className="text-danger mb-1">{warningRevoke()}</div>
                                <div className="d-flex align-items-end">
                                    <button type="submit" className="btn btn-danger py-2 submitButton" disabled={isSubmitting()}>
                                        Revoke Other Access
                                    </button>
                                    <div className="ms-3" style={"font-size: 0.9rem;"}>
                                        *Revoke Other Access will log you out from all device <span className="fw-bold">but not this one</span>*
                                    </div>
                                </div>
                            </form>
                        </div>

                    </div>
                </Show>

            </div>
        </div >
    );
}

export default Settings;