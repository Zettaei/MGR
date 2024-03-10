import { useLocation, useNavigate } from "@solidjs/router";
import { createEffect } from "solid-js";
import config from "../../../config";

function SearchPageControl({ pageth, list }) {
    const navigate = useNavigate()
    const locate = useLocation();
    const searchPathNoPage = locate.pathname.slice(0, locate.pathname.lastIndexOf("/"))

    function handleBackwardPageButton() {
        navigate(searchPathNoPage + "/" + (Number(pageth()) - 1));
    }

    function handleForwardPageButton() {
        navigate(searchPathNoPage + "/" + (Number(pageth()) + 1));
    }

    function handlePageSubmit(e) {
        e.preventDefault();
        // let newPage = Number(e.target[0].value);
        // if(newPage < 1) {
        //     newPage = 1;
        // }
        // navigate(searchPathNoPage + "/" + newPage);
        navigate(searchPathNoPage + "/" + Number(e.target[0].value));
    }

    return (
        <div className="d-flex justify-content-end me-1">
            <form className="input-group text-end me-2" style={"width: 200px"}
                onSubmit={handlePageSubmit}>
                <span className="input-group-text">Page</span>
                <input type="number" className="input-group form-control" value={pageth()} />
            </form>
            <Show when={pageth() > 1} fallback={
                <button className="px-3 btn btn-dark" style={"border-top-right-radius: 0; border-bottom-right-radius: 0;"}
                    disabled>
                    <span className="text-secondary">{"<"}</span>
                </button>
            }>
                <button className="px-3 btn btn-dark" style={"border-top-right-radius: 0; border-bottom-right-radius: 0;"}
                    onClick={handleBackwardPageButton}>
                    {"<"}
                </button>
            </Show>
            <Show when={list().length > 0 && list().length > config.GAMES_SEARCHED_PER_PAGE} fallback={
                <button className="px-3 btn btn-dark" style={"border-top-left-radius: 0; border-bottom-left-radius: 0;"}
                    disabled>
                    <span className="text-secondary">{">"}</span>
                </button>
            }>
                <button className="px-3 btn btn-dark" style={"border-top-left-radius: 0; border-bottom-left-radius: 0;"}
                    onClick={handleForwardPageButton}>
                    {">"}
                </button>
            </Show>
        </div>
    );
}

export default SearchPageControl;