export class CategoriesQuery {
    public $text?: { $search: string }

    constructor(search?: string) {
        if (search) {
            this.$text = { $search: search }
        }
    }
}
