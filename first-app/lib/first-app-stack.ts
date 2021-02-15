import * as cdk from '@aws-cdk/core';
import * as path from 'path';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Bucket, BucketEncryption } from "@aws-cdk/aws-s3";
import { Runtime } from "@aws-cdk/aws-lambda";
import { BucketDeployment, Source } from "@aws-cdk/aws-s3-deployment";
import { PolicyStatement } from "@aws-cdk/aws-iam";
import { getPhotos } from "../api/get-photos";
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2";
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";
import { CloudFrontWebDistribution } from "@aws-cdk/aws-cloudfront";

export class FirstAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, 'MyFirstCdkAppBucket', {
      encryption: BucketEncryption.S3_MANAGED,
    });

    new BucketDeployment(this, 'MyFirstCdkAppBucketResources', {
      sources: [
        Source.asset(path.join(__dirname, '..', 'photos')),
      ],
      destinationBucket: bucket,
    });

    const websiteBucket = new Bucket(this, 'MyFirstCdkAppWebsiteBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
    });

    // make sure build folder exists - would make sense to run this dockerized
    new BucketDeployment(this, 'MyFirstCdkAppWebsiteBucketDeployment', {
      sources: [
        Source.asset(path.join(__dirname, '..', 'front', 'build'))
      ],
      destinationBucket: websiteBucket,
    })

    const cloudFront = new CloudFrontWebDistribution(this, 'MyFirstCdkAppCloudfrontDist', {
      originConfigs: [{
        s3OriginSource: {
          s3BucketSource: websiteBucket,
        },
        behaviors: [ { isDefaultBehavior: true }],
      }]
    });

    const lambda = new NodejsFunction(this, 'MyFirstCdkAppLambda', {
      runtime: Runtime.NODEJS_14_X,
      entry: path.join(__dirname, '..', 'api', 'get-photos','index.ts'),
      handler: 'getPhotos',
      environment: {
        PHOTO_BUCKET_NAME: bucket.bucketName,
      }
    });

    const bucketContainerPermissions = new PolicyStatement();
    bucketContainerPermissions.addResources(bucket.bucketArn);
    bucketContainerPermissions.addActions("s3:ListBucket");

    const bucketPermissions = new PolicyStatement();
    bucketPermissions.addResources(`${bucket.bucketArn}/*`);
    bucketPermissions.addActions("s3:GetObject", "s3:PutObject");

    lambda.addToRolePolicy(bucketContainerPermissions);
    lambda.addToRolePolicy(bucketPermissions);

    const httpApi = new HttpApi(this, 'MyFirstCdkAppHttpApi', {
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [HttpMethod.GET]
      },
      apiName: 'photos-api',
      createDefaultStage: true,
    });

    const lambdaIntegration = new LambdaProxyIntegration({
      handler: lambda,
    });

    httpApi.addRoutes({
      path: '/get-photos',
      methods: [
        HttpMethod.GET,
      ],
      integration: lambdaIntegration,
    });

    new cdk.CfnOutput(this, 'MyFirstCdkAppBucketNameExport', {
      value: bucket.bucketName,
      exportName: 'MyFirstCdkAppBucketName',
    });

    new cdk.CfnOutput(this, 'MyFirstCdkAppWebsiteBucketNameExport', {
      value: websiteBucket.bucketName,
      exportName: 'MyFirstCdkAppWebsiteBucketName',
    });

    new cdk.CfnOutput(this, 'MyFirstCdkAppWebsiteUrl', {
      value: cloudFront.distributionDomainName,
      exportName: 'MyFirstCdkAppWebsiteUrl',
    });

    new cdk.CfnOutput(this, 'MyFirstCdkAppApi', {
      value: httpApi.url!,
      exportName: 'MyFirstCdkAppApiEndpoint'
    });
  }
}

// %bash
// cdk doc
// wyswietla najnowsza dokumentacje https://docs.aws.amazon.com/cdk/api/latest/

// to deploy
// cdk bootstrap
// cdk deploy

// alt by zobaczyc terraforma w jsonie
// cdk synthesize --output=./templates
