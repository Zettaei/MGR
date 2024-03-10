import { For, Show, createSignal } from "solid-js";
import { A } from "@solidjs/router";

function GamePageLower({ keepList }) {

    const [showSpoiler, setShowSpoiler] = createSignal(false);

    return (
        <>
            <div className="mb-5">
                <div className="card px-4 pt-3 pb-4 mb-3">
                    <Show when={keepList.gameDetail()?.summary} fallback={<div></div>}>
                        <div className="mb-4">
                            <div className="Header">Description:</div>
                            <div><span className="me-4" />{keepList.gameDetail().summary}</div>
                        </div>
                    </Show>

                    <Show when={keepList.gameDetail()?.storyline} fallback={<div></div>}>
                        <div className="Header me-3">Storyline:</div>
                        <Show when={showSpoiler()} fallback={
                            <span>
                                <button className="btn btn-outline-warning w-100"
                                    onClick={() => setShowSpoiler(true)}>
                                    Show
                                </button>
                            </span>
                        }>
                            <div><span className="me-4" />{keepList.gameDetail().storyline}</div>
                        </Show>
                    </Show>

                </div>

                <div className="card px-4 pt-3 pb-4">
                    <Show when={keepList.gameDetail()?.websites} fallback={<div></div>}>
                        <div className="Header">Website:</div>
                        <div>
                            <For each={keepList.gameDetail().websites} fallback={<div></div>}>
                                {(site) => <div><A target="_blank" className="GameWebsiteLink" href={site.url}>{site.url}</A></div>}
                            </For>
                        </div>
                    </Show>
                </div>
            </div>
        </>
    );
}

export default GamePageLower;