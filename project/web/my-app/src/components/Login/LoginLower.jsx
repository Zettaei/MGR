import { A } from "@solidjs/router";

function LoginLower() {
    return (
        <div className="card mt-3 py-3">
            <div className="">

            </div>
            <div className="me-5">
                <div className="text-end">
                    If you don't have account yet you could 
                    <A href="/register">Register</A>
                </div>
            </div>
        </div>
    );
}

export default LoginLower;