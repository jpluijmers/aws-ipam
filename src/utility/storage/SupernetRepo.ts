import {DDBRepo} from "./DDBRepo";
import {DDBSupernet} from "./DDBSupernet";
import {ContextWrapper} from "../ContextWrapper";
import {NetworkBuilder, Subnet, Supernet} from "../networking";

export class SupernetRepo extends DDBRepo<DDBSupernet>{
    public constructor(context: ContextWrapper) {
        super(context.getEnvironmentVariable('DYNAMODB_SUPERNETS_TABLE'), 'Cidr');
    }

    public async getSupernet(Env: string, Region: string): Promise<Supernet>{
        return this.scanFindExactlyOne({
            Env: Env,
            Region: Region
        }).then(result => {
            const subnet: Subnet = NetworkBuilder.fromCidr(result.Cidr);
            return new Supernet(subnet);
        } )
    }
}