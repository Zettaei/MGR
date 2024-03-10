import { ErrorBoundary, Index, Show, createEffect, createSignal, lazy, onMount } from "solid-js";
import Axios from "axios";
import config from "../../../config";
import { useLocation, useNavigate } from "@solidjs/router";
import searchURL from "../../global/searchURL";
import SearchPageControl from "./SearchPageControl";
import keepList from "../../global/keepList";
const SearchGameBlock = lazy(() => import("./SearchGameBlock"));

function SearchBlock({ key, setKey }) {
    const locate = useLocation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = createSignal(true);
    const [list, setList] = createSignal([]);   // List of this page
    const [pageth, setPageth] = createSignal(1);

    // maybe will try to implement check if searchURL is still the same when navigate back to prevent refetch the same thing twice
    // just maybe, it possible but nah not now.

    async function fetchSearchList(key, pageNumber) {
        if (key === undefined) {
            return [];
        }
        return await Axios.get(config.api_path + "/game/search/" + key + "/" + pageNumber)
            .then((res) => {
                return res.data;
            })
            .catch((err) => {
                return [];
            })

    }

    onMount(async () => {
        // searchURL is mainly just use to trigger rerender, I think?
        setIsLoading(true);
        keepList.reset();
        if (searchURL.gameURL() != undefined) {
            let decodedArr = [];
            decodedArr = decodeURI(locate.pathname).split(/^(\/search\/)(.*)\/(\d+)$/);
            console.log("mount ", decodedArr);
            if (decodedArr.length <= 1) {
                navigate(locate.pathname + "/1");
            }
        }
        setIsLoading(false);
    })

    createEffect(async () => {
        setIsLoading(true);
        keepList.reset();
        let decodedArr = decodeURI(locate.pathname).split(/^(\/search\/)(.*)\/(\d+)$/);
        console.log("effect " + decodedArr[2]);
        if (decodedArr[3] < 1) {
            decodedArr[3] = 1;
            navigate(locate.pathname.slice(0, locate.pathname.lastIndexOf("/")) + "/1");
        }
        else {

            setKey(decodedArr[2]);
            setPageth(decodedArr[3]);

            setList(await fetchSearchList(key(), pageth()));
        }
        setIsLoading(false);
    });

    return (

        <div className="card px-1 py-2 mb-5">
            <Show when={!isLoading()} fallback={
                <div className="d-flex justify-content-center py-3">
                    <span className="fa-solid fa-spinner fa-spin-pulse fs-1" />
                </div>
            }>
                <SearchPageControl pageth={pageth} list={list} />

                <div className="mt-3 mb-3 row justify-content-between">
                    <Index each={list().slice(0, config.GAMES_SEARCHED_PER_PAGE)} fallback={<div className="ms-3">No Result</div>}>
                        {(game) => {
                            return <SearchGameBlock game={game} />
                        }}
                    </Index>
                </div>

                <SearchPageControl pageth={pageth} list={list} />
            </Show>
        </div>

    );
}

export default SearchBlock;