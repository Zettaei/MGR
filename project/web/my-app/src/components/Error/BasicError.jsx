import { A } from "@solidjs/router";

function BasicError(props) {
    return (
        <div className="text-center mt-5" style={{ height: "100vh" }}>
            <div className="h1 text-danger">{props.title}</div>
            <div className="h2">{props.message}</div>
            <div className="h4 mt-5 p-2 bg-dark text-white">go back to <A href="/">MGR</A></div>
        </div>
    );
}

export default BasicError;