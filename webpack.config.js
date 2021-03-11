const path = require("path");
const AwsSamPlugin = require("aws-sam-webpack-plugin");

const awsSamPlugin = new AwsSamPlugin();

const entries = Object.entries(awsSamPlugin.entry()).filter((value) =>  {
    if ( process.env.WEBPACK_ENTRY === undefined ){
        return true;
    }

    return value[0] === process.env.WEBPACK_ENTRY;
}).reduce((a, [name, entry]) => Object.assign(a, {[name]: entry}), {});


module.exports = {
    // Loads the entry object from the AWS::Serverless::Function resources in your
    // SAM config. Setting this to a function will
    // entry: () => awsSamPlugin.entry(),
    entry: () => entries,

    // Write the output to the .aws-sam/build folder
    output: {
        filename: (chunkData) => awsSamPlugin.filename(chunkData),
        libraryTarget: "commonjs2",
        path: path.resolve(".")
    },

    // Create source maps
    devtool: process.env.NODE_ENV === "development" ? "source-map" : undefined,

    // Resolve .ts and .js extensions
    resolve: {
        extensions: [".ts", ".js"]
    },

    // Target node
    target: "node",

    // AWS recommends always including the aws-sdk in your Lambda package but excluding can significantly reduce
    // the size of your deployment package. If you want to always include it then comment out this line. It has
    // been included conditionally because the node10.x docker image used by SAM local doesn't include it.
    externals: process.env.NODE_ENV === "development" ? [] : ["aws-sdk"],

    // Set the webpack mode
    mode: process.env.NODE_ENV || "production",

    // Add the TypeScript loader
    module: {
        rules: [{ test: /\.tsx?$/, loader: "ts-loader" }]
    },

    // Add the AWS SAM Webpack plugin
    plugins: [awsSamPlugin]
};