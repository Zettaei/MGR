import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";


const [gameList, setGameList] = createSignal([]);

const [gameDetail, setGameDetail] = createSignal({});
const [userGameRecord, setUserGameRecord] = createSignal({});
const [userRecord, setUserRecord] = createSignal([]);
const [ownReview, setOwnReview] = createSignal({});

function reset() {
    setGameDetail({});
    setUserGameRecord({});
    setUserRecord([]);
    setGameList([]);
    setOwnReview({});
}

export default {
    gameList, setGameList,
    gameDetail, setGameDetail,
    userGameRecord, setUserGameRecord,
    userRecord, setUserRecord,
    ownReview, setOwnReview,
    reset
}