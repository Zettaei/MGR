import Navbar from "../Navbar";
import RegisterLower from "./RegisterLower";
import RegisterUpper from "./RegisterUpper";
import { createSignal } from "solid-js";

function Register() {

    return ( 
        <>
            <RegisterUpper/>
            <RegisterLower/>
        </>
     );
}

export default Register;