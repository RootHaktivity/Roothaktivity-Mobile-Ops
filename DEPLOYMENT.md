# Roothaktivity: Mobile Ops - Deployment Guide

This guide covers deployment options for Roothaktivity: Mobile Ops, including local development, AWS production deployment, and Firebase hosting.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [AWS Production Deployment](#aws-production-deployment)
- [Firebase Deployment](#firebase-deployment)
- [Android App Distribution](#android-app-distribution)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

### Required Tools
- Docker and Docker Compose
- Node.js 18+
- Android Studio
- AWS CLI (for AWS deployment)
- Firebase CLI (for Firebase deployment)
- Terraform (for AWS infrastructure)

### Environment Setup
```bash
# Clone the repository
git clone <repository-url>
cd roothaktivity-mobile-ops

# Install backend dependencies
cd backend
npm install

# Install Android dependencies (done via Android Studio)
```

## Local Development

### Using Docker Compose (Recommended)

1. **Start all services:**
```bash
# Start the complete stack
docker-compose up -d

# Start with development tools (includes Adminer for database management)
docker-compose --profile dev-tools up -d

# View logs
docker-compose logs -f backend
```

2. **Services Available:**
- Backend API: http://localhost:3000
- MongoDB: localhost:27017
- Redis: localhost:6379
- Adminer (DB GUI): http://localhost:8080

3. **Environment Variables:**
Copy `.env.example` to `.env` and configure:
```bash
cp backend/.env.example backend/.env
# Edit .env with your local settings
```

### Manual Setup

1. **Start MongoDB:**
```bash
mongod --dbpath ./data/db
```

2. **Start Redis:**
```bash
redis-server
```

3. **Start Backend:**
```bash
cd backend
npm run dev
```

4. **Build Android App:**
Open Android Studio, import the `android-app` project, and build.

## AWS Production Deployment

### Infrastructure Setup

1. **Initialize Terraform:**
```bash
cd aws/terraform
terraform init
```

2. **Plan and Apply Infrastructure:**
```bash
# Review the plan
terraform plan -var="environment=prod"

# Apply infrastructure
terraform apply -var="environment=prod"
```

### Application Deployment

1. **Build and Push Docker Image:**
```bash
# Get ECR login token
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin <ecr-repository-url>

# Build and tag image
docker build -t roothaktivity/backend ./backend
docker tag roothaktivity/backend:latest <ecr-repository-url>:latest

# Push to ECR
docker push <ecr-repository-url>:latest
```

2. **Update ECS Service:**
```bash
# Force new deployment
aws ecs update-service --cluster roothaktivity-cluster-prod --service roothaktivity-backend-prod --force-new-deployment
```

### Environment Variables (AWS)

Set these in AWS Systems Manager Parameter Store:

```bash
# Database connection
aws ssm put-parameter --name "/roothaktivity/prod/MONGODB_URI" --value "mongodb://username:password@docdb-cluster-endpoint:27017/roothaktivity" --type "SecureString"

# JWT secrets
aws ssm put-parameter --name "/roothaktivity/prod/JWT_SECRET" --value "your-super-secure-jwt-secret" --type "SecureString"
aws ssm put-parameter --name "/roothaktivity/prod/JWT_REFRESH_SECRET" --value "your-super-secure-refresh-secret" --type "SecureString"

# Redis connection
aws ssm put-parameter --name "/roothaktivity/prod/REDIS_URL" --value "redis://username:password@redis-cluster-endpoint:6379" --type "SecureString"
```

## Firebase Deployment

### Setup Firebase Project

1. **Initialize Firebase:**
```bash
cd firebase
firebase init
```

2. **Select services:**
- Hosting
- Functions
- Firestore
- Storage

3. **Configure Firebase Functions:**
```bash
cd functions
npm install
```

### Deploy to Firebase

1. **Build and Deploy:**
```bash
# Deploy all services
firebase deploy

# Deploy specific service
firebase deploy --only hosting
firebase deploy --only functions
```

2. **Environment Configuration:**
```bash
# Set Firebase environment variables
firebase functions:config:set app.env="production"
firebase functions:config:set database.url="your-database-url"
```

## Android App Distribution

### Google Play Store

1. **Prepare for Release:**
```bash
cd android-app
./gradlew assembleRelease
```

2. **Sign APK:**
```bash
# Generate keystore (first time only)
keytool -genkey -v -keystore roothaktivity-release-key.keystore -alias roothaktivity -keyalg RSA -keysize 2048 -validity 10000

# Sign APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore roothaktivity-release-key.keystore app/build/outputs/apk/release/app-release-unsigned.apk roothaktivity
```

3. **Upload to Play Console:**
- Create app listing in Google Play Console
- Upload signed APK/AAB
- Complete store listing and content rating
- Submit for review

### Internal Distribution

1. **Firebase App Distribution:**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Distribute to testers
firebase appdistribution:distribute app-release.apk --app <app-id> --testers "tester1@example.com,tester2@example.com"
```

2. **Direct Download (Development):**
The Docker Compose setup includes nginx serving APKs:
- Place APKs in `android-app/app/build/outputs/apk/`
- Access via http://localhost/downloads/

## Monitoring and Maintenance

### Health Checks

1. **API Health:**
```bash
curl https://your-api-domain.com/health
```

2. **Database Connection:**
```bash
# Check MongoDB connection
mongo "mongodb://your-db-connection-string"

# Check Redis connection
redis-cli -h your-redis-host ping
```

### Logging

1. **AWS CloudWatch:**
- ECS service logs
- Application logs
- Error tracking

2. **Local Logging:**
```bash
# View application logs
docker-compose logs -f backend

# View database logs
docker-compose logs -f mongodb
```

### Backup and Recovery

1. **Database Backup (AWS):**
```bash
# DocumentDB automatic backups are configured
# Manual backup:
aws docdb create-db-cluster-snapshot --db-cluster-identifier roothaktivity-docdb-prod --db-cluster-snapshot-identifier manual-backup-$(date +%Y%m%d%H%M%S)
```

2. **Application Data Backup:**
```bash
# Export user data
mongodump --uri="mongodb://connection-string" --collection=players --out=backup/

# Export mission data
mongodump --uri="mongodb://connection-string" --collection=missions --out=backup/
```

### Scaling

1. **Horizontal Scaling (AWS):**
```bash
# Scale ECS service
aws ecs update-service --cluster roothaktivity-cluster-prod --service roothaktivity-backend-prod --desired-count 3
```

2. **Database Scaling:**
- DocumentDB: Add read replicas
- Redis: Enable cluster mode

### Security Updates

1. **Regular Updates:**
```bash
# Update dependencies
npm audit fix

# Update Docker base images
docker pull node:18-alpine
docker-compose build --no-cache
```

2. **SSL Certificate Renewal:**
- AWS: Automatic with ACM
- Manual: Update nginx configuration

## Troubleshooting

### Common Issues

1. **Database Connection Issues:**
```bash
# Check network connectivity
telnet your-db-host 27017

# Verify credentials
mongo "mongodb://username:password@host:port/database"
```

2. **Memory Issues:**
```bash
# Check container memory usage
docker stats

# Increase memory allocation in docker-compose.yml or ECS task definition
```

3. **Android Build Issues:**
```bash
# Clean build
./gradlew clean
./gradlew assembleDebug

# Check for dependency conflicts
./gradlew dependencies
```

### Support Contacts

- **Infrastructure Issues:** DevOps Team
- **Application Issues:** Development Team
- **Security Issues:** Security Team

## Performance Optimization

### Database Optimization

1. **MongoDB Indexes:**
```javascript
// Create indexes for frequently queried fields
db.players.createIndex({ "username": 1 })
db.players.createIndex({ "email": 1 })
db.missions.createIndex({ "difficulty": 1, "category": 1 })
```

2. **Query Optimization:**
- Use projection to limit returned fields
- Implement pagination for large datasets
- Use aggregation pipelines for complex queries

### API Optimization

1. **Caching Strategy:**
- Redis for session storage
- CloudFront for static assets
- Application-level caching for mission data

2. **Rate Limiting:**
- Configured per endpoint
- Different limits for authenticated vs anonymous users

### Mobile App Optimization

1. **APK Size Reduction:**
```bash
# Enable ProGuard/R8
android {
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

2. **Performance Monitoring:**
- Firebase Performance Monitoring
- Crashlytics for error tracking
- Custom analytics for user behavior

---

For detailed configuration examples and troubleshooting guides, see the individual service documentation in their respective directories.