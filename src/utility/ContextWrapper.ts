import {APIGatewayProxyEvent} from "aws-lambda";

export class ContextWrapper{

    constructor(private event: APIGatewayProxyEvent) {
    }

    public assertValidEnvironmenParameter(key: string){
        const assert = require('assert').strict;

        assert(key in process.env, `Environment variable [${key}] missing`);
    }

    public getEnvironmentVariable(key: string): string{
        this.assertValidEnvironmenParameter(key);
        return process.env[key];
    }

    public assertValidRequestParameter(key: string){
        const assert = require('assert').strict;

        assert('queryStringParameters' in this.event, 'no queryStringParameters set');
        assert(key in this.event.queryStringParameters, `request parameter [${key}] missing`);
    }

    public getRequestParameter(key: string): string{
        this.assertValidRequestParameter(key);
        return this.event.queryStringParameters[key];
    }

    public getOptionalRequestParameter(key: string, absent?: string){
        const assert = require('assert').strict;

        assert('queryStringParameters' in this.event, 'no queryStringParameters set');
        if ( key in this.event.queryStringParameters ){
            return this.event.queryStringParameters[key];
        }

        return absent;
    }
}