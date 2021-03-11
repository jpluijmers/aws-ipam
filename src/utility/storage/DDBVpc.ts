import {DDBDto} from "./DDBDto";

export interface DDBVpc extends DDBDto{
    Cidr: string;
    AccountId: string;
    Env: string;
    ProjectCode: string;
    Reason?: string;
    Region: string;
    Requestor: string;
    VpcId?: string;
}