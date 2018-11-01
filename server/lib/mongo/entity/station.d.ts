import { Location } from './location';
export interface Station {
    id: number;
    name: string;
    location: Location;
    city: string;
    line: {
        name: string;
        color: string;
    };
}
