import 'source-map-support/register';
import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult
} from 'aws-lambda';
import {ContextWrapper} from "../../utility/ContextWrapper";
import {VpcRepo} from "../../utility/storage";
import {NetworkPrinter} from "../../utility/networking";
import {SubnetRepo} from "../../utility/storage/SubnetRepo";
import {DDBSubnet} from "../../utility/storage/DDBSubnet";
/**
 * A simple example includes a HTTP get method.
 */
export const postHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    var response;
    try {
        console.log("Received event:"+JSON.stringify(event));

        const context = new ContextWrapper(event);
        const VpcId = context.getRequestParameter('vpcid');

        // Fetch VPC as Supernet
        let VpcsRepo = new VpcRepo(context);
        let supernet = await VpcsRepo.getSupernetByVpcId(VpcId);
        let vpc = await VpcsRepo.getVpcById(VpcId);

        // Fetch used VPC subnets
        let SubnetsRepo = new SubnetRepo(context);
        let usedSubnets = await SubnetsRepo.getSubnets(VpcId);

        supernet.registerSubnets(usedSubnets);

        const subnetAllocation = supernet.allocateSubnet(parseInt(context.getRequestParameter('prefix')));

        const subnet = <DDBSubnet>{
            Cidr: NetworkPrinter.formatCidr(subnetAllocation),
            VpcId: VpcId,
            AccountId: vpc.AccountId,
            Region: vpc.Region,
            Env: vpc.Env,
            ProjectCode: vpc.ProjectCode
        };

        const result = await SubnetsRepo.write(subnet);

        const cidr = NetworkPrinter.formatCidr(subnetAllocation);
        response = {
            statusCode: 200,
            body: JSON.stringify({cidr: cidr})
        };
    } catch (error) {
        response = {
            statusCode: 500,
            body: JSON.stringify({
                message: error.message,
            })
        };
    }
    console.log("Response: " + JSON.stringify(response));
    return response;
}