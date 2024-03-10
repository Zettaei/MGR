import { Show, createEffect, createSignal, onMount } from "solid-js";
import { useLocation, useParams, useSearchParams } from "@solidjs/router";
import Axios from "axios";
import config from "../../../config";
import convertDate from "../../utils/convertDate";

function ReviewPage() {

    const location = useLocation();
    const params = useParams();
    const [review, setReview] = createSignal({});
    const [isLoading, setIsLoading] = createSignal();


    async function fetchReview(reviewId) {
        return await Axios.get(config.api_path + "/review/" + reviewId)
            .then(async (res) => {
                return await res.data;
            });
    }

    function RecommendedShow({ review }) {
        return (
            <Switch>
                <Match when={review.recommended === 1}>
                    <span className="text-success">
                        <span className="fa fa-thumbs-up me-2" />
                        Recommended
                    </span>
                </Match>
                <Match when={review.recommended === 0}>
                    <span className="text-secondary">
                        <span className="fa fa-ellipsis me-2" />
                        Uncertained
                    </span>
                </Match>
                <Match when={review.recommended === -1}>
                    <span className="text-danger">
                        <span className="fa fa-thumbs-down me-2" />
                        Not Recommended
                    </span>
                </Match>
            </Switch>
        )
    }

    onMount(async () => {
        setIsLoading(true);
        const reviewId = Math.floor(params.id);
        if (isNaN(reviewId) || (reviewId - parseFloat(params.id)) !== 0 || reviewId < 0) {
            setReview({});
            setIsLoading(false);
            return;
        }

        setReview(await fetchReview(reviewId));
        setIsLoading(false);
    });

    function handleCloseButtonClick() {
        window.close();
    }

    return (
        <div className="ReviewPage">
            <div className="container py-5">

                <Show when={!isLoading()} fallback={
                    <div className="card text-center py-4">
                        <span className="fa-solid fa-spinner fa-spin-pulse fs-1" />
                    </div>
                }>
                    <div className="card mb-3">

                        <div className="card-header">
                            Review #{params.id}
                        </div>
                        <div className="card-body px-4 py-4">

                            <Show when={review().review} fallback={
                                <div className="text-center">review is not found</div>
                            }>
                                <div className="mb-2">
                                    <div className="d-flex justify-content-between">
                                        <div className="w-50">
                                            <div className="mb-4">
                                                <div>
                                                    Username: <span className="fw-bold">{review().review.user.username}</span>
                                                </div>
                                                <div>
                                                    Tag: <span className="fw-bold">{review().review.user.tag}</span>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <div>
                                                    Review created: <span className="fw-bold">{convertDate.convertToFullDateStr(review().review.createdAt)}</span>
                                                </div>
                                                <div>
                                                    Review last modified: <span className="fw-bold">{convertDate.convertToFullDateStr(review().review.updatedAt)}</span>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="fw-bold" style={"font-size: 1.2rem;"}>
                                                    <RecommendedShow review={review().review} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-50 GameDetailBlock">
                                            <div className="d-flex align-items-start justify-content-end">
                                                <div className="text-end me-3">
                                                    <div>Game Title: </div>
                                                    <div className="fw-bold">{review().gameDetail.name}</div>
                                                </div>
                                                <div>
                                                    <img className="GameImage" src={review().gameDetail.cover.url.replace("t_thumb", "t_cover_big")} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card w-100 h-100 px-3 py-3 mb-4">
                                    <span className="ReviewText">{review().review.review}</span>
                                </div>

                                <div className="text-center">
                                    <button className="btn btn-danger px-5 py-2" onClick={handleCloseButtonClick}>
                                        <span className="fa fa-close me-2" />Close Tab
                                    </button>
                                </div>
                            </Show>
                        </div>
                    </div>
                </Show>
            </div >
        </div >

    );
}

export default ReviewPage;