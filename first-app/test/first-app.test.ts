import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as FirstApp from '../lib/first-app-stack';
import '@aws-cdk/assert/jest';

test('Stack expists', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new FirstApp.FirstAppStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {
        "MyFirstCdkAppBucket36915070": {
          "Type": "AWS::S3::Bucket",
          "Properties": {
            "BucketEncryption": {
              "ServerSideEncryptionConfiguration": [
                {
                  "ServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                  }
                }
              ]
            }
          },
          "UpdateReplacePolicy": "Retain",
          "DeletionPolicy": "Retain",
        },
      },
      "Outputs": {
        "MyFirstCdkAppBucketNameExport": {
          "Value": {
            "Ref": "MyFirstCdkAppBucket36915070"
          },
          "Export": {
            "Name": "MyFirstCdkAppBucketName"
          }
        }
      }
    }, MatchStyle.EXACT))
});

test('Stack has bucker', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new FirstApp.FirstAppStack(app, 'MyTestStack');
  // THEN
  expect(stack).toHaveResource('AWS::S3::Bucket');
});
