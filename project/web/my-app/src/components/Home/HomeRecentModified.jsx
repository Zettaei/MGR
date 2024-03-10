import { For, Show } from "solid-js";
import keepList from "../../global/keepList";
import STATUS from "../../data/status.json";
import convertDate from "../../utils/convertDate";
import { A, useNavigate } from "@solidjs/router";
import user from "../../global/currentUser";


function HomeRecentModified({ recordIsLoading }) {
    const navigate = useNavigate();

    function GameImage({ gameId, imageURL }) {
        return (
            <A rel="noopener noreferrer" href={"/game/" + gameId}>
                <img className="GameImage GameLink me-2" src={imageURL} />
            </A>
        )
    }

    function handleToMyRecordClick() {
        navigate("/record/" + user.currentUser().username + "-" + user.currentUser().tag);
    }

    return (
        <>
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <div>Recent Modified:</div>
                    <button className="btn btn-warning px-4" style={"font-size: 0.8rem;"}
                        onClick={handleToMyRecordClick}
                    >
                        To My Record
                    </button>
                </div>
                <div className="card-body">
                    <Show when={!recordIsLoading()} fallback={
                        <div className="d-flex justify-content-center">
                            <span className="fa-solid fa-spinner fa-spin-pulse" />
                        </div>
                    }>
                        <div className="">
                            <For each={keepList.gameList()} fallback={
                                <div className="text-center">no result</div>
                            }>
                                {(game) => {
                                    return (
                                        <div className="card RecentModifiedGameBlock mb-2">
                                            <div className="d-flex flex-row justify-content-between">
                                                <GameImage gameId={game.gameDetail.id} imageURL={game.gameDetail.cover?.url?.replace("t_thumb", "t_cover_big")}/>
                                                <div className="pt-1 w-100 pe-1"
                                                    style={"text-overflow: ellipsis; overflow: hidden; white-space: nowrap;"}
                                                >
                                                    <div style={"font-size: 0.8rem;"}>
                                                        {game.gameDetail.name}
                                                    </div>

                                                    <div className="d-flex justify-content-between" style={"font-size: 0.8rem;"}>

                                                        <div className="d-flex align-items-end">
                                                            <div>
                                                                <div>{game.userGameRecord.favorite ? <span className="fw-bold text-warning">Favorite</span> : ""}</div>
                                                                <div className="fw-bold me-1">Score: {game.userGameRecord.score ? game.userGameRecord.score : "-"}</div>
                                                            </div>
                                                        </div>

                                                        <div className={"card px-2 mt-1"} style={"height: 65px; width: 250px; font-size: 0.8rem; line-height: 1.3rem;"}>
                                                            <Show when={game.userGameRecord.userRecords?.length > 0} fallback={
                                                                <div className="d-flex align-items-center justify-content-center w-100 h-100">
                                                                    <div>none</div>
                                                                </div>
                                                            }>
                                                                <div className="d-flex justify-content-between mb-3">
                                                                    <div>\
                                                                        <Show when={game.userGameRecord.userRecords[0].name !== null} >
                                                                            {game.userGameRecord.userRecords[0].name.length < 22 ? game.userGameRecord.userRecords[0].name : game.userGameRecord.userRecords[0].name.slice(0, 19) + "..."}
                                                                        </Show>
                                                                    </div>
                                                                    <span className="text-end">
                                                                        <span className="me-1 fw-bold">
                                                                            {game.userGameRecord.userRecords[0].playtime !== null ?
                                                                                (Math.floor(game.userGameRecord.userRecords[0].playtime / 60) + "h ") +
                                                                                ((game.userGameRecord.userRecords[0].playtime % 60).toFixed(0) + "m")
                                                                                : "-"}
                                                                        </span>
                                                                        {" | "}
                                                                        <span className="fw-bold">
                                                                            {game.gameDetail.platforms.map(
                                                                                (platform) => {
                                                                                    if (platform.id === game.userGameRecord.userRecords[0].platformId) {
                                                                                        return platform.abbreviation;
                                                                                    }
                                                                                })}
                                                                        </span>
                                                                    </span>
                                                                </div>
                                                                <div className="d-flex justify-content-between">
                                                                    <div>
                                                                        <div className={"fw-bold text-start text-" + STATUS[game.userGameRecord.userRecords[0].status].class}>
                                                                            {STATUS[game.userGameRecord.userRecords[0].status].label}
                                                                        </div>
                                                                    </div>
                                                                    <div className="d-flex justify-content-end" style={"font-size: 0.6rem; line-height: 0.7rem;"}>
                                                                        <div>
                                                                            <div className="fw-bold">Modified:</div>
                                                                            <div className="ps-2">{convertDate.convertToDateStr(game.userGameRecord.userRecords[0].updatedAt)}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </Show>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    )
                                }}
                            </For>
                        </div>
                    </Show>

                </div>
            </div>
        </>
    );
}

export default HomeRecentModified;