export declare class RegionsController {
    private regions;
    getRegions(): Promise<any[]>;
    getRegionById(id: number): Promise<any>;
    getRegionByLatLng(lat: number, lng: number): Promise<any>;
}
