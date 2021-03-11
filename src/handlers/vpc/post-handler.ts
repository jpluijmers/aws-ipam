import 'source-map-support/register';
import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult
} from 'aws-lambda';
import {ContextWrapper} from "../../utility/ContextWrapper";
import {DDBSupernet, DDBRepo, SupernetRepo, VpcRepo} from "../../utility/storage";
import {NetworkPrinter} from "../../utility/networking";
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
        const Env = context.getRequestParameter('env');
        const Region = context.getRequestParameter('region');

        // Fetch Supernet info.
        let SupernetsRepo = new SupernetRepo(context);
        let supernet = await SupernetsRepo.getSupernet(Env, Region);

        // Fetch used VPC subnets
        let VpcsRepo = new VpcRepo(context);
        let usedSubnets = await VpcsRepo.getSubnets(Env, Region);

        supernet.registerSubnets(usedSubnets);

        const AccountId = context.getRequestParameter('accountid');
        const ProjectCode = context.getRequestParameter('projectcode');
        const Requestor = context.getRequestParameter('requestor');
        const Reason = context.getOptionalRequestParameter('reason', 'Unknown');


        const newVpcPrefix = parseInt(context.getRequestParameter('prefix'));
        const newVpc = supernet.allocateSubnet(newVpcPrefix);

        const result = await VpcsRepo.storeSubnet(newVpc, AccountId, Env, ProjectCode, Reason, Region, Requestor);

        const cidr = NetworkPrinter.formatCidr(newVpc);
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