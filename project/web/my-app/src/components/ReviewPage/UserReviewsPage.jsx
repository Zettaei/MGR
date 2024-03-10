import Axios from "axios";
import { For, Show, createSignal, onMount } from "solid-js";
import config from "../../../config";
import { A, useParams } from "@solidjs/router";
import user from "../../global/currentUser";
import UserReviewPageControl from "./UserReviewsPageControl";
import convertDate from "../../utils/convertDate";

function UserProfileReviewPage() {

    const params = useParams();
    const [isLoading, setIsLoading] = createSignal();
    const [reviewList, setReviewList] = createSignal([]);
    const [pageth, setPageth] = createSignal();
    const [pageCount, setPageCount] = createSignal();
    const [userInfo, setUserInfo] = createSignal({});

    async function fetchReviews(username, tag, pageth) {
        console.log(username, tag);
        return await Axios.get(config.api_path + ("/user/" + username + "/" + tag + "/reviews/" + pageth))
            .then((res) => {
                if (res.status === 200) {
                    return res.data;
                }
            })
            .catch(() => {
                return {};
            });
    }

    function fetchFunction(pageth) {
        const data = fetchReviews(userInfo().username, userInfo().tag, pageth);
        setReviewList(data.reviews);
        setPageCount(data.pageCount);
    }

    function getReviewPageURL(reviewId) {
        return window.location.href.replace(/\/user\/[\w\W]*/, "/review/" + reviewId);
    }

    function getGamePageURL(gameId) {
        return window.location.href.replace(/\/user\/[\w\W]*/, "/game/" + gameId);
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

    function GameTitle({ gameDetail }) {
        return (
            <A href={getGamePageURL(gameDetail.id)} rel="nofollow noopener noreferrer" style={"font-size: 0.9rem;"}
                class="GameTitle link">
                <span className="fa fa-gamepad me-2" />{gameDetail.name}
            </A>
        )
    }

    function SeeMoreButton({ review }) {
        return (
            <A href={getReviewPageURL(review.id)} rel="nofollow noopener noreferrer" target="_blank">
                <div className="btn btn-secondary px-4">
                    See More<span className="fa fa-arrow-right ms-2" />
                </div>
            </A>
        )
    }

    function ReviewText({ review }) {
        return (
            <A href={getReviewPageURL(review.id)} rel="nofollow noopener noreferrer" target="_blank"
                className="ReviewText link">
                {review.review}
            </A>
        )
    }

    onMount(async () => {
        setIsLoading(true);
        setPageth(1);
        user.fetchCurrentUser();

        const [username, tag] = params.usernameWithTag.split("-");
        if (!username || !tag || tag.length !== config.USERTAG_LENGTH) {
            setReviewList(null);
            setIsLoading(false);
            return;
        }
        setUserInfo({ username, tag });
        const data = await fetchReviews(username, tag, 1);
        setReviewList(data.reviews);
        setPageCount(data.pageCount);
        setIsLoading(false);
    });

    return (
        <div className="UserReviewsPage">
            <div className="card">
                <div className="card-header">
                    <div className="d-flex justify-content-between align-items-center">
                        <div style={"font-size: 1.3rem;"}>
                            <A href={"/user/" + userInfo().username + "-" + userInfo().tag}
                                className="UsernameLink text-dark text-decoration-none"
                            >
                                <span className="fw-bold" >{userInfo().username}</span>
                            </A>
                            's Reviews
                        </div>
                        <div>
                            <span style={"font-size: 0.8rem;"}>{userInfo().tag ? (userInfo().username + "-" + userInfo().tag) : "-"}</span>
                        </div>
                    </div>
                </div>
                <Show when={!isLoading()} fallback={
                    <div className="text-center py-4">
                        <span className="fa-solid fa-spinner fa-spin-pulse fs-1" />
                    </div>
                }>

                    <div className="card-body pb-3">
                        <UserReviewPageControl list={reviewList} pageth={{ pageth, setPageth }} fetchFunction={fetchFunction} pageCount={pageCount} />
                        <hr />
                        <div className="my-3">
                            <Index each={reviewList()} fallback={
                                <>
                                    <div className="d-flex justify-content-center">
                                        no result
                                    </div>
                                    <hr />
                                </>
                            }
                            >
                                {(review, index) => {
                                    return (
                                        <div className="">
                                            <div className="position-absolute text-end end-100 me-2" style={"line-height: 1.4rem; font-size: 0.8rem;"}>
                                                {(index + ((pageth() - 1) * config.REVIEWS_SEARCHED_PER_PAGE) + 1)}
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <div className="w-25 d-flex flex-row justify-content-center">
                                                    <div className="d-flex flex-column justify-content-between">
                                                        <div className="fw-bold text-center">
                                                            <div>
                                                                <RecommendedShow review={review().review} />
                                                            </div>
                                                            <div className="mt-2">
                                                                <GameTitle gameDetail={review().gameDetail} />
                                                            </div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div style={"font-size: 0.75rem;"}>Last Modified: {convertDate.convertToDateStr(review.updatedAt)}</div>
                                                            <SeeMoreButton review={review().review} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className={"card w-75 ReviewBlock"}>
                                                    <div className="px-2" style={"font-size: 1.0rem;"}>
                                                        <ReviewText review={review().review} />
                                                    </div>
                                                </div>
                                            </div>
                                            <hr />
                                        </div>
                                    )
                                }}
                            </Index>
                        </div>
                        <UserReviewPageControl list={reviewList} pageth={{ pageth, setPageth }} fetchFunction={fetchFunction} pageCount={pageCount} />
                    </div>
                </Show>

            </div>
        </div>
    );
}

export default UserProfileReviewPage;