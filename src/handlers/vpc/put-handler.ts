import 'source-map-support/register';
import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult
} from 'aws-lambda';
import {ContextWrapper} from "../../utility/ContextWrapper";
import {DDBVpc, DDBRepo} from "../../utility/storage";

/**
 * A simple example includes a HTTP get method.
 */
export const putHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    var response;
    try {
        console.log("Received event:"+JSON.stringify(event));

        const context = new ContextWrapper(event);
        let t = context.getEnvironmentVariable('DYNAMODB_VPC_TABLE');
        let VpcRepo = new DDBRepo<DDBVpc>(t, 'Cidr');
        let vpc = await VpcRepo.read(context.getRequestParameter('cidr'));

        vpc.VpcId = context.getRequestParameter('vpcid');

        let result = await VpcRepo.write(vpc);

        response =  {
            statusCode: 200,
            body: JSON.stringify({
                message: `CIDR: ${vpc.Cidr} updated`,
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