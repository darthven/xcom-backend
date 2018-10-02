export class GoodsSort {
    public $sort: any

    constructor(sort?: string, order?: string) {
        if (!sort && !order) {
            sort = 'top'
            order = 'desc'
        }
        const orderSign = order === 'desc' ? -1 : 1
        if (sort === 'top') {
            this.$sort = { img: orderSign }
        } else if (sort === 'price') {
            this.$sort = { price: orderSign }
        } else if (sort === 'name') {
            this.$sort = { name: orderSign }
        }
    }
}
