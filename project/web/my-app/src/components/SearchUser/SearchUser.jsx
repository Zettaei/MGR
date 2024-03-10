import { Show, createSignal, onMount } from "solid-js";
import keepList from "../../global/keepList";
import user from "../../global/currentUser";
import config from "../../../config";
import AuthAxiosFunc from "../../utils/AuthAxiosFunc";
import Axios from "axios";
import dayjs from "dayjs";
import { useNavigate } from "@solidjs/router";

function SearchUser() {

    const navigate = useNavigate();
    const [foundUser, setFoundUser] = createSignal(null);
    const [warning, setWarning] = createSignal("");
    const [isSearching, setIsSearching] = createSignal(false);
    const [initialRun, setInitialRun] = createSignal(true);

    async function searchUser({ username, tag }) {
        setInitialRun(true);
        setFoundUser(null);
        setIsSearching(true);

        await Axios.post(config.api_path + "/searchUser", {
            find: { username, tag }
        })
            .then((res) => {
                if (res.status === 200) {
                    setIsSearching(false);
                    setFoundUser(res.data.foundUser);
                    setInitialRun(false);
                }
            })
            .catch((err) => {
                setIsSearching(false);
                setFoundUser(null);
                setInitialRun(false);
            })
    }

    function handleSubmit(e) {
        e.preventDefault();

        const usernameForm = e.target[0];
        const tagForm = e.target[1];
        usernameForm.style = "";
        tagForm.style = "";

        if (!usernameForm.value || !tagForm.value) {
            usernameForm.style = "border: 1px solid red;";
            tagForm.style = "border: 1px solid red;";
            setWarning("All forms required.");
            setIsSearching(false);
            return;
        }
        if (!config.USERNAME_REGEX.test(usernameForm.value)) {
            usernameForm.style = "border: 1px solid red;";
            setWarning("Username is " + config.MIN_USERNAME_LENGTH + " to " + config.MAX_USERNAME_LENGTH + " characters in length and must contain only Character, Number and Symbol.");
            setIsSearching(false);
            return;
        }
        if (!config.TAG_REGEX.test(tagForm.value)) {
            tagForm.style = "border: 1px solid red;";
            setWarning("Tag is " + config.TAG_LENGTH + " characters in length with [A-Z] and all Uppercase.");
            setIsSearching(false);
            return;
        }

        searchUser({ username: usernameForm.value, tag: tagForm.value });
    }

    function handleFoundUserClick(e) {
        navigate("/user/" + foundUser().username + '-' + foundUser().tag);
    }

    onMount(async () => {
        await user.fetchCurrentUser();
    });



    return (
        <>
            <div className="card pt-5 pb-4 mb-3">
                <form onSubmit={handleSubmit} >
                    <div className="d-flex flex-column justify-content-center align-items-center">
                        <div className="mb-4">
                            <div className="input-group username mb-2">
                                <div className="input-group-text title">
                                    Username
                                </div>
                                <input className="form-control" />
                            </div>
                            <div className="input-group tag">
                                <div className="input-group-text title">
                                    Tag
                                </div>
                                <input className="form-control" />
                            </div>
                        </div>
                        <div className="d-flex text-danger mb-3">
                            {warning()}
                        </div>
                        <button type="submit" className="btn btn-success py-2 px-5">
                            Search
                        </button>
                    </div>
                </form>
            </div>
            <Show when={isSearching()} >
                <div className="card text-center py-3">
                    <span class="fa-solid fa-spinner fa-spin-pulse fs-1" />
                </div>
            </Show>
            <Show when={!initialRun()} >
                <Show when={foundUser() !== null} fallback={
                    <div className="card d-flex justify-content-center py-3">
                        <div className="text-center">No Result Found</div>
                    </div>
                }>
                    <div className="card py-3">
                        <div className="d-flex justify-content-center">
                            <div className="card w-50 py-3 d-flex flex-column align-items-center text-center FoundUserBlock"
                                onClick={handleFoundUserClick}>
                                <div>
                                    <div><span className="fw-bold" style={"font-size: 1.2rem;"}>{foundUser().username}</span>-<span className="fw-bold">{foundUser().tag}</span></div>
                                    <div style={"font-size: 0.8rem;"}>User created: {dayjs(foundUser().createdAt).format("YYYY-MM-DD")}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Show>
            </Show>
        </>
    );
}

export default SearchUser;