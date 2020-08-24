import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as AWSIoTData from "aws-iot-device-sdk";
import * as AWS from 'aws-sdk';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  name: string;
  salutation: string;
  private api = '' // replace by your api gateway endpoints
  private AWSConfiguration: any;
  private mqttClient: AWSIoTData.device;
  constructor(private http: HttpClient) {
    this.AWSConfiguration = {
      poolId: '', //'us-east-1:e4803d3b-42d5-496f-9c5a-408f20eb28e4', // 'YourCognitoIdentityPoolId'
      host: '', // 'YourAwsIoTEndpoint', e.g. 'prefix.iot.us-east-1.amazonaws.com'
      region: 'us-east-1' // 'YourAwsRegion', e.g. 'us-east-1'
    }

    AWS.config.region = this.AWSConfiguration.region;
    console.log(AWS.config)
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: this.AWSConfiguration.poolId
    })

    const clientId = 'animals-' + (Math.floor((Math.random() * 100000) + 1));
    this.mqttClient = new AWSIoTData.device({
      region: AWS.config.region,
      host: this.AWSConfiguration.host,
      clientId: clientId,
      protocol: 'wss',
      maximumReconnectTimeMs: 8000,
      debug: false,
      secretKey: '', // need to be send as an empty string, otherwise it will throw an error
      accessKeyId: '' // need to be send as an empty string, otherwise it will throw an error
    });

  }

  ngOnInit() {


    this.mqttClient.on('connect', () => {
      console.log('mqttClient connected')
      this.mqttClient.subscribe('animals-realtime')
    });

    this.mqttClient.on('error', (err) => {
      console.log('mqttClient error:', err);
      this.getCreds();
    });

    this.mqttClient.on('message', (topic, payload) => {
      const msg = JSON.parse(payload.toString())
      console.log('IoT msg: ', topic, msg)
    });

    this.http.get(`${this.api}get-animals`
    )
      .subscribe((data: any) => {
        console.log('data: ', data)
      });

  }

 private getCreds() {
    console.log('getCreds called')

    const cognitoIdentity = new AWS.CognitoIdentity();
    (AWS.config.credentials as any).get((err, data) => {
      if (!err) {
        console.log('retrieved identity: ' + (AWS.config.credentials as any).identityId)
        var params = {
          IdentityId: (AWS.config.credentials as any).identityId as any
        }
        cognitoIdentity.getCredentialsForIdentity(params, (err, data) => {
          if (!err) {
            this.mqttClient.updateWebSocketCredentials(data.Credentials.AccessKeyId,
              data.Credentials.SecretKey,
              data.Credentials.SessionToken,
              data.Credentials.Expiration
            )
          }
        })
      } else {
        console.log('Error retrieving identity:' + err)
      }
    })
  }

  onClickMe() {
    this.http.post(`${this.api}add-animal`, {
      "name": "ezzo",
      "age": 1
    }
    )
      .subscribe((data: any) => {
        console.log('data: ', data)
      });
  }

}
