# Small Business Frontend

Angular-based frontend application for Small Business Management System.

## Prerequisites

- Node.js 18+ and npm 9+
- Angular CLI 20.3.3+
- AWS Account (for deployment)

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/small-business-fe.git
   cd small-business-fe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   - Copy `src/environments/environment.example.ts` to `src/environments/environment.ts`
   - Update the API endpoints and other settings as needed

## CORS Configuration

This application is configured to handle CORS in both development and production environments.

### Development Mode
- Uses Angular proxy configuration (`proxy.conf.json`) to avoid CORS issues
- Proxy forwards `/api` requests to the backend server
- Configured in `environment.ts`

### Production Mode
- Uses AWS ALB for CORS handling
- Configured in `environment.prod.ts`
- ALB adds necessary CORS headers to responses

## AWS Deployment

### Prerequisites
- AWS CLI configured with appropriate permissions
- S3 bucket for static website hosting
- CloudFront distribution (recommended)
- ALB configured with proper security groups

### Deployment Steps

1. Build the application for production:
   ```bash
   ng build --configuration=production
   ```

2. Deploy to S3:
   ```bash
   aws s3 sync dist/your-app s3://your-s3-bucket --delete
   ```

3. Invalidate CloudFront cache (if using CloudFront):
   ```bash
   aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
   ```

## Development server

Run `ng serve` for a dev server. The application will be available at `http://localhost:4200/`.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## AWS ALB CORS Configuration

To configure CORS on your AWS ALB:

1. Go to EC2 → Load Balancers → Select your ALB
2. Under Listeners, edit the rules for your HTTP/HTTPS listener
3. Add rules in this order:
   - **Rule 1 (Highest Priority)**: Handle OPTIONS method
     - Condition: HTTP request method is OPTIONS
     - Action: Return fixed response (200) with CORS headers
   - **Rule 2**: Handle API routes
     - Condition: Path is /api/*
     - Action: Forward to target group + Add response headers
   - **Default Rule**: Handle all other traffic

## Troubleshooting

### Common CORS Issues
1. **Missing CORS Headers**:
   - Verify ALB rules are correctly configured
   - Check if the response includes `Access-Control-Allow-Origin`

2. **Preflight Failures**:
   - Ensure OPTIONS method is allowed in ALB rules
   - Verify `Access-Control-Allow-Methods` includes all required methods

3. **Credential Issues**:
   - If using cookies/credentials, ensure `Access-Control-Allow-Credentials: true` is set
   - Don't use wildcard (`*`) for `Access-Control-Allow-Origin` when using credentials

## Additional Resources

- [Angular CLI Documentation](https://angular.dev/tools/cli)
- [AWS ALB Documentation](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html)
- [CORS on AWS ALB](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-listeners.html#listener-rules)
- [Angular HTTP Guide](https://angular.dev/guide/http)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
