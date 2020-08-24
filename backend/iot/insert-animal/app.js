const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
AWS.config.update({ region: process.env.AWS_REGION || 'us-east-1' });
const documentClient = new AWS.DynamoDB.DocumentClient();
const TableName = process.env.TABLE_NAME;
let response;

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.lambdaHandler = async (event, context) => {
    try {
        const body = JSON.parse(event.body);
        const taskID = uuidv4()
        const params = {
            Item: {
                id: taskID,
                name: body.name,
                age: body.age
            },
            TableName
        };
        await documentClient.put(params).promise();
        response = {
            'statusCode': 200,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            'body': JSON.stringify("the animal was successfully added ...")
        };
    } catch (err) {
        console.log(err);
        return err;
    }

    return response;
};
