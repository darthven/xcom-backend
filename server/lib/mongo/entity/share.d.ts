import { CSVData } from '../../common/definitions';
export declare class Share {
    id: number;
    goodId: number;
    discountValue: number;
    packCount: number;
    attributeZOZ: boolean;
    startDate: Date;
    endDate: Date;
    description: string;
    regions: number[];
    constructor(csvRowData: CSVData);
}
