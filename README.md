# Decoupling the  Frontend using AWS IOT

In this example I walk you through how you can decouple your frontend using IOT. The front end is a very basic app, built with angular 10. The frontend consists of a page with one button, when clicked, it will send a request to the API Gateway to add an animal. Once the animal is added in DynamoDB, it will trigger a stream that will trigger a Lambda Function called 'AlertIOTFunction'. This function will publish the newly added animal to an IOT thing which the frontend is subscribing to using mqtt. So in the browser console you can see that we are printing that item coming from the IOT.

## Getting Started

If you are using AWS API Gateway & lambda, then you are already aware of the limits. API Gateway has a limit of 29 seconds integration timeout (https://docs.aws.amazon.com/apigateway/latest/developerguide/limits.html). AWS Lambda has a limit of 15 minutes.

What if our frontend wants to do an action, and that action will lead to other actions being executed.And once done, we want the frontend to be notified? Well in AWS there are several ways to do so. In this example we will use AWS IOT to have an async behaviour.

### Prerequisites

The example is split to 2 parts:
 - backend (lambda function)
 - frontend (angular 10)

You need an AWS account, since we will be deploying the backend using SAM: 
https://aws.amazon.com/serverless/sam/

We also need the AWS cli to be installed (we will need it to get the IOT endpoint)
https://aws.amazon.com/cli/


### Installing

Let's first deploy the backend:

Go to the backend folder, specifically the iot, and enter the following command:


```
sam build
```

this command will build the backend infrastructure. If everything went well it will ask you to run :

```
sam deploy --guided
```

- Enter a Stack Name: animals-backend 
- Enter an AWS Region: us-east-1
- and choose 'y' for the followup questions

You can verify that everything went well in the terminal, or you can go AWS CloudFormation and find the 'animals-backend' stack that we just deployed

One thing we still need to do for the backend. We need to grab the AWS IOT endpoint and set it as an Environment Variable for the AlertIOTFunction Lambda function.

in your terminal run the following command: 

```
aws iot describe-endpoint --endpoint-type iot:Data-ATS 
```

The result will be somethin like:

```
{
    "endpointAddress": "a1p23e2eds44s-ats.iot.us-east-1.amazonaws.com"
}
```

Copy the endpoint and go to AWS Lambda console, select the 'animals-backend-AlertIOTFunction-*' function, and add the following to the environment variables:
- Key: IOT_DATA_ENDPOINT
- Value: the endpoint you just copied

And save.

Now moving to the frontend. We will need to replace a couple of placeholders in the app.component.ts. So go to aws-examples, and run:

```
yarn
```

Then go to the app.component.ts file and replace the following with the relevant values:
- api: replace it wit the gateway api that was deployed using sam (you can grab the endpointvia the AWS api gateway console), looks like: https://9e87dhaed.execute-api.us-east-1.amazonaws.com/Prod/
- poolId: looks like 'us-east-1:e4803d3b-42d5-496f-9c5a-408f20eb28e4' // 'YourCognitoIdentityPoolId'
- host: 'a1pwqjqny5t44s-ats.iot.us-east-1.amazonaws.com', // 'YourAwsIoTEndpoint', e.g. 'prefix.iot.us-east-1.amazonaws.com'

After setting these values, you can run:

```
yarn start
```

And then navigate to : localhost:4200

## License

This project is licensed under the GNU GENERAL PUBLIC LICENSE Version 3 - see the [LICENSE.md](LICENSE.md) file for details