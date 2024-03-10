import Axios from "axios";
import config from "../../../config";
import Modal, { closeModal } from "../global/Modal";
import { For, Show, createEffect, createSignal, onMount } from "solid-js";
import Swal from "sweetalert2";
import AuthAxiosFunc from "../../utils/AuthAxiosFunc";
import user from "../../global/currentUser";
import STATUS from "../../data/status.json";

function AddRecordModal({ keepList, platformStoreList }) {

    let formRef = [];
    const [isSubmitting, setIsSubmitting] = createSignal(false);
    const [statusLowerCase, setStatusLowerCase] = createSignal([
        STATUS[0].label.toLowerCase(), STATUS[1].label.toLowerCase(),
        STATUS[2].label.toLowerCase(), STATUS[3].label.toLowerCase(),
        STATUS[4].label.toLowerCase()
    ]);

    function clearInput() {
        formRef[0].value = "";
        for (let i = 6; i < formRef.length - 2; ++i) {
            formRef[i].value = "";
        }
    }

    function enforceMinMax(obj, min, max, ifMin, ifMax) {
        const value = parseInt(obj.target.value);
        if (isNaN(value)) {
            obj.target.value = "";
        }
        else if (value > max) {
            obj.target.value = parseInt(ifMax);
        }
        else if (value < min) {
            obj.target.value = parseInt(ifMin);
        }

    }

    async function addRecord({ name, gameId, status, playtime, platformId, platformStore_name, started, finished, comment }) {

        const payload = {
            name,
            gameId,
            status,
            playtime,
            platformId,
            platformStore_name,
            startedAt: started,
            finishedAt: finished,
            comment
        }

        await AuthAxiosFunc.retryableAxios(async () => {
            return await Axios.post(config.api_path + "/record/record/add", payload, config.auth_header(user.currentUser))
                .then(async (res) => {
                    if (AuthAxiosFunc.userRefresh(res)) return false;

                    if (res.status === 201) {
                        if (res.data.platformCreated) {
                            await platformStoreList.fetchPlatformStore();
                        }
                        Swal.fire({
                            title: "Success",
                            text: "added a record for '" + keepList.gameDetail().name + "'",
                            icon: "success",
                            timer: config.SWAL_SUCCESS_TIMER_3
                        });

                        if (keepList.gameList()?.length > 0) {
                            keepList.setGameList(keepList.gameList().map((game) => {
                                if (game.userGameRecord.id === res.data.result.userRecordGame_id) {
                                    let targetRecord = res.data.result;
                                    let arrRecords = game.userGameRecord.userRecords;

                                    return {
                                        gameDetail: game.gameDetail,
                                        userGameRecord: Object.assign(game.userGameRecord,
                                            {
                                                userRecords: [targetRecord, ...arrRecords]
                                            }
                                        )
                                    }
                                }
                                else {
                                    return game;
                                }
                            }));
                        }
                        else {
                            keepList.setUserRecord([res.data.newRecord, ...keepList.userRecord()]);
                        }

                        clearInput();
                        closeModal("AddRecordModal");
                        return true;
                    }
                })
                .catch((err) => {
                    if (err.status === 500) {
                        Swal.fire({
                            title: "Failed",
                            text: err.message
                        })
                        return true;
                    }
                })
        });

    }

    function handleRecordSubmit(e) {
        setIsSubmitting(true);
        e.preventDefault();

        const payload = {};

        payload.gameId = keepList.gameDetail().id;
        payload.name = e.target[0].value;
        for (let i = 1; i < 6; i++) {
            if (e.target[i].checked) {
                payload.status = e.target[i].value;
                break;
            }
        }

        let playtimeArr = [isNaN(parseInt(e.target[6].value)), isNaN(parseInt(e.target[7].value))]
        if (playtimeArr[0] && playtimeArr[1]) {
            payload.playtime = null;
        }
        else {
            const hh = (playtimeArr[0]) ? 0 : ((parseInt(e.target[6].value) * 60));
            const mm = (playtimeArr[1]) ? 0 : ((parseInt(e.target[7].value)));
            payload.playtime = hh + mm;
        }

        payload.platformId = e.target[8].value;
        payload.platformStore_name = e.target[9].value;
        payload.started = e.target[10].value;
        payload.finished = e.target[11].value;
        payload.comment = e.target[12].value;

        addRecord(payload)
            .finally(() => { setIsSubmitting(false) });
    }

    return (
        <Modal title={"Add Record"} size={"lg"} id={"AddRecordModal"} backdrop={"static"}>
            <form className="px-3" onSubmit={handleRecordSubmit} ref={(ref) => { formRef = ref }}>
                <div className="row">

                    <div className="col-8 mb-3">
                        <span className="fw-bold me-2">Name</span><span className="text-secondary">(max {config.USERRECORD_NAME_LENGTH} characters)</span>
                        <input className="form-control" id="name" name="name" autoComplete="off" maxLength={config.USERRECORD_NAME_LENGTH} />
                    </div>

                    <div className="col-12 mb-3">
                        <span className="fw-bold me-2" required>Status</span><span className="text-danger">(required)</span>
                        <div className="btn-group w-100" role="group" aria-label="radio toggle button group">
                            <input type="radio" className="btn-check" name="status" id={"status-" + statusLowerCase()[0]} autocomplete="off" value={0} checked />
                            <label className={"btn btn-outline-" + STATUS[0].class} style={"border: 1px solid lightgray;"} for={"status-" + statusLowerCase()[0]}>{STATUS[0].label}</label>
                            <input type="radio" className="btn-check" name="status" id={"status-" + statusLowerCase()[1]} autocomplete="off" value={1} />
                            <label className={"btn btn-outline-" + STATUS[1].class} style={"border: 1px solid lightgray;"} for={"status-" + statusLowerCase()[1]}>{STATUS[1].label}</label>

                            <input type="radio" className="btn-check" name="status" id={"status-" + statusLowerCase()[2]} autocomplete="off" value={2} />
                            <label className={"btn btn-outline-" + STATUS[2].class} style={"border: 1px solid lightgray;"} for={"status-" + statusLowerCase()[2]}>{STATUS[2].label}</label>

                            <input type="radio" className="btn-check" name="status" id={"status-" + statusLowerCase()[3]} autocomplete="off" value={3} />
                            <label className={"btn btn-outline-" + STATUS[3].class} style={"border: 1px solid lightgray;"} for={"status-" + statusLowerCase()[3]}>{STATUS[3].label}</label>
                            <input type="radio" className="btn-check" name="status" id={"status-" + statusLowerCase()[4]} autocomplete="off" value={4} />
                            <label className={"btn btn-outline-" + STATUS[4].class} style={"border: 1px solid lightgray;"} for={"status-" + statusLowerCase()[4]}>{STATUS[4].label}</label>
                        </div>
                    </div>

                    <div className="col-12 mb-3 row">

                        <div className="col-5">
                            {/* Playtime */}
                            <div className="">
                                <div className="fw-bold">Playtime</div>
                                <div className="d-flex">
                                    <input type="number" id="playtime-hours" onKeyUp={(e) => { enforceMinMax(e, 0, 0, 0, e.target.value); }}
                                        min={"0"} name={"playtime-hour"} className="form-control" placeholder="hh" />
                                    <span className="fs-5 mx-1">:</span>
                                    <input type="number" id="playtime-minutes" onKeyUp={(e) => { enforceMinMax(e, 0, 59, 0, 59); }}
                                        min={"0"} max={"59"} name={"playtime-minute"} className="form-control" placeholder="mm" />
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="col-12 mb-3 row">
                        <div className="col-5">
                            {/* Platform */}
                            <div className="fw-bold">Platform</div>
                            <select className="form-select" id="platform-select" aria-label="Default select example">
                                <option selected></option>
                                <For each={keepList.gameDetail()?.platforms}>
                                    {(platform) => <option value={platform.id}>{platform.abbreviation}</option>}
                                </For>
                            </select>
                        </div>

                        <div className="col-7">
                            {/* PlatformStore */}
                            <div className="fw-bold">PlatformStore</div>
                            <input className="form-control" id="platform-store-select" list="platform-store-list" name="platform-store" autoComplete="off" />
                            <datalist id="platform-store-list">
                                {/* /////////////////////////////// */}
                                <For each={platformStoreList.platformStore()}>
                                    {(store) => <option value={store.name}>{store.name}</option>}
                                </For>
                            </datalist>
                        </div>
                    </div>

                    <div className="col-12 mb-3 row">
                        <div className="col-5">
                            <div className="fw-bold">Started</div>
                            <label>
                                <input type="date" id="started-date" className="form-control" name="started-date" />
                            </label>
                        </div>

                        <div className="col-5">
                            <div className="fw-bold">Finished</div>
                            <label>
                                <input type="date" id="finished-date" className="form-control" name="finished-date" />
                            </label>
                        </div>
                    </div>

                    <div className="col-12 mb-5 row">
                        {/* Comment */}
                        <div>
                            <div className="fw-bold">Comment</div>
                            <textarea className="form-control" style={"height: 150px;"}></textarea>
                        </div>
                    </div>
                </div>
                <div className="d-flex justify-content-between pb-2">
                    <div>

                    </div>
                    <div>
                        <button type="submit" className="btn btn-warning px-3" disabled={isSubmitting()}><span className="fa fa-plus me-2" />Add Record</button>
                        <Show when={keepList.gameList()?.length > 0} fallback={
                            <input type="button" className="btn btn-danger ms-2" data-bs-dismiss="modal" disabled={isSubmitting()} value={"Cancel"} />
                        }>
                            <input type="button" className="btn btn-danger ms-2" data-bs-toggle="modal" data-bs-target="#UserRecordListModal" disabled={isSubmitting()} value={"Cancel"} />
                        </Show>
                    </div>
                </div>
            </form>
        </Modal>
    );
}

export default AddRecordModal;