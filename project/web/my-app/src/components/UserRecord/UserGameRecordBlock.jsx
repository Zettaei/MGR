import { For, Show } from "solid-js";
import STATUS from "../../data/status.json";
import convertDate from "../../utils/convertDate";
import { A, useNavigate } from "@solidjs/router";

function UserGameVisibleRecord({ game }) {

    return (
        <div className={"card mb-1 px-3 align-content-end"} style={"height: 70px; font-size: 0.9rem;"}>

            <Show when={game().userGameRecord.userRecords?.length > 0} fallback={
                <div className="d-flex align-items-center justify-content-center w-100 h-100">
                    <div>none</div>
                </div>
            }>
                <div className="d-flex justify-content-between mb-3">
                    <span>
                        {game().userGameRecord.userRecords[0].name}
                    </span>
                    <span className="text-end">
                        <span className="me-1 fw-bold">
                            {game().userGameRecord.userRecords[0].playtime !== null ?
                                (Math.floor(game().userGameRecord.userRecords[0].playtime / 60) + "h ") +
                                ((game().userGameRecord.userRecords[0].playtime % 60).toFixed(0) + "m")
                                : "-"}
                        </span>
                        {" | "}
                        <span className="fw-bold">
                            {game().gameDetail.platforms.map(
                                (platform) => {
                                    if (platform.id === game().userGameRecord.userRecords[0].platformId) {
                                        return platform.abbreviation;
                                    }
                                })}
                        </span>
                    </span>
                </div>
                <div className="d-flex justify-content-between">
                    <span className={"fw-bold text-start text-" + STATUS[game().userGameRecord.userRecords[0].status].class}>
                        {STATUS[game().userGameRecord.userRecords[0].status].label}
                    </span>
                    <div className="d-flex justify-content-end" style={"font-size: 0.7rem; line-height: 0.7rem;"}>
                        <div>
                            <div className="fw-bold">Modified:</div>
                            <div className="ps-2">{convertDate.convertToDateStr(game().userGameRecord.userRecords[0].updatedAt)}</div>
                        </div>
                    </div>
                </div>
            </Show>
        </div>
    )
}

function UserGameRecordBlock({ keepList, game, setSelectedGame }) {

    function GameImage({ gameId, imageURL }) {
        return (
            <A rel="noopener noreferrer" href={"/game/" + gameId}>
                <img className="GameImage" src={imageURL} />
            </A>
        )
    }

    function handleGameBlockClick(game) {
        keepList.setGameDetail(game().gameDetail);
        keepList.setUserGameRecord(game().userGameRecord);
        keepList.setUserRecord(game().userGameRecord.userRecords);
        setSelectedGame(keepList.userGameRecord());
    }

    return (
        <>
            <Show when={game !== null} >
                <div className="card mb-1 UserGameRecordBlock">
                    <div className="d-flex justify-content-between">
                        <div className="d-flex w-100">
                            <GameImage gameId={game().gameDetail.id} imageURL={game().gameDetail.cover?.url?.replace("t_thumb", "t_cover_big")}/>
                            <div className="d-flex w-100">

                                <div className="ms-3 py-2 d-flex flex-column justify-content-between">
                                    <div>
                                        <div>{game().gameDetail.name}</div>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <div>{game().userGameRecord.favorite ? <span className="fw-bold text-warning">Favorite</span> : ""}</div>
                                            <div className="fw-bold me-5">Score: {game().userGameRecord.score ? game().userGameRecord.score : "-"}</div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex flex-column justify-content-end me-1" style={"width: 550px;"}>
                            {/* <button className="btn btn-warning mt-1 mb-1" style={"height: 50px;"} >Add Record</button> */}

                            {/* ///// VISIBLE RECORD //// */}
                            <div className="text-end">
                                <button className="btn btn-warning w-100" style={"margin-bottom: 6px; padding: 12px 0;"}
                                    onClick={() => handleGameBlockClick(game)} data-bs-toggle="modal" data-bs-target="#UserRecordListModal">
                                    <span className="fa fa-list" />
                                </button>
                            </div>

                            <UserGameVisibleRecord game={game} />
                        </div>
                    </div>

                </div>
            </Show>
        </>
    )
}

export default UserGameRecordBlock;