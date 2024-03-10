import { useNavigate, useLocation } from "@solidjs/router";

function NavbarLogin({ isLoading }) {
    const navigate = useNavigate();
    const location = useLocation();

    function handleLoginRegister() {
        if (!isLoading()) {
            if (location.pathname === "/login") {
                navigate("/register");
            }
            else {
                navigate("/login");
            }
        }
    }

    return (
        <button class={"ms-5 btn btn-outline-" + (isLoading() ? "secondary" : "info")}
            style={isLoading() ? "pointer-events: none;" : ""}
            onClick={handleLoginRegister}>
            Login/Register
        </button>
    );
}

export default NavbarLogin;