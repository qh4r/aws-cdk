import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Context } from "aws-lambda";
import { S3 } from 'aws-sdk';

const bucketName: string = process.env.PHOTO_BUCKET_NAME!;
const s3 = new S3();

async function generateUrl(asset: S3.Object | undefined): Promise<{
  filename: string,
  url: string,
} | undefined > {
  if(asset) {
    const url = await s3.getSignedUrlPromise('getObject', {
      Bucket: bucketName,
      Key: asset.Key,
      Expires: (60 * 60) //1h
    });

    return {
      filename: asset.Key!,
      url,
    };
  }
  return undefined;
}

async function getPhotos(event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyStructuredResultV2> {
  console.log("bucket name -> %s", bucketName);
  try {
    const { Contents: results } = await s3.listObjects({ Bucket: bucketName }).promise();
    const photos = await Promise.all(results!.map(res => generateUrl(res)));
    return {
      statusCode: 200,
      body: JSON.stringify({
        photos
      })
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: e.message,
    };
  }
}

export {getPhotos}
