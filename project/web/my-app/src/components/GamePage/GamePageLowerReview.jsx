import { For, Match, Show, Switch, createEffect, createSignal, onMount } from "solid-js";
import config from "../../../config";
import Axios from "axios";
import user from "../../global/currentUser";
import ReviewEditModal from "../ReviewModal/ReviewEditModal";
import { A, useLocation } from "@solidjs/router";
import convertDate from "../../utils/convertDate";
import GamePageLowerReviewPageControl from "./GamePageLowerReviewPageControl";

function GamePageLowerReview({ keepList }) {

    const [pageCount, setPageCount] = createSignal();
    const [pageth, setPageth] = createSignal();
    const [reviewListIsLoading, setReviewListIsLoading] = createSignal();
    const [currentReviewList, setCurrentReviewList] = createSignal([]);

    async function fetchGameReviews(gameId, pageth) {
        return await Axios.get(config.api_path + "/game/id/" + gameId + "/reviews/" + pageth)
            .then((res) => {
                return res.data;
            })
            .catch((err) => {
                return [];
            });
    }

    function getReviewPageURL(reviewId) {
        return window.location.href.replace(/\/game\/[\w\W]*/, "/review/" + reviewId);

    }

    onMount(async () => {
        setReviewListIsLoading(true);
        setPageth(1);
        await fetchGameReviews(keepList.gameDetail().id, 1)
            .then((data) => {
                setPageth(parseInt(data.pageth));
                setCurrentReviewList(data.reviewsList);
                setPageCount(data.pageCount);
            });

        setReviewListIsLoading(false);
    });

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

    function RecommendedShowOwner({ review }) {
        return (
            <Switch>
                <Match when={!review()}>
                    <span className="text-dark">
                        -
                    </span>
                </Match>
                <Match when={review().recommended === 1}>
                    <span className="text-success">
                        <span className="fa fa-thumbs-up me-2" />
                        Recommended
                    </span>
                </Match>
                <Match when={review().recommended === 0}>
                    <span className="text-secondary">
                        <span className="fa fa-ellipsis me-2" />
                        Uncertained
                    </span>
                </Match>
                <Match when={review().recommended === -1}>
                    <span className="text-danger">
                        <span className="fa fa-thumbs-down me-2" />
                        Not Recommended
                    </span>
                </Match>
            </Switch>
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

    function SeeMoreButtonOwner({ review }) {
        return (
            <A href={getReviewPageURL(review.id)} rel="nofollow noopener noreferrer" target="_blank">
                <div className="btn btn-secondary rounded-end-0 px-3">
                    <span className="fa fa-arrow-right" />
                </div>
            </A>
        )
    }

    function ReviewText({ review }) {
        return (
            <A href={getReviewPageURL(review()?.id)} rel="nofollow noopener noreferrer" target="_blank"
                className="ReviewText link">
                {review().review}
            </A>
        )
    }

    function fetchFunction(pageth) {
        fetchGameReviews(keepList.gameDetail().id, pageth);
    }

    return (
        <>
            <div className="mb-5">
                <Show when={user.currentUser().username && user.currentUser().tag} >
                    <div className="card mb-3">
                        <div className="card-header">
                            Your Review
                        </div>
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div className="w-25">
                                    <div className="h-100 d-flex flex-column justify-content-between align-items-center">
                                        <div className="fw-bold text-center" style={"font-size: 1.1rem;"}>
                                            <div>
                                                <RecommendedShowOwner review={keepList.ownReview} />
                                            </div>
                                            <div className="mt-2">
                                                <A href={"/user/" + user.currentUser().username + "-" + user.currentUser().tag}
                                                    className="UsernameLink text-dark">
                                                    <span className="fa fa-house-user me-2" />{user.currentUser().username}
                                                </A>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div style={"font-size: 0.75rem;"}>Last Modified: {convertDate.convertToDateStr(keepList.ownReview().updatedAt)}</div>
                                            <Show when={keepList.ownReview().review} fallback={
                                                <button className={"px-5 py-2 btn btn-success"}
                                                    data-bs-toggle="modal" data-bs-target="#ReviewEditModal"
                                                >
                                                    <span className="fa fa-plus me-2" />Add
                                                </button>
                                            }>
                                                <div className="d-flex">
                                                    <SeeMoreButtonOwner review={keepList.ownReview()} />
                                                    <button className="px-4 btn btn-warning rounded-start-0"
                                                        data-bs-toggle="modal" data-bs-target="#ReviewEditModal"
                                                    >
                                                        <span className="fa fa-pencil me-2" />Edit
                                                    </button>
                                                </div>
                                            </Show>
                                        </div>
                                    </div>
                                </div>

                                <div className="card w-75 ReviewBlock">
                                    <Show when={keepList.ownReview().review} fallback={
                                        <div className="h-100 d-flex justify-content-center align-items-center">
                                            none
                                        </div>
                                    }>
                                        <div className="px-2" style={"font-size: 1.0rem;"}>
                                            <ReviewText review={keepList.ownReview} />
                                        </div>
                                    </Show>
                                </div>
                            </div>
                        </div>

                    </div>
                </Show>

                <div className="card">
                    <div className="card-header">
                        Other Reviews
                    </div>
                    <Show when={!reviewListIsLoading()} fallback={
                        <div className="py-3">
                            <div className="d-flex justify-content-center">
                                <span className="fa-solid fa-spinner fa-spin-pulse fs-1" />
                            </div>
                        </div>
                    }>
                        <div className="card-body w-100">

                            <GamePageLowerReviewPageControl list={currentReviewList} fetchFunction={fetchFunction} pageth={{ pageth, setPageth }} pageCount={pageCount} />

                            <hr />
                            <div style={"font-size: 1.1rem;"}>
                                <For each={currentReviewList()} fallback={
                                    <>
                                        <div className="d-flex justify-content-center">
                                            no result
                                        </div>
                                        <hr />
                                    </>
                                }>
                                    {(review) => {
                                        // 
                                        // 
                                        // 
                                        // CHANGE TO vvv {review.id === keepList.ownReview().id}
                                        // 
                                        // 
                                        // 
                                        return (
                                            <Show when={review.id !== keepList.ownReview().id} fallback={
                                                <Show when={currentReviewList().length === 1}>
                                                    <div className="d-flex justify-content-center">
                                                        no result
                                                    </div>
                                                    <hr />
                                                </Show>
                                            }>
                                                <div className="d-flex justify-content-between">
                                                    <div className="w-25 d-flex flex-row justify-content-center">
                                                        <div className="d-flex flex-column justify-content-between">
                                                            <div className="fw-bold">
                                                                <div>
                                                                    <RecommendedShow review={review} />
                                                                </div>
                                                                <div className="text-center mt-2">
                                                                    <A href={"/user/" + review.user.username + "-" + review.user.tag}
                                                                        className="UsernameLink text-dark">
                                                                        <span className="fa fa-user me-2" />{review.user.username}
                                                                    </A>
                                                                </div>
                                                            </div>
                                                            <div className="text-center">
                                                                <div style={"font-size: 0.75rem;"}>Last Modified: {convertDate.convertToDateStr(review.updatedAt)}</div>
                                                                <SeeMoreButton review={review} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className={"card w-75 ReviewBlock"}>
                                                        <div className="px-2" style={"font-size: 1.0rem;"}>
                                                            <ReviewText review={() => review} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <hr />
                                            </Show>
                                        )
                                    }}
                                </For >
                            </div>

                            <GamePageLowerReviewPageControl list={currentReviewList} fetchFunction={fetchFunction} pageth={{ pageth, setPageth }} pageCount={pageCount} />

                        </div>

                    </Show >
                </div>
            </div>

            <ReviewEditModal keepList={keepList} />
        </>
    );
}

export default GamePageLowerReview;