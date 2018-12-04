export class GoodsSort {
    public $sort: any

    constructor(sort?: string, order?: string, searchQuery?: string) {
        if (!sort) {
            sort = 'top'
        }
        if (!order) {
            order = 'desc'
        }
        const orderSign = order === 'desc' ? -1 : 1
        if (sort === 'price') {
            this.$sort = { price: orderSign }
        } else if (sort === 'name') {
            this.$sort = { name: orderSign }
        } else {
            if (searchQuery) {
                // search based on relevance score
                this.$sort = {
                    score: { $meta: 'textScore' },
                    img: orderSign
                }
            } else {
                this.$sort = {
                    img: orderSign
                }
            }
        }
    }
}
