import {DDBRepo} from "./DDBRepo";
import {ContextWrapper} from "../ContextWrapper";
import {NetworkBuilder, NetworkPrinter, Subnet, Supernet} from "../networking";
import {DDBVpc} from "./DDBVpc";
import {DDBSubnet} from "./DDBSubnet";

export class SubnetRepo extends DDBRepo<DDBSubnet>{
    public constructor(context: ContextWrapper) {
        super(context.getEnvironmentVariable('DYNAMODB_SUBNETS_TABLE'), 'Cidr');
    }
    
    public async getSubnets(VpcId: string): Promise<Subnet[]>{
        return this.scan({
            VpcId: VpcId
        }).then(result => {
            return result.map( item => NetworkBuilder.fromCidr(item.Cidr) );
        } )
    }

    public async storeSubnet(subnet: Subnet, VpcId: string ): Promise<string>{
        return this.write(<DDBSubnet>{
            Cidr: NetworkPrinter.formatCidr(subnet),
            VpcId: VpcId
        });
    }

    public async getByCidr(cidr: string): Promise<DDBSubnet>{
        return this.read(cidr);
    }

    public async deleteByCidr(cidr: string): Promise<string>{
        return this.delete(cidr);
    }
}