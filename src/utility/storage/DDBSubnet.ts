import {DDBDto} from "./DDBDto";

export interface DDBSubnet extends DDBDto{
    Cidr: string;
    VpcId: string;
    AccountId: string;
    Region: string;
    Env: string;
    ProjectCode: string;
    AvailabilityZone?: string;
    SubnetId?: string;
}