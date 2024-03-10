import { For, Index } from "solid-js";
import dayjs from "dayjs";
import { useNavigate } from "@solidjs/router";

function SearchGameBlock({ game }) {
    const navigate = useNavigate();

    function handleBlockClick() {
        navigate("/game/" + game().id);
    }

    return (
        <div className="card mb-2 col-6 GameBlock">
            <div className="h-100 py-1 d-flex">

                <div className="h-100 p-0 text-center" onClick={handleBlockClick}>
                    <div style={"font-size: 4.5rem;"} >
                        <img className="GameImage"
                            src={game().cover?.url?.replace("t_thumb", "t_cover_big")}
                            alt=" "
                        />
                    </div>
                </div>

                <div className="ps-0 pe-2" onClick={handleBlockClick}>
                    <div className="px-2 py-1 bg-transparent">
                        <span className="GameName text-wrap">{game().name}</span>
                        <Show when={game().first_release_date} fallback={""}>
                            <span className="ms-1 GameFirstReleasedYear">{dayjs(game().first_release_date * 1000).format("(YYYY)")}</span>
                        </Show>
                    </div>
                    <div className="px-2 bg-transparent">
                        <span className="GamePlatformAbbreviation">{(game().platforms?.map((platform) => platform.abbreviation))?.join(" | ")}</span>
                    </div>
                </div>

                {/* <div className="col-2 d-flex" onClick={() => { console.log("nah") }}>
                    <button className="w-100 h-75 align-self-center btn btn-warning"></button>
                </div> */}
            </div>
        </div>
    );
}

export default SearchGameBlock;