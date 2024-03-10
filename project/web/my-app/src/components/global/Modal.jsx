export function closeModal(modalId) {
    document.getElementById(modalId + "Close").click();
}

function Modal(props) {

    const modalId = props.id;
    const modalTitle = props.title;
    const modalSize = "modal-dialog" + (props.size ? " modal-" + props.size : "");
    const btnClose = props.id + "Close";
    const backdrop = props.backdrop ? props.backdrop : true;

    return (
        <div draggable="false" class="modal fade" data-bs-backdrop={backdrop} tabindex="-1" id={modalId}>
            <div class={modalSize}>
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{modalTitle}</h5>
                        <button style={"display: none;"} id={btnClose} type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        {props.children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Modal;