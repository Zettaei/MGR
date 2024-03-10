import { ErrorBoundary, Show, createEffect, createSignal, onMount } from "solid-js";
import SearchBlock from "./SearchBlock";
import user from "../../global/currentUser";


function Search() {
    const [key, setKey] = createSignal("");
    const [isLoading, setIsLoading] = createSignal();

    onMount(async () => {
        setIsLoading(true);
        await user.fetchCurrentUser();
        setIsLoading(false);
    })

    return (
        <ErrorBoundary fallback={<pre>error happened, try refresh page or avoid forbidden characters</pre>} >
            <div className="d-flex justify-content-between">
                <div className="h2">
                    <span className="text-start">
                        <Show when={key()} fallback={"Search All"}>
                            Search: {'"' + key() + '"'}
                        </Show>
                    </span>
                </div>
            </div>

            <SearchBlock key={key} setKey={setKey} />
            
        </ErrorBoundary >
    );
}

export default Search;