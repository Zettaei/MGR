import dayjs from "dayjs";

function convertToDateStr(date) {
    if(date === null) {
        return "";
    }

    return dayjs(date).format("DD-MM-YYYY");
}

function convertToFullDateStr(date) {
    if(date === null) {
        return "";
    }

    return dayjs(date).format("DD-MM-YYYY | HH:mm:ss");
}

export default {
    convertToDateStr,
    convertToFullDateStr
};