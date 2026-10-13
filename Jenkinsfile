
pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-south-1'
        AWS_ACCOUNT_ID = '062000001375'
        ECR_REGISTRY = '062000001375.dkr.ecr.ap-south-1.amazonaws.com'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/gufran-17/marigold-ecommernce-devops.git'
            }
        }

        stage('Test') {
            steps {
                dir('backend') {
                    sh 'npm install'
                    sh 'npm test'
                }

                dir('frontend') {
                    sh 'npm install'
                    sh 'npm test'
                }
            }
        }

        stage('Build') {
            steps {
                sh 'docker build -t marigold-backend ./backend'
                sh 'docker build -t marigold-frontend ./frontend'
            }
        }

        stage('Push to ECR') {
            steps {
                sh '''
                    set -eu

                    aws ecr get-login-password --region "$AWS_REGION" |
                        docker login --username AWS --password-stdin "$ECR_REGISTRY"

                    docker tag marigold-backend:latest "$ECR_REGISTRY/marigold-backend:latest"
                    docker tag marigold-backend:latest "$ECR_REGISTRY/marigold-backend:build-$BUILD_NUMBER"

                    docker tag marigold-frontend:latest "$ECR_REGISTRY/marigold-frontend:latest"
                    docker tag marigold-frontend:latest "$ECR_REGISTRY/marigold-frontend:build-$BUILD_NUMBER"

                    docker push "$ECR_REGISTRY/marigold-backend:latest"
                    docker push "$ECR_REGISTRY/marigold-backend:build-$BUILD_NUMBER"

                    docker push "$ECR_REGISTRY/marigold-frontend:latest"
                    docker push "$ECR_REGISTRY/marigold-frontend:build-$BUILD_NUMBER"

                    docker logout "$ECR_REGISTRY"
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker compose up -d --build'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check the console output.'
        }
    }
}
