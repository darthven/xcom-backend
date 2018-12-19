export interface Category {
    id: number
    name: string
    parentId: number
    level: number
    productCount: number
    listOrder?: number | undefined
}
