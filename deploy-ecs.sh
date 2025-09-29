#!/bin/bash
# Exit on error and print each command
set -exo pipefail

# Assume the IAM role
CREDENTIALS=$(aws sts assume-role \
    --role-arn arn:aws:iam::810772959397:role/ECSDeploymentRole \
    --role-session-name ECSDeploymentSession \
    --region eu-north-1)

export AWS_ACCESS_KEY_ID=$(echo $CREDENTIALS | jq -r '.Credentials.AccessKeyId')
export AWS_SECRET_ACCESS_KEY=$(echo $CREDENTIALS | jq -r '.Credentials.SecretAccessKey')
export AWS_SESSION_TOKEN=$(echo $CREDENTIALS | jq -r '.Credentials.SessionToken')

# Configuration
AWS_REGION="eu-north-1"
AWS_ACCOUNT_ID="810772959397"
ENVIRONMENT="production"

# ECS Configuration
ECR_REPOSITORY="small-business-fe"
CLUSTER_NAME="small-business-cluster"
SERVICE_NAME="small-business-fe-service"
TASK_DEFINITION_NAME="small-business-task"
TASK_DEFINITION_FILE="task-definition.json"

# ALB Configuration
ALB_STACK_NAME="small-business-alb"
TARGET_GROUP_STACK_OUTPUT_KEY="TargetGroupArn"

# Colors for output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Function to get stack output value
get_stack_output() {
    local stack_name=$1
    local output_key=$2
    aws cloudformation describe-stacks \
        --stack-name $stack_name \
        --query "Stacks[0].Outputs[?OutputKey=='$output_key'].OutputValue" \
        --output text \
        --region $AWS_REGION
}

# Login to ECR
echo -e "${GREEN}Logging in to Amazon ECR...${NC}"
# Get ECR login token and login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build and tag the image
echo -e "${GREEN}Building Docker image...${NC}"
docker build -t $ECR_REPOSITORY .

# Tag the image for ECR
ECR_IMAGE_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest"
docker tag $ECR_REPOSITORY:latest $ECR_IMAGE_URI

# Push the image to ECR
echo -e "${GREEN}Pushing image to ECR...${NC}"
docker push $ECR_IMAGE_URI

# Get the ALB target group ARN
echo -e "${GREEN}Retrieving ALB target group ARN...${NC}"
TARGET_GROUP_ARN=$(get_stack_output $ALB_STACK_NAME $TARGET_GROUP_STACK_OUTPUT_KEY)

if [ -z "$TARGET_GROUP_ARN" ]; then
    echo "Error: Could not retrieve target group ARN from CloudFormation stack"
    exit 1
fi

# Update task definition with new image
echo -e "${GREEN}Updating task definition...${NC}"
TEMP_TASK_DEFINITION=$(mktemp)
jq --arg IMAGE "$ECR_IMAGE_URI" '.containerDefinitions[0].image = $IMAGE' \
    $TASK_DEFINITION_FILE > $TEMP_TASK_DEFINITION

# Register the task definition
echo -e "${GREEN}Registering new task definition...${NC}"
TASK_DEFINITION_JSON=$(aws ecs register-task-definition \
    --cli-input-json "file://$TEMP_TASK_DEFINITION" \
    --region $AWS_REGION)

TASK_DEFINITION_ARN=$(echo $TASK_DEFINITION_JSON | jq -r '.taskDefinition.taskDefinitionArn')
rm -f "$TEMP_TASK_DEFINITION"

# Update the service with the new task definition and configuration
echo -e "${GREEN}Updating ECS service...${NC}"
aws ecs update-service \
    --cluster $CLUSTER_NAME \
    --service $SERVICE_NAME \
    --task-definition $TASK_DEFINITION_ARN \
    --region $AWS_REGION \
    --force-new-deployment \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-007a8c2be665983f2,subnet-0cca18617da14e5a4],securityGroups=[sg-0e0bf8db40755d79a],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=$TARGET_GROUP_ARN,containerName=small-business-fe,containerPort=8080"

# Wait for the service to stabilize
echo -e "${GREEN}Waiting for service to stabilize...${NC}"
aws ecs wait services-stable \
    --cluster $CLUSTER_NAME \
    --services $SERVICE_NAME \
    --region $AWS_REGION

# Get the ALB DNS name
ALB_DNS=$(get_stack_output $ALB_STACK_NAME "ALBDNSName")

# Print success message
echo -e "\n${GREEN}Deployment completed successfully!${NC}"
echo "New task definition ARN: $TASK_DEFINITION_ARN"
echo "Application URL: http://$ALB_DNS"

# Print deployment verification command
echo -e "\nTo verify the deployment, run:"
echo "aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $AWS_REGION | jq '.services[0].deployments'"
