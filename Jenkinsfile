

pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        AWS_REGION   = 'ap-south-1'
        ECR_REGISTRY = '062000001375.dkr.ecr.ap-south-1.amazonaws.com'
        NAMESPACE    = 'marigold'
        KUBECONFIG = '/var/lib/jenkins/.kube/config'
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
                sh '''
                    set -e

                    docker build -t marigold-backend:$BUILD_NUMBER ./backend
                    docker build -t marigold-frontend:$BUILD_NUMBER ./frontend
                '''
            }
        }

        
        stage('Trivy Image Scan') {
        steps {
        sh '''
            trivy image --severity HIGH,CRITICAL --exit-code 0 --ignore-unfixed marigold-backend:$BUILD_NUMBER
            trivy image --severity HIGH,CRITICAL --exit-code 0 --ignore-unfixed marigold-frontend:$BUILD_NUMBER
        '''
        }
    }



        stage('Push to ECR') {
            steps {
                sh '''
                    set -e

                    aws ecr get-login-password --region "$AWS_REGION" |
                        docker login --username AWS --password-stdin "$ECR_REGISTRY"

                    docker tag marigold-backend:$BUILD_NUMBER \
                        "$ECR_REGISTRY/marigold-backend:build-$BUILD_NUMBER"
                    docker tag marigold-backend:$BUILD_NUMBER \
                        "$ECR_REGISTRY/marigold-backend:latest"

                    docker tag marigold-frontend:$BUILD_NUMBER \
                        "$ECR_REGISTRY/marigold-frontend:build-$BUILD_NUMBER"
                    docker tag marigold-frontend:$BUILD_NUMBER \
                        "$ECR_REGISTRY/marigold-frontend:latest"

                    docker push "$ECR_REGISTRY/marigold-backend:build-$BUILD_NUMBER"
                    docker push "$ECR_REGISTRY/marigold-backend:latest"

                    docker push "$ECR_REGISTRY/marigold-frontend:build-$BUILD_NUMBER"
                    docker push "$ECR_REGISTRY/marigold-frontend:latest"
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    set -e

                    kubectl set image deployment/backend \
                        backend="$ECR_REGISTRY/marigold-backend:build-$BUILD_NUMBER" \
                        -n "$NAMESPACE"

                    kubectl set image deployment/frontend \
                        frontend="$ECR_REGISTRY/marigold-frontend:build-$BUILD_NUMBER" \
                        -n "$NAMESPACE"

                    kubectl rollout status deployment/backend \
                        -n "$NAMESPACE" --timeout=180s

                    kubectl rollout status deployment/frontend \
                        -n "$NAMESPACE" --timeout=180s
                '''
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: Tests, build, ECR push and Kubernetes deployment completed.'
        }

        failure {
            echo 'FAILED: Check the first failed stage in Console Output.'
        }

        always {
            sh 'docker logout "$ECR_REGISTRY" || true'
        }
    }
}
