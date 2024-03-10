import { A, useNavigate } from "@solidjs/router";
import Axios from "axios";
import config from "../../config";
import user from "../global/currentUser";
import Swal from "sweetalert2";
import SwalError from "../utils/SwalError";

function NavbarAccount({ isLoading }) {
    const navigate = useNavigate();

    async function logout() {
        try {
            await Axios.get(config.api_path + "/logout", { withCredentials: true })
                .then((res) => {
                    window.sessionStorage.removeItem(config.USERINFO_SESSIONSTORAGE_NAME);
                    navigate("/");
                });
        }
        catch (err) {
            SwalError(err);
        }
    }

    function copyTagToClipboard() {
        navigator.clipboard.writeText(user.currentUser().tag);
        Swal.fire({
            title: "Tag Copied to Clipboard",
            icon: "success",
            position: "bottom",
            timer: 2000
        })
    }

    function handleLogout() {
        logout();
        user.setCurrentUser({});
    }

    return (
        <div className="dropdown ms-5">
            <button class={"btn btn-outline-" + (isLoading() ? "secondary" : "info") + " dropdown-toggle"}
                style={isLoading() ? "pointer-events: none;" : ""}
                role="button" data-bs-toggle="dropdown" aria-expanded="false">
                {user.currentUser().username}
            </button>

            <ul className="dropdown-menu dropdown-menu-end">
                <li className="d-flex align-items-center px-3 py-2 mb-3">
                    <div className="">
                        <div className="fw-bold d-flex justify-content-center text-decoration-underline" style={"font-size: 0.8rem;"}>User's Tag:</div>
                        <div>{user.currentUser().tag}</div>
                    </div>
                    <button onClick={copyTagToClipboard} className="btn btn-primary ms-2">Copy</button></li>
                <li>
                    <A href={"/user/" + user.currentUser().username + "-" + user.currentUser().tag} rel="nofollow noopener noreferrer" className="dropdown-item py-2">
                        Profile
                    </A>
                </li>
                <li>
                    <A href="/settings" rel="nofollow noopener noreferrer" className="dropdown-item py-2">
                        Settings
                    </A>
                </li>
                <li>
                    <button className="dropdown-item py-2" onClick={handleLogout}>
                        Logout
                    </button>
                </li>
            </ul>
        </div>
    );
}

export default NavbarAccount;