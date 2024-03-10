import { useLocation, useNavigate, useParams } from "@solidjs/router";
import Axios from "axios";
import { Match, Switch, createEffect, createSignal, onMount, } from "solid-js";
import { KeepAliveProvider, KeepAlive } from "solid-keep-alive";
import config from "../../../config";
import GamePageUpper from "./GamePageUpper";
import GamePageLower from "./GamePageLower";
import GamePageLowerSide from "./GamePageLowerSide";
import keepList from "../../global/keepList";
import user from "../../global/currentUser";
import GamePageLowerReview from "./GamePageLowerReview";


function GamePage() {
    const locate = useLocation();
    const [isLoading, setIsLoading] = createSignal(true);
    const [tab, setTab] = createSignal("");
    const [pageth, setPageth] = createSignal(1);

    async function fetchGamePage(gameId) {
        return await Axios.get(config.api_path + "/game/id/" + gameId, config.auth_header(user.currentUser))
            .then((res) => {
                return res.data;
            })
            .catch((err) => {
                return {};
            });
    }

    onMount(async () => {
        setIsLoading(true);
        keepList.reset();

        await user.fetchCurrentUser();  //////////

        const decodedArr = decodeURI(locate.pathname).split(/\//);
        if (decodedArr.length < 2) {
            return;
        }

        const gameId = decodedArr[2];
        if (keepList.gameDetail().id !== Number(gameId)) {
            const response = await fetchGamePage(gameId);
            console.log(response);
            keepList.setGameDetail(response.gameDetail);
            keepList.setUserGameRecord(response.userGameRecord);
            keepList.setUserRecord(response.userRecord);
            keepList.setOwnReview(response.ownReview);
        }

        const tab = decodedArr[3];
        switch (tab) {
            case "reviews": setTab(1); break;
            case "main":
            default: setTab(0); break;
        }

        setIsLoading(false);
    })


    return (
        <KeepAliveProvider>
            <Show when={!isLoading()} fallback={
                <div className="card py-3">
                    <div className="d-flex justify-content-center py-3">
                        <span className="fa-solid fa-spinner fa-spin-pulse fs-1" />
                    </div>
                </div>
            }>
                <div className="GamePage pb-4">

                    <GamePageUpper keepList={keepList} />
                    <div className="d-flex justify-content-center">
                        <div className="bg-white rounded-3 w-50 mb-3">
                            <div className="btn-group w-100" role="group" aria-label="radio toggle button group">
                                <input type="radio" className="btn-check" name="tab" id={"tab-main"} autocomplete="off" value={0}
                                    checked={tab() === 0} />
                                <label className={"btn btn-outline-secondary"} for={"tab-main"}
                                    onClick={() => { setTab(0); }} value={0}>{"Main"}</label>

                                <input type="radio" className="btn-check" name="tab" id={"tab-reviews"} autocomplete="off" value={1}
                                    checked={tab() === 1} />
                                <label className={"btn btn-outline-secondary"} for={"tab-reviews"}
                                    onClick={() => { setTab(1); }} value={1}>{"Reviews"}</label>
                            </div>
                        </div>
                    </div>

                    <Switch>
                        <Match when={tab() === 0} >
                            <div className="LowerBlock align-items-start row">
                                <div className="gamePagesBlock col-8" style={"width: 1fr;"}>
                                    <GamePageLower keepList={keepList} />
                                </div>
                                <div className="gamePagesSideBlock col-4">
                                    <GamePageLowerSide keepList={keepList} />
                                </div>
                            </div>
                        </Match>
                        <Match when={tab() === 1}>
                            <KeepAlive id="reviews-tab">
                                <GamePageLowerReview keepList={keepList} />
                            </KeepAlive>
                        </Match>
                    </Switch>

                </div >
            </Show >
        </KeepAliveProvider>
    );
}

export default GamePage;