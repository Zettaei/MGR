const config = {
    api_path: "http://localhost:3000",

    MIN_USERNAME_LENGTH: 2,
    MAX_USERNAME_LENGTH: 24,
    MIN_PASSWORD_LENGTH: 6,
    MAX_PASSWORD_LENGTH: 64,

    EMAIL_REGEX: /^[\w!#$%&'*+/=?`{|}~^-]+(?:\.[\w!#$%&'*+/=?`{|}~^-]+)*@↵(?:[A-Z0-9-]+\.)+[A-Z]{2,6}$/,
    USERNAME_REGEX: /^[a-zA-Z0-9_]*$/,
    PASSWORD_REGEX: /^[ -~]*$/,
    TAG_REGEX: /^[0-9A-Z]*$/,
    TAG_LENGTH: 8,
    // USERNAME_REGEX: /[^ -~]/,
    // PASSWORD_REGEX: /[^ -~]/,

    USERTAG_LENGTH: 8,

    PREVENT_PAGE_REFRESH_DELAY_IN_SECONDS: 12,
    GAMES_SEARCHED_PER_PAGE: 30,
    GAMERECORDS_SEARCHED_PER_PAGE: 20,

    USERRECORD_NAME_LENGTH: 20,

    REVIEWS_SEARCHED_PER_PAGE: 20,

    SWAL_SUCCESS_TIMER_2: 2000,
    SWAL_SUCCESS_TIMER_3: 3000,
    SWAL_SUCCESS_TIMER_4: 4000,

    auth_header: (currentUser) => {
        return {
            withCredentials: true,
            headers: {
                Authorization: "Bearer " + currentUser().access
            }
        }
    }

}

export default config;