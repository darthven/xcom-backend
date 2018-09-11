export declare abstract class Repository {
    readonly name: string;
    protected constructor(name: string);
    createCollection(): Promise<void>;
    dropCollection(): Promise<null | undefined>;
    readonly collection: import("mongodb").Collection<any>;
}
