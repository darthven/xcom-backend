export declare class CategoriesController {
    private categories;
    getCategories(query?: string): Promise<any[]>;
    getCategoryById(id: number): Promise<any>;
}
