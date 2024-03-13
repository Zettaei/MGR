import Axios from "axios";
import Modal, { closeModal } from "../global/Modal";
import config from "../../../config";
import AuthAxiosFunc from "../../utils/AuthAxiosFunc";
import Swal from "sweetalert2";
import user from "../../global/currentUser";
import SCORE from "../../data/score.json";
import { createSignal } from "solid-js";

function AddGameModal({ keepList }) {

    const [isSubmitting, setIsSubmitting] = createSignal(false);
    let formRef = [];

    function clearInput() {
        for (let i = 0; i < formRef.length; ++i) {
            formRef[i].value = "";
        }
    }

    async function addGame({ gameId, score, favorite, comment }) {

        const payload = { gameId, score, favorite, comment };

        await AuthAxiosFunc.retryableAxios(async () => {
            return await Axios.post(config.api_path + "/record/game/add", payload, config.auth_header(user.currentUser))
                .then(async (res) => {
                    if (AuthAxiosFunc.userRefresh(res)) return false;

                    if (res.status === 201) {
                        Swal.fire({
                            title: "Success",
                            icon: "success",
                            text: "'" + keepList.gameDetail().name + "'" + "\nis now in your game record",
                            timer: config.SWAL_SUCCESS_TIMER_3,
                        });
                    }
                    else if (res.status === 200) {
                        await Swal.fire({
                            title: "Found",
                            icon: "info",
                            text: "'" + keepList.gameDetail().name + "'" + "\nis already in your record",
                        });
                    }

                    clearInput();
                    keepList.setUserGameRecord(res.data.result);
                    closeModal("AddGameModal");
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

        });

    }

    function handleGameSubmit(e) {
        e.preventDefault();
        setIsSubmitting(true);

        addGame({
            gameId: keepList.gameDetail().id,
            score: e.target[0].value,
            favorite: e.target[1].checked,
            comment: e.target[2].value
        })
            .finally(() => { setIsSubmitting(false); });
    }

    return (
        <Modal title={"Add Game"} size={"lg"} id={"AddGameModal"} backdrop={"static"}>
            <form className="px-3" onSubmit={handleGameSubmit} ref={(ref) => { formRef = ref; }}>
                <div className="row">
                    <div className="col-12 mb-3">
                        <div className="h5">{keepList.gameDetail().name}</div>
                    </div>

                    <div className="col-12 row mb-3">

                        <div className="col-4">
                            {/* Score */}
                            <label className="fw-bold" style={"margin-right: 10px;"}>Score</label>
                            <select className="form-select" id="score-select" aria-label="Default select example">
                                <Show when={!keepList.userGameRecord()} fallback={<>
                                    <option selected={keepList.userGameRecord().score === null}></option>
                                    <For each={SCORE}>
                                        {(rating) => <option value={rating} selected={rating == keepList.userGameRecord().score}>{rating}</option>}
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
                            <input type="checkbox" id="favorite-checkbox" className="form-check-input" style={"width: 30px; height: 30px;"}
                                checked={keepList.userGameRecord() ? keepList.userGameRecord().favorite : false} />
                        </div>

                    </div>

                    <div className="col-12 mb-5">
                        <div>
                            {/* Comment */}
                            <label className="fw-bold" style={"margin-right: 10px;"}>Comment</label>
                            <textarea className="form-control" style={"height: 150px;"}>{keepList.userGameRecord() ? keepList.userGameRecord().comment : ""}</textarea>

                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-between pb-2">
                    <div>
                        
                    </div>
                    <div>
                        <button type="submit" className="btn btn-warning px-3" disabled={isSubmitting()}><span className="fa fa-plus me-2" />Add Game</button>
                        <input type="button" className="btn btn-danger ms-2" data-bs-dismiss="modal" disabled={isSubmitting()} value={"Cancel"} />
                    </div>
                </div>

            </form>
        </Modal>
    );
}

export default AddGameModal;