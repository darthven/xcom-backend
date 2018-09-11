import { Repository } from './repository';
export declare class CategoryRepository extends Repository {
    constructor();
    createCollection(): Promise<void>;
    getAll(search: string | undefined): Promise<any[]>;
}
