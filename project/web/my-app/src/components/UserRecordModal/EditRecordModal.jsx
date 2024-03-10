import Modal, { closeModal } from "../global/Modal";
import config from "../../../config";
import STATUS from "../../data/status.json";
import { createEffect, createSignal, on, onMount } from "solid-js";
import dayjs from "dayjs";
import AuthAxiosFunc from "../../utils/AuthAxiosFunc";
import Axios from "axios";
import user from "../../global/currentUser";
import Swal from "sweetalert2";


function EditRecordModal({ keepList, platformStoreList, record }) {

    const [isChanged, setIsChanged] = createSignal(false);
    const [isSubmitting, setIsSubmitting] = createSignal(false);
    const [statusLowerCase, setStatusLowerCase] = createSignal([
        STATUS[0].label.toLowerCase(), STATUS[1].label.toLowerCase(),
        STATUS[2].label.toLowerCase(), STATUS[3].label.toLowerCase(),
        STATUS[4].label.toLowerCase()
    ]);
    const [statusChoice, setStatusChoice] = createSignal();
    const [deleteSubmitted, setDeleteSubmitted] = createSignal();


    createEffect(() => {
        setIsChanged(false);
        setDeleteSubmitted(false);
        setStatusChoice(record.selectedRecord().status);
    });

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

    async function updateRecord({ userRecordGame_id, duplicated, name, status, playtime, platformId, platformStore_name, started, finished, comment }) {

        const payload = {
            userRecordGame_id,
            duplicated,
            name,
            status,
            playtime,
            platformId,
            platformStore_name,
            startedAt: started,
            finishedAt: finished,
            comment
        }

        return await AuthAxiosFunc.retryableAxios(async () => {

            return await Axios.put(config.api_path + "/record/record/update", payload, config.auth_header(user.currentUser))
                .then(async (res) => {
                    if (AuthAxiosFunc.userRefresh(res)) return false;

                    if (res.status === 200) {
                        if (res.data.platformCreated) {
                            await platformStoreList.fetchPlatformStore();
                        }
                        Swal.fire({
                            title: "Success",
                            text: "update a record for '" + keepList.gameDetail().name + "'",
                            icon: "success",
                            timer: config.SWAL_SUCCESS_TIMER_3
                        });

                        if (keepList.gameList()?.length > 0) {
                            keepList.setGameList(keepList.gameList().map((game) => {
                                if (game.userGameRecord.id === res.data.updatedRecord.userRecordGame_id) {
                                    let targetRecord = {};

                                    let arrRecords = game.userGameRecord.userRecords.map((record) => {
                                        if (record.duplicated === payload.duplicated) {
                                            targetRecord = res.data.updatedRecord;
                                            return null;
                                        }
                                        else {
                                            return record;
                                        }
                                    });

                                    arrRecords = arrRecords.filter((e) => e !== null);

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
                            keepList.setUserRecord(() => {
                                const arr = [];
                                arr.push(res.data.updatedRecord);
                                keepList.userRecord().map((record) => {
                                    if (record.userRecordGame_id === payload.userRecordGame_id) {
                                        if (record.duplicated === payload.duplicated) {
                                            return;
                                        }
                                    }
                                    arr.push(record);
                                });
                                return arr;
                            });

                        }
                        console.log(keepList.userRecord());

                        closeModal("EditRecordModal");
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

    async function deleteRecord({ userRecordGame_id, duplicated }) {

        return Swal.fire({
            title: "Record Deletion",
            text: "Delete this record?",
            showConfirmButton: true,
            showCancelButton: true,
        })
            .then(async (res) => {
                if (res.isConfirmed) {
                    return await AuthAxiosFunc.retryableAxios(async () => {
                        return await Axios.delete(config.api_path + "/record/record/delete/" + userRecordGame_id + "/" + duplicated, config.auth_header(user.currentUser))
                            .then(async (res) => {
                                if (AuthAxiosFunc.userRefresh(res)) return false;

                                if (res.status === 200) {

                                    if (keepList.gameList()?.length > 0) {
                                            keepList.setGameList(keepList.gameList().map((game) => {
                                                if (parseInt(game.userGameRecord.id) === parseInt(res.data.result.userRecordGame_id)) {

                                                    let arrRecords = game.userGameRecord.userRecords.map((record) => {
                                                        if (record.duplicated === duplicated) {
                                                            return null;
                                                        }
                                                        else {
                                                            return record;
                                                        }
                                                    });

                                                    arrRecords = arrRecords.filter((e) => e !== null);

                                                    return {
                                                        gameDetail: game.gameDetail,
                                                        userGameRecord: Object.assign(game.userGameRecord,
                                                            {
                                                                userRecords: [...arrRecords]
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
                                        keepList.setUserRecord(keepList.userRecord().filter((elem) => elem.duplicated !== duplicated));
                                    }

                                    Swal.fire({
                                        title: "Success",
                                        text: "The Record has been deleted",
                                        icon: "success",
                                        timer: config.SWAL_SUCCESS_TIMER_3
                                    })

                                    closeModal("EditRecordModal");
                                    return true;
                                }
                            })
                    })
                }
                else {
                    return null;
                }
            });


    }

    function handleDelete() {
        setDeleteSubmitted(true);
    }

    function handleRecordSubmit(e) {
        setIsSubmitting(true);
        e.preventDefault();

        const payload = {};
        let promise;

        payload.userRecordGame_id = record.selectedRecord().userRecordGame_id;
        payload.duplicated = record.selectedRecord().duplicated;

        if (deleteSubmitted()) {
            promise = deleteRecord(payload);
        }
        else {
            payload.name = e.target[0].value;
            payload.status = statusChoice();

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
            payload.comment = e.target[14].value;

            promise = updateRecord(payload);
        }

        promise.finally(() => {
            setDeleteSubmitted(false);
            setIsSubmitting(false);
        });
    }

    return (
        <Modal title={"Edit Record"} size={"lg"} id={"EditRecordModal"} backdrop={"static"}>
            <form className="px-3" onSubmit={handleRecordSubmit}>
                <div className="row">

                    <div className="col-8 mb-3">
                        <span className="fw-bold me-2">Name</span><span className="text-secondary">(max {config.USERRECORD_NAME_LENGTH} characters)</span>
                        <input className="form-control" id="name" name="name" autoComplete="off" maxLength={config.USERRECORD_NAME_LENGTH}
                            value={record.selectedRecord().name} onInput={() => { setIsChanged(true); }} />
                    </div>

                    <div className="col-12 mb-3">
                        <span className="fw-bold me-2" required>Status</span><span className="text-danger">(required)</span>
                        <div className="btn-group w-100" role="group" aria-label="radio toggle button group">
                            <input type="radio" className="btn-check" name="status" id={"status-" + statusLowerCase()[0]} autocomplete="off" value={0}
                                checked={statusChoice() == 0} />
                            <label className={"btn btn-outline-" + STATUS[0].class} style={"border: 1px solid lightgray;"} for={"status-" + statusLowerCase()[0]}
                                onClick={(e) => { setStatusChoice(0); setIsChanged(true); }} value={0}>{STATUS[0].label}</label>
                            <input type="radio" className="btn-check" name="status" id={"status-" + statusLowerCase()[1]} autocomplete="off" value={1}
                                checked={statusChoice() == 1} />
                            <label className={"btn btn-outline-" + STATUS[1].class} style={"border: 1px solid lightgray;"} for={"status-" + statusLowerCase()[1]}
                                onClick={(e) => { setStatusChoice(1); setIsChanged(true); }} value={1}>{STATUS[1].label}</label>

                            <input type="radio" className="btn-check" name="status" id={"status-" + statusLowerCase()[2]} autocomplete="off" value={2}
                                checked={statusChoice() == 2} />
                            <label className={"btn btn-outline-" + STATUS[2].class} style={"border: 1px solid lightgray;"} for={"status-" + statusLowerCase()[2]}
                                onClick={(e) => { setStatusChoice(2); setIsChanged(true); }} value={2}>{STATUS[2].label}</label>

                            <input type="radio" className="btn-check" name="status" id={"status-" + statusLowerCase()[3]} autocomplete="off" value={3}
                                checked={statusChoice() == 3} />
                            <label className={"btn btn-outline-" + STATUS[3].class} style={"border: 1px solid lightgray;"} for={"status-" + statusLowerCase()[3]}
                                onClick={(e) => { setStatusChoice(3); setIsChanged(true); }} value={3}>{STATUS[3].label}</label>
                            <input type="radio" className="btn-check" name="status" id={"status-" + statusLowerCase()[4]} autocomplete="off" value={4}
                                checked={statusChoice() == 4} />
                            <label className={"btn btn-outline-" + STATUS[4].class} style={"border: 1px solid lightgray;"} for={"status-" + statusLowerCase()[4]}
                                onClick={(e) => { setStatusChoice(4); setIsChanged(true); }} value={4}>{STATUS[4].label}</label>
                        </div>
                    </div>

                    <div className="col-12 mb-3 row">

                        <div className="col-5">
                            {/* Playtime */}
                            <div className="">
                                <div className="fw-bold">Playtime</div>
                                <div className="d-flex">
                                    <input type="number" id="playtime-hours" value={record.selectedRecord().playtime ? Math.floor((record.selectedRecord().playtime / 60)) : null} onKeyUp={(e) => {
                                        enforceMinMax(e, 0, 0, 0, e.target.value);
                                    }} onInput={() => { setIsChanged(true); }} min={"0"} name={"playtime-hour"} className="form-control" placeholder="hh" />
                                    <span className="fs-5 mx-1">:</span>
                                    <input type="number" id="playtime-minutes" value={record.selectedRecord().playtime ? ((record.selectedRecord().playtime % 60).toFixed(0)) : null} onKeyUp={(e) => {
                                        enforceMinMax(e, 0, 59, 0, 59);
                                    }} onInput={() => { setIsChanged(true); }} min={"0"} max={"59"} name={"playtime-minute"} className="form-control" placeholder="mm" />
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="col-12 mb-3 row">
                        <div className="col-5">
                            {/* Platform */}
                            <div className="fw-bold">Platform</div>
                            <select className="form-select" id="platform-select" aria-label="Default select example"
                                onInput={() => { setIsChanged(true); }}>
                                <option selected={record.selectedRecord().platformId === null}></option>
                                <For each={keepList.gameDetail()?.platforms}>
                                    {(platform) =>
                                        <option selected={record.selectedRecord().platformId === platform.id}
                                            value={platform.id}>{platform.abbreviation}</option>}
                                </For>
                            </select>
                        </div>

                        <div className="col-7">
                            {/* PlatformStore */}
                            <div className="fw-bold">PlatformStore</div>
                            <input className="form-control" id="platform-store-select" list="platform-store-list" name="platform-store" autoComplete="off"
                                value={
                                    record.selectedRecord().platformStore_id ? platformStoreList.platformStore()[record.selectedRecord().platformStore_id - 1].name : ""}
                                onInput={() => { setIsChanged(true); }}
                            />
                            <datalist id="platform-store-list">
                                {/* /////////////////////////////// */}
                                <For each={platformStoreList.platformStore()}>
                                    {(store) =>
                                        <option value={store.name}>{store.name}</option>}
                                </For>
                            </datalist>
                        </div>
                    </div>

                    <div className="col-12 mb-3 row">
                        <div className="col-5">
                            <div className="fw-bold">Started</div>
                            <label>
                                <input type="date" id="started-date" className="form-control" name="started-date" onInput={() => { setIsChanged(true); }}
                                    value={record.selectedRecord().startedAt ? dayjs(record.selectedRecord().startedAt).format("YYYY-MM-DD") : null} />
                            </label>
                        </div>

                        <div className="col-5">
                            <div className="fw-bold">Finished</div>
                            <label>
                                <input type="date" id="finished-date" className="form-control" name="finished-date" onInput={() => { setIsChanged(true); }}
                                    value={record.selectedRecord().finishedAt ? dayjs(record.selectedRecord().finishedAt).format("YYYY-MM-DD") : null} />
                            </label>
                        </div>
                    </div>

                    <div className="col-12 mb-3 row">
                        <div className="col-5">
                            <div className="fw-bold">Record Added</div>
                            <label>
                                <input type="date" id="started-date" className="form-control" name="started-date"
                                    disabled value={record.selectedRecord().createdAt ? dayjs(record.selectedRecord().createdAt).format("YYYY-MM-DD") : null} />
                            </label>
                        </div>

                        <div className="col-5">
                            <div className="fw-bold">Last Modified</div>
                            <label>
                                <input type="date" id="finished-date" className="form-control" name="finished-date"
                                    disabled value={record.selectedRecord().updatedAt ? dayjs(record.selectedRecord().updatedAt).format("YYYY-MM-DD") : null} />
                            </label>
                        </div>
                    </div>

                    <div className="col-12 mb-5 row">
                        {/* Comment */}
                        <div>
                            <div className="fw-bold">Comment</div>
                            <textarea className="form-control" onInput={() => { setIsChanged(true); }}
                                style={"height: 150px;"} value={record.selectedRecord().comment}></textarea>
                        </div>
                    </div>
                </div>
                <div className="d-flex justify-content-between flex-row-reverse pb-2">
                    <div>
                        <button type="submit" className="btn btn-warning px-3" disabled={isSubmitting() || !isChanged()}><span className="fa fa-save me-2" />Save Changes</button>
                        <input type="button" className="btn btn-danger ms-2 px-3" data-bs-toggle="modal" data-bs-target="#UserRecordListModal" disabled={isSubmitting()} value={"Cancel"} />
                    </div>
                    <div>
                        <button type="submit" className="btn btn-danger" disabled={isSubmitting()} onClick={handleDelete}>
                            <span className="fa fa-trash me-2" />Delete
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}

export default EditRecordModal;