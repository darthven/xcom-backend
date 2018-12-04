export interface SbolResponse {
    /**
     * Код ошибки.
     */
    errorCode?: string

    /**
     * Описание ошибки на языке, переданном в параметре language в запросе.
     */
    errorMessage?: string
}
