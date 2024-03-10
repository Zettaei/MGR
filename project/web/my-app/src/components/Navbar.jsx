import { Show } from "solid-js";
import NavbarAccount from "./NavbarAccount";
import NavbarLogin from "./NavbarLogin";
import user from "../global/currentUser";
import { A } from "@solidjs/router";
import NavbarSearch from "./NavbarSearch";


function Navbar(props) {

    function Bar({ isLoading }) {
        return (
            <div class="collapse navbar-collapse Navbar">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item fw-bold" style={"line-height: 1.4rem; font-size: 1.2rem;"}>
                        <A class="nav-link pe-3" style={isLoading() ? "pointer-events: none; color: grey;" : "color: white;"}
                            aria-current="page" href="/">
                            <div>MGR</div>
                        </A>
                    </li>
                    <Show when={user.currentUser().username && user.currentUser().tag} fallback={""}>
                        <li class="nav-item border-start">
                            <A class="nav-link Button" style={isLoading() ? "pointer-events: none; color: grey;" : "color: white;"}
                                href={"/record/" + user.currentUser().username + "-" + user.currentUser().tag}>
                                My Record
                            </A>
                        </li>
                    </Show>

                    <li class="nav-item border-start">
                        <A class="nav-link Button" style={isLoading() ? "pointer-events: none; color: grey;" : "color: white;"}
                            href="/searchUser/">
                            Find User
                        </A>
                    </li>

                </ul>

                <div>
                    <NavbarSearch isLoading={isLoading} />
                </div>

                <Show when={user.currentUser().username} fallback={<NavbarLogin isLoading={isLoading}/>}>
                    <NavbarAccount user={user} isLoading={isLoading} />
                </Show>
            </div>
        )
    }

    return (
        <>
            <nav class="navbar navbar-expand bg-dark position-fixed top-0 w-100" style={"z-index: 1030;"}>
                <div class="container-fluid">

                        <Bar isLoading={user.isLoading} />

                </div>
            </nav >
            <div className="container-lg" style={"margin-top: 100px;"}>
                {props.children}
            </div>
        </>
    );
}

export default Navbar;