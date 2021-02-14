import * as cdk from '@aws-cdk/core';
import * as path from 'path';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Bucket, BucketEncryption } from "@aws-cdk/aws-s3";
import { Runtime } from "@aws-cdk/aws-lambda";
import { BucketDeployment, Source } from "@aws-cdk/aws-s3-deployment";
import { PolicyStatement } from "@aws-cdk/aws-iam";
import { getPhotos } from "../api/get-photos";

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

    new cdk.CfnOutput(this, 'MyFirstCdkAppBucketNameExport', {
      value: bucket.bucketName,
      exportName: 'MyFirstCdkAppBucketName',
    })
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
