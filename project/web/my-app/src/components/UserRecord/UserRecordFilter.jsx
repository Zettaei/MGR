import { For } from "solid-js";
import AuthAxiosFunc from "../../utils/AuthAxiosFunc";
import Axios from "axios";
import config from "../../../config";

function UserRecordFilter({keepList, fetchGameList}) {

    async function submitFilter(sorting) {
                
        fetchGameList(1, sorting)
    }

    function handleFilterSubmit(e) {
        e.preventDefault();
        let sort = null;

        if(e.target[0].value) {
            sort = e.target[0].value;
        }

        if(sort === "score" || sort === "favorite") {
            sort = {
                game: [sort, e.target[1].value]
            }
        }   
        else {
            sort = {
                record: [sort, e.target[1].value]
            }
        }

        submitFilter(sort)
    }
    
    return (
        <div className="card mb-3 py-3 px-3">

            <div className="w-100">
                <form onSubmit={handleFilterSubmit}>
                    <div className="mb-3 d-flex">
                        <div className="me-3" style={"width: 50%;"}>
                            {/* <div>Search Title:</div>
                            <div>
                                <input className="form-control" placeholder="Title"></input>
                            </div> */}
                        </div>

                        <div className="" style={"width: 50%;"}>
                            <div>Sort by:</div>
                            <div className="d-flex">
                                <div style={"width: 70%;"}>
                                    <select className="form-select" style={"border-top-right-radius: 0; border-bottom-right-radius: 0;"}>
                                        <option className="" selected></option>
                                        <option className="text-center fw-bold" value={undefined} disabled>Game</option>
                                        <For each={["Score", "Favorite"]}>
                                            {(sort) => <option value={sort.toLocaleLowerCase()}>{sort}</option>}
                                        </For>
                                        <option className="text-center fw-bold" value={undefined} disabled>Record</option>
                                        <For each={["Name", "Status", "Playtime", "Platform", "Platform Store", "Started Date", "Updated Date", ""]}>
                                            {(sort) => <option value={sort.toLocaleLowerCase()}>{sort}</option>}
                                        </For>
                                    </select>
                                </div>
                                <div className="border-start" style={"width: 30%;"}>
                                    <select className="form-select" style={"border-top-left-radius: 0; border-bottom-left-radius: 0;"}>
                                        <option value="DESC">desc</option>
                                        <option value="ASC">asc</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* <div style={"width: 30%;"}>
                            <div>Filter:</div>
                            <select className="form-select">
                                <option value={""} selected></option>
                                <For each={["Favorite", "Score", "Playing", "Completed", "Pause", "Dropped", "Planned"]}>
                                    {(ezFilter) => <option value={ezFilter}>{ezFilter}</option>}
                                </For>
                            </select>
                        </div> */}
                    </div>
                    <div className="d-flex justify-content-between">
                        <div>
                            {/* <button type="button" className="btn btn-secondary px-5">
                                Advance Filter
                            </button> */}
                        </div>
                        <div>
                            <button type="submit" className="btn btn-warning px-5 me-2">
                                Apply
                            </button>
                            <button type="button" className="btn btn-danger px-3">
                                Reset
                            </button>
                        </div>
                    </div>
                </form>
            </div>

        </div >
    );
}

export default UserRecordFilter;