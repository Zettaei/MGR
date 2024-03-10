import { useNavigate } from "@solidjs/router";
import dayjs from "dayjs";
import { Show, createEffect, lazy, onMount, createSignal } from "solid-js";
import user from "../../global/currentUser";
const AddGameModal = lazy(() => import("../UserRecordModal/AddGameModal"));
const AddRecordModal = lazy(() => import("../UserRecordModal/AddRecordModal"));
const UserRecordListModal = lazy(() => import("../UserRecordModal/UserRecordListModal"));
import Axios from "axios";
import config from "../../../config";


function GamePageUpper({ keepList }) {

    const [platformStore, setPlatformStore] = createSignal([]);

    ///// store only userGameRecord not gameDetail
    const [selectedGame, setSelectedGame] = createSignal();

    async function fetchPlatformStore() {
        return await Axios.get(config.api_path + "/platformStore/list")
            .then((res) => {
                setPlatformStore(res.data);
            })
            .catch((err) => {
                setPlatformStore([]);
            });
    }

    onMount(async () => {
        await fetchPlatformStore();
    });

    createEffect(() => {
        
        setSelectedGame(keepList.userGameRecord());
    })

    const navigate = useNavigate();

    function handleImageClick() {
        window.open(keepList.gameDetail().cover?.url.replace("t_thumb", "t_cover_big"), "_blank");
    }

    function handleLogInButton() {
        navigate("/login");
    }

    return (
        <>
            <div className="card UpperBlock mb-3">
                <div className="p-4 d-flex ">
                    <div className="me-4 GameImageBlock text-center">
                        <img className="GameImage mb-3 w-100"
                            src={keepList.gameDetail().cover?.url.replace("t_thumb", "t_cover_big")}
                            onClick={handleImageClick}
                        />

                        <Show when={user.currentUser().username && user.currentUser().tag} fallback={
                            <button className="btn btn-info w-100 GameEditButton"
                                onClick={handleLogInButton}
                                data-bs-toggle="modal">
                                Log In
                            </button>
                        }>
                            <Show when={keepList.userGameRecord() === null} fallback={
                                <div className="btn-group w-100 align-items-start" role="group">
                                    <button className="btn btn-warning w-75 border border-right GameEditButton"
                                        data-bs-toggle="modal" data-bs-target={"#AddRecordModal"}>
                                        <span className="fa fa-plus me-2"/>Add Record
                                    </button>
                                    <button className="btn btn-warning w-25 border border-left GameEditButton"
                                        data-bs-toggle="modal" data-bs-target={"#UserRecordListModal"}>
                                        <span className="fa fa-list" />
                                    </button>
                                </div>
                            }>
                                <button className="btn btn-success w-100 GameEditButton"
                                    data-bs-toggle="modal" data-bs-target={"#AddGameModal"}>
                                    <span className="fa fa-plus me-2"/>Add Game
                                </button>
                            </Show>
                        </Show>
                    </div>

                    <div className="row">
                        <div className="mb-4">
                            <div className="Header">Title:</div>
                            <div className="GameTitle">{keepList.gameDetail().name}</div>
                        </div>
                        <div className="mb-4">
                            <div className="Header">First Released:</div>
                            <div>
                                {keepList.gameDetail().first_release_date ?
                                    dayjs((keepList.gameDetail().first_release_date) * 1000).format("DD MMMM YYYY")
                                    : ""}
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="Header">Platform:</div>
                            <div>{(keepList.gameDetail().platforms?.map((platform) => platform.abbreviation))?.join(" | ")}</div>
                        </div>

                        <div className="mb-4">
                            <div>
                                <div className="Header">Genre:</div>
                                <div>{(keepList.gameDetail().genres?.map((genre) => genre.name))?.join(", ")}</div>
                            </div>
                        </div>


                        <div className="row mb-4">
                            <div className="col-6">
                                <div className="Header">Developer:</div>
                                <div>{(keepList.gameDetail().involved_companies?.map((company) => {
                                    if (company.developer) {
                                        return company.company.name;
                                    }
                                }
                                ))?.filter((name) => name).join(", ")}</div>
                            </div>

                            <div className="col-6">
                                <div className="Header">Publisher:</div>
                                <div>{(keepList.gameDetail().involved_companies?.map((company) => {
                                    if (company.publisher) {
                                        return company.company.name;
                                    }
                                }
                                ))?.filter((name) => name).join(", ")}</div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <Show when={keepList.userGameRecord()} fallback={<></>} >
                <AddRecordModal keepList={keepList} platformStoreList={{platformStore, setPlatformStore, fetchPlatformStore}}/>
                <UserRecordListModal keepList={keepList} platformStoreList={{platformStore, setPlatformStore, fetchPlatformStore}} game={{selectedGame, setSelectedGame}}/>
            </Show>
            <AddGameModal keepList={keepList} />
        </>
    );
}

export default GamePageUpper;