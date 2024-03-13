import { Show, createEffect, createSignal, onMount } from "solid-js";
import Modal, { closeModal } from "../global/Modal";
import Axios from "axios";
import AuthAxiosFunc from "../../utils/AuthAxiosFunc";
import config from "../../../config";
import user from "../../global/currentUser";
import Swal from "sweetalert2";
import SwalError from "../../utils/SwalError";

function ReviewEditModal({ keepList }) {

    const [recommendedChoice, setRecommendedChoice] = createSignal();
    let reviewInput;

    const [recommended, setRecommended] = createSignal();
    const [review, setReview] = createSignal();
    const [isSubmitting, setIsSubmitting] = createSignal();

    async function addReview({ recommended, review }) {

        await AuthAxiosFunc.retryableAxios(async () => {
            return await Axios.post(config.api_path + "/game/id/" + keepList.gameDetail().id + "/reviews/add", {
                recommended: recommended,
                review: review
            }, config.auth_header(user.currentUser))
                .then((res) => {
                    if (AuthAxiosFunc.userRefresh(res)) return false;

                    if (res.status === 200) {
                        keepList.setOwnReview({
                            id: res.data.id,
                            gameId: keepList.ownReview().gameId,
                            recommended: res.data.recommended,
                            review: res.data.review,
                            createdAt: keepList.ownReview().createdAt,
                            updatedAt: res.data.updatedAt
                        });
                        reviewInput.value = res.data.review;
                        
                        closeModal("ReviewEditModal");
                        return true;
                    }
                })
                .catch((err) => {
                    Swal.fire({
                        title: "error",
                        text: err.message,
                        icon: "error"
                    });

                    return true;
                });
        });
    }

    async function deleteReview(reviewId) {
        await AuthAxiosFunc.retryableAxios(async () => {
            return await Axios.delete(config.api_path + "/review/" + reviewId + "/delete", config.auth_header(user.currentUser))
            .then((res) => {
                if(AuthAxiosFunc.userRefresh(res)) return false;

                if(res.status === 200) {
                    closeModal("ReviewEditModal");
                    keepList.setOwnReview({});
                    Swal.fire({
                        title: "Delete Review",
                        html: "Your review for<span style='font-weight: bold;'> " + keepList.gameDetail().name + "</span> has been deleted",
                        timer: config.SWAL_SUCCESS_TIMER_3
                    });
                    return true;
                }
            })
            .catch((err) => {
                SwalError(err);
                return true;
            })
        });
    }

    createEffect(() => {
        if (keepList.ownReview().review) {
            setRecommended(keepList.ownReview().recommended);
            setRecommendedChoice(keepList.ownReview().recommended);
            setReview(keepList.ownReview().review);
        }
        else {
            setRecommended(0);
            setRecommendedChoice(0);
            setReview("");
        }
        reviewInput.value = review();
    })

    function submitReview(e) {
        e.preventDefault();
        setIsSubmitting(true);

        addReview({
            recommended: recommendedChoice(),
            review: reviewInput.value
        })
            .finally(() => {
                setIsSubmitting(false);
            });
    }

    function handleDeleteReview(e) {
        setIsSubmitting(true);
        Swal.fire({
            title: "Delete Review",
            html: "Delete your review for<span style='font-weight: bold;'> " + keepList.gameDetail().name + "</span>",
            showConfirmButton: true,
            showCancelButton: true
        })
        .then(async (swalRes) => {
            if(swalRes.isConfirmed) {
                await deleteReview(keepList.ownReview().id);
            }
        })
        .finally(() => {
            setIsSubmitting(false);
        })
    }

    return (
        <>
            <Modal id="ReviewEditModal" title={"Edit Review"} size="lg" backdrop="static">
                <div className="px-4 mt-3">
                    <div className="h4 mb-5">{keepList.gameDetail().name}</div>

                    <form onSubmit={submitReview} >
                        <div className="btn-group w-100" role="group" aria-label="radio toggle button group" style={"height: 80px;"}>
                            <input type="radio" className="btn-check" name="status" id={"recommended-recommended"} autocomplete="off" value={1}
                                onClick={() => { setRecommendedChoice(1); }} checked={recommended() === 1} />
                            <label className={"btn btn-outline-success"} style={"border: 1px solid lightgray;"} for={"recommended-recommended"}
                                value={1}>
                                <span className="fa-solid fa-thumbs-up fa-2xl mb-4" style={"margin-top: 18px;"} />
                                <div style="font-size: 0.9rem;">{"Recommended"}</div>
                            </label>

                            <input type="radio" className="btn-check" name="status" id={"recommended-uncertained"} autocomplete="off" value={0}
                                onClick={() => { setRecommendedChoice(0); }} checked={recommended() === 0} />
                            <label className={"btn btn-outline-secondary"} style={"border: 1px solid lightgray;"} for={"recommended-uncertained"}
                                value={0}>
                                <span className="fa-solid fa-ellipsis fa-2xl mb-4" style={"margin-top: 18px;"} />
                                <div style="font-size: 0.9rem;">{"Uncertained"}</div>
                            </label>

                            <input type="radio" className="btn-check" name="status" id={"recommended-notrecommended"} autocomplete="off" value={-1}
                                onClick={() => { setRecommendedChoice(-1); }} checked={recommended() === -1} />
                            <label className={"btn btn-outline-danger"} style={"border: 1px solid lightgray;"} for={"recommended-notrecommended"}
                                value={-1}>
                                <span className="fa-solid fa-thumbs-down fa-2xl mb-4" style={"margin-top: 18px;"} />
                                <div style="font-size: 0.9rem;">{"Not Recommended"}</div>
                            </label>
                        </div>
                        <div className="mt-4 mb-5">
                            <textarea className="form-control" style={"height: 400px;"} ref={(ref) => { reviewInput = ref; }} required>

                            </textarea>
                        </div>

                        <div className="d-flex justify-content-between flex-row-reverse pb-2">
                            <Show when={!isNaN(keepList.ownReview().recommended)} fallback={
                                <>
                                    <div>
                                        <button type="submit" className="btn btn-warning px-3 ms-2" disabled={isSubmitting()}>
                                            <span className="fa fa-plus me-2" />Add Review
                                        </button>
                                        <input type="button" className="btn btn-danger px-3 ms-2" data-bs-dismiss="modal" value={"Cancel"} disabled={isSubmitting()} />
                                    </div>
                                    <div>

                                    </div>
                                </>
                            }>
                                <>
                                    <div>
                                        <button type="submit" className="btn btn-warning px-3 ms-2" disabled={isSubmitting()}>
                                            <span className="fa fa-floppy-disk me-2" />Save Change
                                        </button>
                                        <input type="button" className="btn btn-danger px-3 ms-2" data-bs-dismiss="modal" value={"Cancel"} disabled={isSubmitting()} />
                                    </div>
                                    <div>
                                        <button type="button" className="btn btn-danger px-3" onClick={handleDeleteReview} disabled={isSubmitting()}>
                                            <span className="fa fa-trash me-2" />Delete
                                        </button>
                                    </div>
                                </>
                            </Show>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}

export default ReviewEditModal;