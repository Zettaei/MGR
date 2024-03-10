import { A, useParams } from "@solidjs/router";
import Axios from "axios";
import { Show, createSignal, onMount } from "solid-js";
import config from "../../../config";
import user from "../../global/currentUser";

function UserProfile() {

    const params = useParams();
    const [isLoading, setIsLoading] = createSignal();
    const [userProfileInfo, setUserProfileInfo] = createSignal({});

    async function fetchUser(username, tag) {
        return await Axios.get(config.api_path + "/user/" + username + "/" + tag)
            .then((res) => {
                if (res.status === 200)
                    return res.data;
                else
                    return null;
            });
    }

    onMount(async () => {
        setIsLoading(true);
        user.fetchCurrentUser();
        const [username, tag] = params.usernameWithTag.split("-");
        if (!username || !tag || tag.length !== config.USERTAG_LENGTH) {
            setUserProfileInfo(null);
            return;
        }
        setUserProfileInfo(await fetchUser(username, tag));
        setIsLoading(false);
    });

    function ProfileButton() {
        return (
            <>
                <A href={"/record/" + userProfileInfo().userProfile.username + "-" + userProfileInfo().userProfile.tag}>
                    <div className="mb-1">
                        <button className="btn btn-warning px-5 w-100 py-2">
                            <span className="fa fa-list me-2" /><span className="fw-bold">Records</span>
                            <span style={"font-size: 0.9rem;"}>{" (" + userProfileInfo().gamesCount + ")"}</span>
                        </button>
                    </div>
                </A>
                <A href={"/user/" + userProfileInfo().userProfile.username + "-" + userProfileInfo().userProfile.tag + "/reviews"}>
                    <div>
                        <button className="btn btn-secondary px-5 w-100 py-2">
                            <span className="fa fa-message me-2" /><span className="fw-bold">Reviews</span>
                            <span style={"font-size: 0.9rem;"}>{" (" + userProfileInfo().reviewsCount + ")"}</span>
                        </button>
                    </div>
                </A>
            </>
        )
    }

    return (
        <>
            <div className="card">
                {/* <div className="card-header">Profile</div> */}
                <Show when={!isLoading()} fallback={
                    <div className="py-3">
                        <div className="d-flex justify-content-center">
                            <span className="fa-solid fa-spinner fa-spin-pulse fs-1" />
                        </div>
                    </div>
                }>
                    <Show when={userProfileInfo().userProfile} fallback={
                        <div className="w-100 text-center">
                            no user found
                        </div>
                    }>
                        <div className="px-4 pt-4 pb-5">
                            <div className="d-flex justify-content-between">
                                <div className="w-50">
                                    <div className="mb-3" style={"font-size: 1.7rem;"}>
                                        <span className="fw-bold">{userProfileInfo().userProfile.username}</span>
                                    </div>

                                    <div className="mb-4">
                                        <div className="input-group mb-1">
                                            <span className="input-group-text w-25">Username</span>
                                            <span className="form-control">{userProfileInfo().userProfile.username}</span>
                                        </div>
                                        <div className="input-group">
                                            <span className="input-group-text w-25">Tag</span>
                                            <span className="form-control">{userProfileInfo().userProfile.tag}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <ProfileButton />
                                </div>
                            </div>

                            <div>
                                <div>
                                    About Me:
                                    <textarea className="form-control shadow-none border" style={"min-height: 300px;"}
                                        readOnly>
                                        {userProfileInfo().userProfile.aboutMe}
                                    </textarea>
                                </div>
                            </div>

                        </div>
                    </Show>
                </Show>
            </div>
        </>
    );
}

export default UserProfile;