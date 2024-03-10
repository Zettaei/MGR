import { A } from "@solidjs/router";

function RegisterLower() {

    return (
        <>
            <div className="card mt-3 py-3">
                <div className="">

                </div>
                <div className="me-5">
                    <div className="text-end">
                        or if you already have an account, go to 
                        <A href="/login">Log In</A>
                    </div>
                </div>
            </div>
        </>
    );
}

export default RegisterLower;