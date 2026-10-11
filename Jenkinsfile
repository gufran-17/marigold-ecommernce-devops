
pipeline {
    agent any

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
