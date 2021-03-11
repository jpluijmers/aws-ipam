const vm = require('vm');
const AWS = require('aws-sdk');
const https = require('https');
const url = require('url');
var cfn;
try {
    cfn = require('cfn-response');
} catch (e){
    // SAM doesnt have cfn-response, mock.
    cfn = {};
    cfn.send = function(){
        console.log(JSON.stringify(arguments));
    }
}

exports.handler = async function (event, context) {
    console.log(event);
    try {
        var status = cfn.FAILED;
        var response;
        switch (event['RequestType']) {
            case "Create":
                if ( event['ResourceProperties']['Cidr'] ) {
                    response = await putHandler(event);
                }else{
                    response = await postHandler(event);
                }
                break;
            case "Delete":
                if ( event['ResourceProperties']['Cidr'] ) {
                    response = await deleteHandler(event);
                }else{
                    response = {message:'noop'};
                }
                break;
            case "Update":
                // Update is a NOOP.
                response = {message:'noop'};
                break;
        }
        status = cfn.SUCCESS;
    } catch (error) {
        response = {error: error};
    }
    await cfn.send(event, context, status, response);
}

async function deleteHandler(event) {
    var url = event['ResourceProperties']['CidrApiEndpoint'].replace(/\/$/, "") + "/vpc";
    url += '?cidr=' + event['ResourceProperties']['Cidr'];
    return apiRequest('DELETE', url);
}

async function putHandler(event) {
    var url = event['ResourceProperties']['CidrApiEndpoint'].replace(/\/$/, "") + "/vpc";
    url += '?cidr=' + event['ResourceProperties']['Cidr'];
    url += '&vpcid=' + event['ResourceProperties']['VpcId'];
    return apiRequest('PUT', url);
}

async function postHandler(event) {
    var url = event['ResourceProperties']['CidrApiEndpoint'].replace(/\/$/, "") + "/vpc";
    url += '?prefix=' + event['ResourceProperties']['Prefix'];
    url += '&accountid=' + event['ResourceProperties']['AccountId'];
    url += '&projectcode=' + event['ResourceProperties']['ProjectCode'];
    url += '&requestor=' + event['ResourceProperties']['Requestor'];
    url += '&reason=' + event['ResourceProperties']['Reason'];
    url += '&region=' + event['ResourceProperties']['Region'];
    url += '&env=' + event['ResourceProperties']['Env'];
    url += '&stackid=' + event['ResourceProperties']['StackId'];

    return apiRequest('POST', url);
}

function apiRequest(method, uri) {
    const uriParts = new URL(uri);

    console.log("Making request: " + method + " " + uri);

    const httpRequest = new AWS.HttpRequest(uri, process.env['AWS_REGION']);
    httpRequest.headers.host = uriParts.host;
    httpRequest.headers['Content-Type'] = 'application/json';
    httpRequest.method = method;

    const signer = new AWS.Signers.V4(httpRequest, "execute-api", true);
    signer.addAuthorization(AWS.config.credentials, AWS.util.date.getDate());

    const options = {
        host: uriParts.host,
        protocol: uriParts.protocol,
        path: uriParts.pathname + uriParts.search,
        headers: httpRequest.headers,
        method: method
    }

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            var response = "";

            res.on('data', (d) => {
                response += d;
            });
            res.on('end', (data) => {
                response = JSON.parse(response);

                if (res.statusCode === 200) {
                    resolve(response);
                } else {
                    reject(response.message);
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.end();
    });
}