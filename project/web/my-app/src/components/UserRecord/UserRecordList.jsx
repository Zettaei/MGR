import { A, useParams } from "@solidjs/router";
import { Index, Show, createSignal, lazy, onMount } from "solid-js";
import Axios from "axios";
import config from "../../../config";
import user from "../../global/currentUser";
import AuthAxiosFunc from "../../utils/AuthAxiosFunc";
import keepList from "../../global/keepList";
import UserGameRecordBlock from "./UserGameRecordBlock";
import UserRecordFilter from "./UserRecordFilter";
import UserRecordPageControl from "./UserRecordPageControl";
const EditRecordModal = lazy(() => import("../UserRecordModal/EditRecordModal"));
const UserRecordListModal = lazy(() => import("../UserRecordModal/UserRecordListModal"));
const EditRecordModalNotOwner = lazy(() => import("../UserRecordModal/EditRecordModalNotOwner"));
const UserRecordListModalNotOwner = lazy(() => import("../UserRecordModal/UserRecordListModalNotOwner"));


function UserRecordList() {

    const params = useParams();

    const [recordOwner, setRecordOwner] = createSignal({});
    const [isOwner, setIsOwner] = createSignal(false);
    const [platformStore, setPlatformStore] = createSignal([]);

    const [selectedGame, setSelectedGame] = createSignal({});
    const [selectedRecord, setSelectedRecord] = createSignal({});

    const [isLoading, setIsLoading] = createSignal(true);
    const [recordIsLoading, setRecordIsLoading] = createSignal(true);

    const [gameCount, setGameCount] = createSignal(0);
    const [pageCount, setPageCount] = createSignal(1);
    const [pageth, setPageth] = createSignal(1);


    async function fetchGameList(pageth, sorting, filter) {
        setIsLoading(true);
        let page = 1;
        let tmpPageth = parseInt(pageth);

        if (!isNaN(tmpPageth)) {
            if (tmpPageth < 1) {
                page = 1;
                setPageth(1);
            }
            else if (tmpPageth) { page = tmpPageth; }
        }
        keepList.reset();
        const usernameWithTag = decodeURI(params.usernameWithTag);

        await AuthAxiosFunc.retryableAxios(async () => {
            return await Axios.post(config.api_path + "/record/user/" + usernameWithTag + "/game", {
                page,
                sorting,
                filter
            }, config.auth_header(user.currentUser))
                .then((res) => {
                    if (AuthAxiosFunc.userRefresh(res)) return false;

                    if (res.status === 200) {
                        keepList.setGameList(res.data.games);
                        setGameCount(res.data.gamesCount);
                        setPageCount(res.data.pageCount);
                        setRecordOwner(res.data.user);
                        setIsOwner(res.data.user.isOwner);

                    }

                    setIsLoading(false);
                    return true;
                })
                .catch((err) => {
                    setIsLoading(false);
                    return true;
                });
        });
    }

    onMount(async () => {
        setRecordIsLoading(true);
        await user.fetchCurrentUser();

        setPlatformStore((await Axios.get(config.api_path + "/platformStore/list")).data);
        await fetchGameList();

        setRecordIsLoading(false);
    });


    return (
        <>
            <div className="mb-5">
                {/* <UserRecordFilter keepList={keepList} fetchGameList={fetchGameList}/> */}

                <div className="card UserRecord">
                    <div className="card-header py-3 d-flex justify-content-between">
                        <div style={"font-size: 1.3rem;"}>
                            <A className="fw-bold text-dark Username Link"
                            href={"/user/" + recordOwner().username + "-" + recordOwner().tag}>
                                {recordOwner().username}
                            </A>
                            's Game Records ({gameCount() ? gameCount() : "-"}):
                        </div>
                        <div className="d-flex align-items-end" style={"font-size: 0.9rem;"}><span>{recordOwner().username}-{recordOwner().tag}</span></div>
                    </div>
                    <div className="card-body">
                        <Show when={!isLoading()} fallback={
                            <div className="d-flex justify-content-center py-3">
                                <span class="fa-solid fa-spinner fa-spin-pulse fs-1" />
                            </div>
                        }>

                            <UserRecordPageControl pageth={{ pageth, setPageth }} list={keepList.gameList} pageCount={pageCount} fetchGameList={fetchGameList} />
                            <div className="my-4">
                                <Index each={keepList.gameList()} fallback={
                                    <div className="d-flex justify-content-center">no result</div>}>
                                    {(game, index) => {
                                        return (
                                            <Show when={game().userGameRecord}>
                                                <div>
                                                    <div className="position-absolute text-end end-100 me-2" style={"line-height: 1.4rem; font-size: 0.8rem;"}>{(index + ((pageth() - 1) * config.GAMERECORDS_SEARCHED_PER_PAGE) + 1)}</div>
                                                    <UserGameRecordBlock keepList={keepList} game={game} setSelectedGame={setSelectedGame} />
                                                </div>
                                            </Show>
                                        )
                                    }}
                                </Index>
                            </div>
                            <UserRecordPageControl pageth={{ pageth, setPageth }} list={keepList.gameList} pageCount={pageCount} fetchGameList={fetchGameList} />

                        </Show>
                    </div>
                </div>
            </div>


            <Show when={!recordIsLoading()} >
                <Show when={isOwner()} fallback={
                    <>
                        <UserRecordListModalNotOwner
                            keepList={keepList}
                            platformStoreList={{ platformStore, setPlatformStore }}
                            game={{ selectedGame, setSelectedGame }}
                        />
                        <EditRecordModalNotOwner
                            keepList={keepList}
                            platformStoreList={{ platformStore, setPlatformStore }}
                            record={{ selectedRecord, setSelectedRecord }}
                        />
                    </>
                }>
                    <>
                        <UserRecordListModal
                            keepList={keepList}
                            platformStoreList={{ platformStore, setPlatformStore }}
                            game={{ selectedGame, setSelectedGame }}
                        />
                        <EditRecordModal
                            keepList={keepList}
                            platformStoreList={{ platformStore, setPlatformStore }}
                            record={{ selectedRecord, setSelectedRecord }}
                        />
                    </>
                </Show>
            </Show>

        </>
    );
}

export default UserRecordList;