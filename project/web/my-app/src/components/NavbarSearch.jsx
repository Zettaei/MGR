// import searchGame from "../data/searchKey";
import { useNavigate } from "@solidjs/router";
import { createSignal, onMount } from "solid-js";
import searchURL from "../global/searchURL";

function NavbarSearch({ isLoading }) {

    const navigate = useNavigate();
    const [input, setInput] = createSignal("");

    // vvv enter some / or %= it will go wrong either 404 or URL malformed
    // may be try using JS URLSearchParams later?

    onMount(() => {
        setInput(searchURL.gameURL());
    })

    function handleSubmit(e) {
        e.preventDefault();
        if (!isLoading()) {
            searchURL.setGameURL(input());
            navigate("/search" + "/" + encodeURI(input()) + "/1");
        }
    }

    return (
        <form class="d-flex" role="search"
            onSubmit={isLoading() ? ()=>{} : handleSubmit}>
            <input class="form-control me-1" type="search" placeholder="Search Game" aria-label="Search"
            size="36"
            style={"min-width: 40px;"}
                onChange={(e) => { setInput(e.target.value); }}
                value={searchURL.gameURL()}
            />
            <button class={"btn btn-outline-" + (isLoading() ? "secondary" : "success")} type="submit"
                style={isLoading() ? "pointer-events: none;" : ""}>
                <span className="fa fa-search" />
            </button>
        </form>
    );
}

export default NavbarSearch;