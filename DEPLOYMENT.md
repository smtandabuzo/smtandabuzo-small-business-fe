# AWS ECS Deployment Guide

This guide explains how to deploy the Small Business Frontend application to AWS ECS using Fargate.

## Prerequisites

1. AWS CLI configured with appropriate permissions
2. Docker installed locally
3. AWS ECR repository created
4. ECS cluster and service configured
5. Required IAM roles and security groups

## Setup Instructions

### 1. Configure AWS CLI

Make sure you have AWS CLI configured with the right credentials:

```bash
aws configure
```

### 2. Create ECR Repository

```bash
aws ecr create-repository --repository-name small-business-fe --region your-aws-region
```

### 3. Create ECS Cluster

```bash
aws ecs create-cluster --cluster-name small-business-cluster --region your-aws-region
```

### 4. Create ECS Task Definition

Update the `task-definition.json` with your AWS account ID and region, then register it:

```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json --region your-aws-region
```

### 5. Create ECS Service

```bash
aws ecs create-service \
  --cluster small-business-cluster \
  --service-name small-business-fe-service \
  --task-definition small-business-task \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
  --region your-aws-region
```

## CI/CD Setup with GitHub Actions

1. Add these secrets to your GitHub repository:
   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
   - `AWS_REGION`: Your AWS region (e.g., us-east-1)

2. The workflow will automatically trigger on pushes to the main branch.

## Manual Deployment

To manually deploy:

1. Make the deployment script executable:
   ```bash
   chmod +x deploy-ecs.sh
   ```

2. Update the variables in `deploy-ecs.sh`:
   - `AWS_REGION`
   - `AWS_ACCOUNT_ID`
   - Other configuration as needed

3. Run the deployment script:
   ```bash
   ./deploy-ecs.sh
   ```

## Accessing the Application

After deployment, access your application at the public IP or DNS of your ECS service's load balancer.

## Monitoring

- Check CloudWatch Logs for application logs
- Monitor ECS service metrics in the AWS Management Console
- Set up CloudWatch Alarms for important metrics
