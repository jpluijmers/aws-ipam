import 'source-map-support/register';
import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult
} from 'aws-lambda';
import {ContextWrapper} from "../../utility/ContextWrapper";
import {DDBVpc, DDBRepo, VpcRepo} from "../../utility/storage";

/**
 * A simple example includes a HTTP get method.
 */
export const deleteHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    var response;
    try {
        console.log("Received event:"+JSON.stringify(event));

        const context = new ContextWrapper(event);
        let cidr = context.getRequestParameter('cidr');

        let repo = new VpcRepo(context);
        let vpc = await repo.getVpcByCidr(cidr);

        let result = await repo.deleteVpcByCidr(vpc.Cidr);

        response =  {
            statusCode: 200,
            body: JSON.stringify({
                message: `CIDR: ${vpc.Cidr} deleted`,
            })
        };
    } catch( error) {
        response =  {
            statusCode: 500,
            body: JSON.stringify({
                message: error.message,
            })
        };
    }
    console.log("Response: " + JSON.stringify(response));
    return response;
}