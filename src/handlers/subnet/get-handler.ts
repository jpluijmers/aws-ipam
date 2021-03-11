import 'source-map-support/register';
import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult
} from 'aws-lambda';
import {ContextWrapper} from "../../utility/ContextWrapper";
import {VpcRepo} from "../../utility/storage";
import {NetworkPrinter} from "../../utility/networking";
import {SubnetRepo} from "../../utility/storage/SubnetRepo";
/**
 * A simple example includes a HTTP get method.
 */
export const getHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    var response;
    try {
        console.log("Received event:"+JSON.stringify(event));

        const context = new ContextWrapper(event);
        const Cidr = context.getRequestParameter('cidr');

        // Fetch used VPC subnets
        let SubnetsRepo = new SubnetRepo(context);
        let subnet = await SubnetsRepo.getByCidr(Cidr);

        response = {
            statusCode: 200,
            body: JSON.stringify(subnet)
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