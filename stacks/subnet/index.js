const AWS = require('aws-sdk');
const https = require('https');
var cfn;
try {
    cfn = require('cfn-response');
} catch (e){
    // SAM doesnt have cfn-response, mock by logging to console.log.
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
    var url = event['ResourceProperties']['CidrApiEndpoint'].replace(/\/$/, "") + "/subnet";
    url += '?cidr=' + event['ResourceProperties']['Cidr'];
    return makeApiQuest('DELETE', url);
}

async function postHandler(event) {
    var url = event['ResourceProperties']['CidrApiEndpoint'].replace(/\/$/, "") + "/subnet";
    url += '?prefix=' + event['ResourceProperties']['Prefix'];
    url += '&vpcid=' + event['ResourceProperties']['VpcId'];

    return makeApiQuest('POST', url);
}

async function putHandler(event) {
    var url = event['ResourceProperties']['CidrApiEndpoint'].replace(/\/$/, "") + "/subnet";
    url += '?cidr=' + event['ResourceProperties']['Cidr'];
    url += '&subnetid=' + event['ResourceProperties']['SubnetId'];
    url += '&availabilityzone=' + event['ResourceProperties']['AvailabilityZone'];

    return makeApiQuest('PUT', url);
}

function makeApiQuest(method, uri) {
    const uriParts = new URL(uri);

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