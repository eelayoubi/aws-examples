// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.AWS_REGION || 'us-east-1' });
const iotdata = new AWS.IotData({ endpoint: process.env.IOT_DATA_ENDPOINT });
let iotTopic = process.env.IOT_DATA_TOPIC;

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
    await Promise.all(
        event.Records.map(async (record) => {
          try {
           const message = record.dynamodb.NewImage;
    
            await iotPublish(iotTopic, message)        
          } catch (err) {
            console.error('Error: ', err)
          }
    })
  )
}


// Publishes the message to the IoT topic
const iotPublish = async function (topic, message) {
    try {
      await iotdata.publish({
            topic,
            qos: 0,
            payload: JSON.stringify(message)
        }).promise();
        console.log('iotPublish success to topic: ', topic, message)
    } catch (err) {
        console.error('iotPublish error:', err)
    }
}