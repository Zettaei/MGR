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

    const [statusLowerCase, setStatusLowerCase] = createSignal([
        STATUS[0].label.toLowerCase(), STATUS[1].label.toLowerCase(),
        STATUS[2].label.toLowerCase(), STATUS[3].label.toLowerCase(),
        STATUS[4].label.toLowerCase()
    ]);
    const [statusChoice, setStatusChoice] = createSignal();


    createEffect(() => {
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


    return (
        <Modal title={"Edit Record"} size={"lg"} id={"EditRecordModal"} backdrop={"static"}>
            <form className="px-3">
                <div className="row">

                    <div className="col-8 mb-3">
                        <span className="fw-bold me-2">Name</span><span className="text-secondary">(max {config.USERRECORD_NAME_LENGTH} characters)</span>
                        <input className="form-control" id="name" name="name" autoComplete="off" maxLength={config.USERRECORD_NAME_LENGTH}
                            value={record.selectedRecord().name} disabled aria-disabled />
                    </div>

                    <div className="col-12 mb-3">
                        <span className="fw-bold me-2" required>Status</span>
                        <div className="btn-group w-100" role="group" aria-label="radio toggle button group">
                            <input disabled aria-disabled type="radio" className="btn-check" name="status" id={"status-" + statusLowerCase()[0]} autocomplete="off" value={0}
                                checked={statusChoice() == 0} />
                            <label className={"btn btn-outline-" + STATUS[0].class} style={"border: 1px solid lightgray;"} for={"status-" + statusLowerCase()[0]}
                                value={0}>{STATUS[0].label}</label>
                            <input disabled aria-disabled type="radio" className="btn-check" name="status" id={"status-" + statusLowerCase()[1]} autocomplete="off" value={1}
                                checked={statusChoice() == 1} />
                            <label className={"btn btn-outline-" + STATUS[1].class} style={"border: 1px solid lightgray;"} for={"status-" + statusLowerCase()[1]}
                                value={1}>{STATUS[1].label}</label>

                            <input disabled aria-disabled type="radio" className="btn-check" name="status" id={"status-" + statusLowerCase()[2]} autocomplete="off" value={2}
                                checked={statusChoice() == 2} />
                            <label className={"btn btn-outline-" + STATUS[2].class} style={"border: 1px solid lightgray;"} for={"status-" + statusLowerCase()[2]}
                                value={2}>{STATUS[2].label}</label>

                            <input disabled aria-disabled type="radio" className="btn-check" name="status" id={"status-" + statusLowerCase()[3]} autocomplete="off" value={3}
                                checked={statusChoice() == 3} />
                            <label className={"btn btn-outline-" + STATUS[3].class} style={"border: 1px solid lightgray;"} for={"status-" + statusLowerCase()[3]}
                                value={3}>{STATUS[3].label}</label>
                            <input disabled aria-disabled type="radio" className="btn-check" name="status" id={"status-" + statusLowerCase()[4]} autocomplete="off" value={4}
                                checked={statusChoice() == 4} />
                            <label className={"btn btn-outline-" + STATUS[4].class} style={"border: 1px solid lightgray;"} for={"status-" + statusLowerCase()[4]}
                                value={4}>{STATUS[4].label}</label>
                        </div>
                    </div>

                    <div className="col-12 mb-3 row">

                        <div className="col-5">
                            {/* Playtime */}
                            <div className="">
                                <div className="fw-bold">Playtime</div>
                                <div className="d-flex">
                                    <input disabled aria-disabled type="number" id="playtime-hours" value={record.selectedRecord().playtime ? Math.floor((record.selectedRecord().playtime / 60)) : null} onKeyUp={(e) => {
                                        enforceMinMax(e, 0, 0, 0, e.target.value);
                                    }} min={"0"} name={"playtime-hour"} className="form-control" placeholder="hh" />
                                    <span className="fs-5 mx-1">:</span>
                                    <input disabled aria-disabled type="number" id="playtime-minutes" value={record.selectedRecord().playtime ? ((record.selectedRecord().playtime % 60).toFixed(0)) : null} onKeyUp={(e) => {
                                        enforceMinMax(e, 0, 59, 0, 59);
                                    }} min={"0"} max={"59"} name={"playtime-minute"} className="form-control" placeholder="mm" />
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="col-12 mb-3 row">
                        <div className="col-5">
                            {/* Platform */}
                            <div className="fw-bold">Platform</div>
                            <select disabled aria-disabled className="form-select" id="platform-select" aria-label="Default select example">
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
                            <input disabled aria-disabled className="form-control" id="platform-store-select" list="platform-store-list" name="platform-store" autoComplete="off"
                                value={
                                    record.selectedRecord().platformStore_id ? platformStoreList.platformStore()[record.selectedRecord().platformStore_id - 1].name : ""}
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
                                <input disabled aria-disabled type="date" id="started-date" className="form-control" name="started-date"
                                    value={record.selectedRecord().startedAt ? dayjs(record.selectedRecord().startedAt).format("YYYY-MM-DD") : null} />
                            </label>
                        </div>

                        <div className="col-5">
                            <div className="fw-bold">Finished</div>
                            <label>
                                <input disabled aria-disabled type="date" id="finished-date" className="form-control" name="finished-date"
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
                            <textarea disabled aria-disabled className="form-control"
                                style={"height: 150px;"} value={record.selectedRecord().comment}></textarea>
                        </div>
                    </div>
                </div>
                <div className="d-flex justify-content-between flex-row-reverse pb-2">
                    <div>
                        <input type="button" className="btn btn-danger px-5 ms-2" data-bs-toggle="modal" data-bs-target="#UserRecordListModal" value={"Back"} />
                    </div>
                    <div>

                    </div>
                </div>
            </form>
        </Modal>
    );
}

export default EditRecordModal;