import { For, Index, Show, createSignal, onCleanup } from "solid-js";
import Modal from "../global/Modal";
import SCORE from "../../data/score.json";
import STATUS from "../../data/status.json";
import convertDate from "../../utils/convertDate";
import EditRecordModalNotOwner from "./EditRecordModalNotOwner";

function UserRecordListModal({ keepList, platformStoreList, game }) {

    const [selectedRecord, setSelectedRecord] = createSignal({});


    function UserRecordList({ record, platform }) {
        return (
            <div className={"card mb-1 px-3 pt-2 record-block align-content-end"} style={"height: 80px; font-size: 0.9rem;"}
                onClick={() => { handleRecordBlockClick(record, platform) }} data-bs-toggle="modal" data-bs-target="#EditRecordModal">
                <div className="d-flex justify-content-between mb-3 row">
                    <span className="col-5 text-start">{record.name}</span>
                    <span className="col-7 text-end">
                        <span className="me-1 fw-bold">
                            {record.playtime !== null ? (Math.floor(record.playtime / 60) + "h ") + ((record.playtime % 60).toFixed(0) + "m")
                                : "-"}
                        </span>
                        {" | "}
                        <span className="fw-bold">
                            {platform.abbreviation}
                        </span>
                    </span>
                </div>
                <div className="row">
                    <span className={"col-3 fw-bold text-start text-" + STATUS[record.status].class}>{STATUS[record.status].label}</span>
                    <div className="col-9 d-flex justify-content-end" style={"font-size: 0.7rem; line-height: 0.7rem;"}>
                        <div className="">
                            <div className="fw-bold">Started:</div>
                            <div className="ps-2">{convertDate.convertToDateStr(record.startedAt)}</div>
                        </div>
                        <div className="ms-4">
                            <div className="fw-bold">Finished:</div>
                            <div className="ps-2">{convertDate.convertToDateStr(record.finishedAt)}</div>
                        </div>
                        <div className="ms-4">
                            <div className="fw-bold">Modified:</div>
                            <div className="ps-2">{convertDate.convertToDateStr(record.updatedAt)}</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    function handleRecordBlockClick(record, platform) {
        setSelectedRecord({ ...record, platform: platform });
    }

    return (
        <>
            <Modal title={"Record List"} size={"lg"} id={"UserRecordListModal"}>
                <div className="mb-1">
                    <div className="pt-1 pb-3 px-4">
                        <div>
                            <div className="h4 mb-4">{keepList.gameDetail().name}</div>
                        </div>

                        <div className="row mb-1">
                            <div className="col-4">
                                {/* Score */}
                                <label>Score</label>
                                <select className="form-select" disabled aria-disabled
                                    id="score-select" aria-label="Default select example"
                                >
                                    <option></option>
                                    <For each={SCORE}>
                                        {(rating) => <option value={rating} selected={rating == game.selectedGame().score}>{rating}</option>}
                                    </For>
                                </select>
                            </div>
                            <div className="col-2 text-center">
                                {/* Favorite */}
                                <label>Favorite</label><br />
                                <input type="checkbox" id="favorite-checkbox" className={"form-check-input " + (keepList.userGameRecord().favorite ? "" : "bg-secondary-subtle")}
                                    style={"width: 30px; height: 30px;"}
                                    checked={keepList.userGameRecord().favorite} disabled aria-disabled
                                />
                            </div>

                            <div className="col-6"></div>

                        </div>


                        <div>
                            <div className="">
                                <label>Comment</label>
                                <textarea disabled className="form-control" style={"height: 40px;"} onInput={(e) => { setGameRecordIsChanged(true); }}>
                                    {keepList.userGameRecord().comment}
                                </textarea>
                            </div>
                        </div>
                    </div>

                    <div className="px-3">
                        <hr />
                    </div>

                    <div className="px-3">

                        <div className="card" >

                            <div className="card-header mb-0" style={"font-size: 1rem;"}>
                                <div className="d-flex justify-content-start align-items-center">
                                    Records:
                                </div>
                            </div>

                            <div className="card-body px-1 py-1" style={"height: 500px; overflow-y: scroll;"}>
                                <For each={keepList.userRecord()} fallback={<div></div>}>
                                    {(record) =>
                                        <Show when={record.platformId !== null} fallback={
                                            <UserRecordList record={record} platform={{ abbreviation: "-" }} />
                                        }>
                                            <For each={keepList.gameDetail().platforms}>
                                                {(platform) =>
                                                    <Show when={record.platformId == platform.id}>
                                                        <UserRecordList record={record} platform={platform} />
                                                    </Show>
                                                }
                                            </For>
                                        </Show>
                                    }
                                </For>
                            </div>
                        </div>
                        
                        <div className="d-flex justify-content-end mt-3">
                            <button className="btn btn-danger px-5"
                            data-bs-dismiss="modal">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </Modal >

            <EditRecordModalNotOwner keepList={keepList} platformStoreList={platformStoreList} record={{ selectedRecord, setSelectedRecord }} />
        </>
    )
}

export default UserRecordListModal;