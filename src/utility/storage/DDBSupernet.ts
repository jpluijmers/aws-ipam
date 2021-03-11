import {DDBDto} from "./DDBDto";

export interface DDBSupernet extends DDBDto{
    Cidr: string;
    Env: string;
    Region: string;
}