import Swal from "sweetalert2";

function SwalError(err) {
    Swal.fire({
        title: "Error",
        html: err.message,
        position: "center",
        color: "red"
    });
}

export default SwalError;