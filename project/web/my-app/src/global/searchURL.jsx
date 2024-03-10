import { createSignal } from "solid-js";

// vvv enter some / or %= it will go wrong either 404 or URL malformed
// may be try using JS URLSearchParams later?
// ALSO THIS IS MAINLY FOR SIGNALING NAVBAR and SEARCH
const [gameURL, setGameURL] = createSignal("");

export default { gameURL, setGameURL };