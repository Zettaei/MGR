import { Show, createEffect, createSignal, lazy, onMount } from "solid-js";
import Navbar from "../Navbar";
import user from "../../global/currentUser";
import HomeRecentModified from "./HomeRecentModified";
import keepList from "../../global/keepList";
import Axios from "axios";
import config from "../../../config";
import AuthAxiosFunc from "../../utils/AuthAxiosFunc";
import { useNavigate } from "@solidjs/router";


function Home() {

    const navigate = useNavigate();
    const [isLoading, setIsLoading] = createSignal();
    const [recordIsLoading, setRecordIsLoading] = createSignal();
    const [gameCount, setGameCount] = createSignal();
    const [averageScore, setAverageScore] = createSignal();
    const [platformStore, setPlatformStore] = createSignal();

    async function fetchRecentGameList() {

        await AuthAxiosFunc.retryableAxios(async () => {
            return await Axios.post(config.api_path + "/record/user/recent", {}, config.auth_header(user.currentUser))
                .then((res) => {
                    if (AuthAxiosFunc.userRefresh(res)) return false;

                    if (res.status === 200) {

                        if (res.data.game.rows) {
                            keepList.setGameList(res.data.game.rows);
                            setGameCount(res.data.game.count);
                        }
                        else {
                            setGameCount(res.data.game.count ? res.data.game.count : 0);
                        }
                        setAverageScore(res.data.avg);

                        return true;
                    }
                })
                .catch((err) => {
                    return true;
                });
        });
    }

    onMount(async () => {
        setIsLoading(true);
        setRecordIsLoading(true);
        keepList.reset();

        await user.fetchCurrentUser();
        setIsLoading(false);

        if (user.currentUser().username && user.currentUser().tag) {
            await fetchRecentGameList();
        }

        setRecordIsLoading(false);
    });

    function handleLogInClick() {
        navigate("/login");
    }

    function handleRegisterClick() {
        navigate("/register");
    }

    return (
        <>
            <div className="container-sm">
                <Show when={!isLoading()} fallback={
                    <div className="d-flex justify-content-center align-items-center">
                        <span class="fa-solid fa-spinner fa-spin-pulse fs-1" />
                    </div>
                }>
                    <Show when={user.currentUser().username && user.currentUser().tag}
                        fallback={
                            <>
                                <div className="d-flex align-items-center" style={"min-height: 650px;"}>
                                    <div className="text-center w-100">
                                        <div style={"font-size: 2.5rem;"} className="mb-2">
                                            Welcome to <span className="fw-bold">MyGameRecord</span>
                                        </div>
                                        <div style={"font-size: 1.1rem;"} className="mb-5 text-wrap">
                                            <div>
                                                MyGameRecord is a website to create your own game records.
                                            </div>
                                            <div>
                                                How much you've played, since when, on what platform, even give a score and
                                                comment to it.
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <button className="btn btn-info btn-lg px-5 me-5"
                                                onClick={handleLogInClick}>
                                                Log In
                                            </button>
                                            <button className="btn btn-danger px-5 btn-lg"
                                                onClick={handleRegisterClick}>
                                                Register
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        }>
                        <div className="row">
                            <div className="col-4 d-flex align-items-center" style={"min-height: 650px;"}>
                                <div className="text-center w-100" style={"font-size: 1.2rem;"}>
                                    <div style={"font-size: 1.8rem;"} className="mb-3">Welcome, <span className="fw-bold">{user.currentUser().username}</span>!</div>

                                    <div><span className="fw-bold">Games Count:</span> {!isNaN(gameCount()) ? gameCount() : "..."}</div>
                                    <div><span className="fw-bold">Average Score:</span> {averageScore() ? averageScore() : "..."}</div>
                                </div>
                            </div>
                            <div className="col-8">
                                <HomeRecentModified gameCount={gameCount} recordIsLoading={recordIsLoading} />
                            </div>
                        </div>
                    </Show>


                </Show>
            </div>
        </>
    );
}

export default Home;