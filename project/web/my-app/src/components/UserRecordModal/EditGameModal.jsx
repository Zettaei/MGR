import { createEffect, createSignal } from "solid-js";
import Modal, { closeModal } from "../global/Modal";
import Axios from "axios";
import config from "../../../config";
import user from "../../global/currentUser";
import Swal from "sweetalert2";
import AuthAxiosFunc from "../../utils/AuthAxiosFunc";
import SCORE from "../../data/score.json";

function EditGameModal({ keepList, game }) {

    const [isSubmitting, setIsSubmitting] = createSignal(false);
    const [isChanged, setIsChanged] = createSignal(false);
    const [deleteSubmitted, setDeleteSubmitted] = createSignal(false);
    let formRef = [];

    async function updateGameRecord({ userRecordGame_id, score, favorite, comment }) {
        const payload = { userRecordGame_id, score, favorite, comment };

        return await AuthAxiosFunc.retryableAxios(async () => {

            return await Axios.put(config.api_path + "/record/game/update", payload, config.auth_header(user.currentUser))
                .then((res) => {
                    try {
                        if (AuthAxiosFunc.userRefresh(res)) return false;

                        if (res.status === 200) {
                            keepList.setUserGameRecord(res.data.result);
                            Swal.fire({
                                title: "Success",
                                text: "Game record's detail has been updated",
                                icon: "success"
                            });
                            closeModal("EditGameModal");

                            if (keepList.gameList()) {
                                keepList.setGameList(keepList.gameList().map((game) => {
                                    if(parseInt(res.data.result.id) === parseInt(game.userGameRecord.id)) {
                                        return {
                                            gameDetail: game.gameDetail,
                                            userGameRecord: Object.assign(res.data.result, {
                                                userRecords: game.userGameRecord.userRecords
                                            })
                                        };
                                    }
                                    else {
                                        return game;
                                    }
                                }));
                            }
                        }
                    }
                    catch (err) {
                        console.error(err);
                    }

                    return true;

                })
                .catch((err) => {
                    if (err.status === 500) {
                        Swal.fire({
                            title: "Failed",
                            text: err.message
                        })
                        return true;
                    }
                });
        })
    }


    async function removeGameRecord({ userRecordGame_id }) {

        return Swal.fire({
            title: "Game Removal",
            html: "<div>Remove '" + keepList.gameDetail().name + "' from your record?</div>" +
                "<div style='color: red;'>All records of the game will be deleted</div>",
            showConfirmButton: true,
            showCancelButton: true
        })
            .then(async (res) => {
                if (res.isConfirmed) {
                    return await AuthAxiosFunc.retryableAxios(async () => {
                        return await Axios.delete(config.api_path + "/record/game/delete/" + userRecordGame_id, config.auth_header(user.currentUser))
                            .then(async (res) => {
                                if (AuthAxiosFunc.userRefresh(res)) return false;

                                if (res.status === 200) {
                                    closeModal("EditGameModal");
                                    keepList.setUserRecord([]);
                                    keepList.setUserGameRecord(undefined);
                                    Swal.fire({
                                        title: "Success",
                                        text: "The Game has been removed",
                                        icon: "success",
                                        timer: config.SWAL_SUCCESS_TIMER_3
                                    });

                                    keepList.setGameList(keepList.gameList().map((game) => {
                                        if(parseInt(game.userGameRecord.id) === res.data.userRecordGame_id) {
                                            return {
                                                gameDetail: game.gameDetail,
                                                userGameRecord: null
                                            }
                                        }
                                        else {
                                            return game;
                                        }
                                    }));

                                    return true;
                                }
                            });
                    });
                }
                else {
                    return null;
                }
            });

    }

    function handleRemove() {
        setDeleteSubmitted(true);
    }

    function handleGameSubmit(e) {
        e.preventDefault();
        setIsSubmitting(true);

        let promise;

        const payload = {
            userRecordGame_id: game.selectedGame().id,
            score: e.target[0].value,
            favorite: e.target[1].checked,
            comment: e.target[2].value
        }

        if (deleteSubmitted()) {
            promise = removeGameRecord(payload);
        }
        else {
            promise = updateGameRecord(payload);
        }

        promise.finally(() => {
            setDeleteSubmitted(false);
            setIsSubmitting(false);
        });
    }

    return (
        <>
            <Modal title={"Edit Game"} size={"lg"} id={"EditGameModal"} backdrop={"static"}>
                <form className="px-3" onSubmit={handleGameSubmit} ref={(ref) => { formRef = ref; }}>
                    <div className="row">
                        <div className="col-12 mb-3">
                            <div className="h5">{keepList.gameDetail().name}</div>
                        </div>

                        <div className="col-12 row mb-3">

                            <div className="col-4">
                                {/* Score */}
                                <label className="fw-bold" style={"margin-right: 10px;"}>Score</label>
                                <select className="form-select" id="score-select" aria-label="Default select example"
                                    onChange={() => { setIsChanged(true); }}>
                                    <Show when={!game.selectedGame()} fallback={<>
                                        <option selected={game.selectedGame().score === null}></option>
                                        <For each={SCORE}>
                                            {(rating) => <option value={rating} selected={rating == game.selectedGame().score}>{rating}</option>}
                                        </For>
                                    </>
                                    }>
                                        <>
                                            <option selected></option>
                                            <For each={SCORE}>
                                                {(rating) => <option value={rating}>{rating}</option>}
                                            </For>
                                        </>
                                    </Show>

                                </select>
                            </div>

                            <div className="col-2 text-center">
                                {/* Favorite */}
                                <label className="fw-bold" style={"margin-right: 10px;"}>Favorite</label>
                                <input type="checkbox" id="favorite-checkbox" className="form-check-input"
                                    onChange={() => { setIsChanged(true); }} style={"width: 30px; height: 30px;"}
                                    checked={game.selectedGame() ? game.selectedGame().favorite : false} />
                            </div>

                        </div>

                        <div className="col-12 mb-4">
                            <div>
                                {/* Comment */}
                                <label className="fw-bold" style={"margin-right: 10px;"}>Comment</label>
                                <textarea className="form-control" style={"height: 150px;"} onInput={() => { setIsChanged(true); }}>
                                    {game.selectedGame() ? game.selectedGame().comment : ""}</textarea>

                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-between flex-row-reverse pb-2">
                        <div>
                            <button type="submit" className="btn btn-warning px-3" disabled={isSubmitting() || !isChanged()}><span className="fa fa-save me-2" />Save Changes</button>
                            <input type="button" className="btn btn-danger px-3 ms-2" data-bs-toggle="modal" data-bs-target="#UserRecordListModal" disabled={isSubmitting()} value={"Cancel"} />
                        </div>
                        <div>
                            <button type="submit" className="btn btn-danger" disabled={isSubmitting()} onClick={handleRemove}>
                                <span className="fa fa-times me-2" />Remove
                            </button>
                        </div>
                    </div>

                </form>
            </Modal>
        </>
    );
}

export default EditGameModal;