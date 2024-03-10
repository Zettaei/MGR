import Swal from "sweetalert2";

function SwalError(err) {
    Swal.fire({
        title: "error",
        html: err.message,
        position: "center"
    });
}

export default SwalError;