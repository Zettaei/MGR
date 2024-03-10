import { useLocation, useNavigate } from "@solidjs/router";
import { createEffect } from "solid-js";
import config from "../../../config";

function UserRecordPageControl({ pageth, list, pageCount, fetchGameList }) {

    function handleBackwardPageButton() {
        pageth.setPageth(pageth.pageth() - 1);
        fetchGameList(pageth.pageth());
    }

    function handleForwardPageButton() {
        pageth.setPageth(pageth.pageth() + 1);
        fetchGameList(pageth.pageth());
    }

    function handlePageSubmit(e) {
        e.preventDefault();
        const pageSubmitted = e.target[0].value;
        if(pageSubmitted) {
            if(pageSubmitted <= pageCount()) pageth.setPageth(pageSubmitted);
            else pageth.setPageth(pageCount());
        }
        else {
            pageth.setPageth(1);
        }
        fetchGameList(pageth.pageth());
    }

    return (
        <div className="d-flex justify-content-end me-1">
            <form className="input-group text-end me-2" style={"width: 200px"}
                onSubmit={handlePageSubmit}>
                <span className="input-group-text fw-bold">Page</span>
                <input type="number" className="input-group form-control" value={pageth.pageth()} />
                <div className="input-group-text align-items-end" style={"font-size: 0.85rem;"}>{"/ "+ pageCount()}</div>
            </form>
            <Show when={pageth.pageth() > 1} fallback={
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
            <Show when={list().length > 0 && list().length > config.GAMERECORDS_SEARCHED_PER_PAGE -1} fallback={
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

export default UserRecordPageControl;