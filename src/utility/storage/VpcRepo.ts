import {DDBRepo} from "./DDBRepo";
import {DDBSupernet} from "./DDBSupernet";
import {ContextWrapper} from "../ContextWrapper";
import {NetworkBuilder, NetworkPrinter, Subnet, Supernet} from "../networking";
import {DDBVpc} from "./DDBVpc";

export class VpcRepo extends DDBRepo<DDBVpc>{
    public constructor(context: ContextWrapper) {
        super(context.getEnvironmentVariable('DYNAMODB_VPC_TABLE'), 'Cidr');
    }
    
    public async getSubnets(Env: string, Region: string): Promise<Subnet[]>{
        return this.scan({
            Env: Env,
            Region: Region
        }).then(result => {
            return result.map( item => NetworkBuilder.fromCidr(item.Cidr) );
        } )
    }

    public async storeSubnet(subnet: Subnet, AccountId: string, Env: string, ProjectCode: string, Reason: string,
                             Region: string, Requestor: string): Promise<string>{
        return this.write(<DDBVpc>{
            Cidr: NetworkPrinter.formatCidr(subnet),
            AccountId: AccountId,
            Env: Env,
            ProjectCode: ProjectCode,
            Reason: Reason,
            Region: Region,
            Requestor: Requestor
        });
    }

    public async getSupernetByVpcId(VpcId: string): Promise<Supernet>{
        return this.scanFindExactlyOne({
            VpcId: VpcId
        }).then(result => {
            const subnet: Subnet = NetworkBuilder.fromCidr(result.Cidr);
            return new Supernet(subnet);
        } )
    }

    public async getVpcById(VpcId: string): Promise<DDBVpc>{
        return this.scanFindExactlyOne({
            VpcId: VpcId
        });
    }


    public async getVpcByCidr(cidr: string): Promise<DDBVpc>{
        return this.read(cidr);
    }

    public async deleteVpcByCidr(cidr: string): Promise<string>{
        return this.delete(cidr);
    }
}