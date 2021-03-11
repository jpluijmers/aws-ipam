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
export const getHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    var response;
    try {
        console.log("Received event:"+JSON.stringify(event));
        
        const context = new ContextWrapper(event);
        let repo = new VpcRepo(context);
        let vpc = await repo.read(context.getRequestParameter('cidr'));

        response = {
            statusCode: 200,
            body: JSON.stringify(vpc)
        };
    } catch( error) {
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