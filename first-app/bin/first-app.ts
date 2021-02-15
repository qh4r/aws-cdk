#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { FirstAppStack } from '../lib/first-app-stack';

const app = new cdk.App();
new FirstAppStack(app, 'FirstAppStack', {
  // tu mozna np ustawic region itd
});
