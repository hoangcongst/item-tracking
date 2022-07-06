### Pet project items tracking on some 2nd market
## Using stack
- Nodejs 16
- Aws lambda function
- Aws dynamodb
- Aws EventBridge
- And the smoothest SNS app ever: Telegram 

## Testing lambda function locally
- Login aws with public credentials to pull images from ECR
`aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/sam/emulation-nodejs16.x`
- Then run command `sam local invoke --debug -l test.log --env-vars env.json`
