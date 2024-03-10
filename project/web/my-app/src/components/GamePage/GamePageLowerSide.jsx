import { createEffect, createSignal, onMount } from "solid-js";
import { convertCategory, convertReleaseDateRegion } from "../../utils/igdbEnumFunc";

function GamePageLowerSide({ keepList }) {
    const [languageSupport, setLanguageSupport] = createSignal({});

    function getLanguageSupport(language_supportsArray) {
        if (!language_supportsArray) {
            return null;
        }
        const arr = {};
        language_supportsArray?.map((langAndType) => {
            const language = langAndType.language.name;
            if (!arr[language]) {
                arr[language] = {};
            }
            const id = langAndType.language_support_type.id;
            if (id === 1) {
                arr[language].audio = true;
            } else if (id === 2) {
                arr[language].subtitles = true;
            } else if (id === 3) {
                arr[language].interface = true;
            }
        })
        return arr;
    }

    createEffect(() => {
        setLanguageSupport(getLanguageSupport(keepList.gameDetail()?.language_supports));
    })

    return (
        <div className="card px-4 py-3 mb-5">
            <div className="d-flex-column">

                <div className="mb-2">
                    <div className="Header">Title:</div>
                    <div>{keepList.gameDetail() ? ("- " + keepList.gameDetail()?.name) : ""}</div>
                </div>
                <div className="mb-2">
                    <div className="Header">Alternative Name:</div>
                    <div>
                        <For each={keepList.gameDetail()?.alternative_names} fallback={<div></div>}>
                            {(altname) => <div>- {altname.name}</div>}
                        </For>
                    </div>
                </div>
                <div className="mb-2">
                    <div>
                        <div className="Header">Category:</div>
                        <div>{keepList.gameDetail() ? ("- " + convertCategory(keepList.gameDetail().category)) : ""}</div>
                    </div>
                </div>
                <div className="mb-2">
                    <div>
                        <div className="Header">Platform:</div>
                        <div>
                            <For each={keepList.gameDetail()?.platforms} fallback={<div></div>}>
                                {(platform) => <div>- {platform.name}</div>}
                            </For>
                        </div>
                    </div>
                </div>

                <div className="mb-2">
                    <div>
                        <div className="Header">Genre:</div>
                        <div>
                            <For each={keepList.gameDetail()?.genres} fallback={<div></div>}>
                                {(genre) => <div>- {genre.name}</div>}
                            </For>
                        </div>
                    </div>
                </div>

                <div className="mb-2">
                    <div>
                        <div className="Header">Release Date:</div>
                        <div>
                            <For each={keepList.gameDetail()?.release_dates} fallback={<div></div>}>
                                {(date) => {
                                    if (!date.human || !date.m || !date.y) {
                                        return "";
                                    }

                                    return (
                                        <div>- {`
                                                    ${date.human.substr(4, 2)}-${(date.m < 10 ? "0" + date.m : date.m)}-${date.y}
                                                    (${(convertReleaseDateRegion(date.region))}) ${date.platform.abbreviation}
                                               `}
                                        </div>
                                    )
                                }}
                            </For>
                        </div>
                    </div>
                </div>

                <div className="mb-2">
                    <div>
                        <div className="Header">Language Support:</div>
                        <Show when={languageSupport()} fallback={""}>
                            <table className="w-100 text-center table-bordered GameLanguageSupportTable">
                                <thead className="bg-default">
                                    <tr className="row-row fw-bold">
                                        <td className="col-5">Language</td>
                                        <td className="col-2">Interface</td>
                                        <td className="col-2">Subtitle</td>
                                        <td className="col-2">Audio</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <For each={Object.keys(languageSupport())} fallback={""}>
                                        {(lang) => {
                                            return (
                                                <tr>
                                                    <td>{lang}</td>
                                                    <td>{languageSupport()[lang].interface ? <span class="fa fa-check-circle" aria-hidden="true" /> : ""}</td>
                                                    <td>{languageSupport()[lang].subtitles ? <span class="fa fa-check-circle" aria-hidden="true" /> : ""}</td>
                                                    <td>{languageSupport()[lang].audio ? <span class="fa fa-check-circle" aria-hidden="true" /> : ""}</td>
                                                </tr>
                                            )
                                        }}
                                    </For>
                                </tbody>
                            </table>
                        </Show>
                    </div>
                </div>



            </div>
        </div>
    );
}

export default GamePageLowerSide;