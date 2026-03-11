@Library('my-shared-library') _

pipeline {
    agent { node { label 'docker-runner' } }

    environment {
        IMAGE_NAME    = "ecommerce-frontend"
        REGISTRY_USER = "tejung"
        DOCKER_CREDS  = 'docker-hub-token'
    }

    stages {
        stage('Security: Source Scan') {
            steps {
                trivyScan(severity: 'HIGH,CRITICAL')
            }
        }

        stage('Build, Test & Delivery') {
            steps {
                // This triggers the Multi-stage Dockerfile:
                // 1. npm install
                // 2. npm run lint
                // 3. npm test (with our new --ci flags)
                // 4. npm run build
                // 5. Trivy Image Scan (inside the library function)
                // 6. Docker Push
                dockerBuildPush(
                    registryUser: env.REGISTRY_USER,
                    imageName: env.IMAGE_NAME,
                    credsId: env.DOCKER_CREDS
                )
            }
        }
        stage('Prepare Environment') {
            steps {
                echo 'Cleaning up dangling Docker networks...'
                // -f (force) skips the confirmation prompt
                // || true ensures the pipeline continues even if prune returns a non-zero exit code
                sh 'docker network prune -f || true'
            }
        }
        stage('Deploy') {
            when { 
                anyOf { branch 'develop'; branch 'main'; branch 'release/*' } 
            }
            steps {
                echo "Deploying Frontend container..."
                sh "docker compose up -d ecommerce-frontend"
            }
        }
    }

    post {
        success {
            echo "Successfully deployed ${IMAGE_NAME} build #${BUILD_NUMBER}"
            build job: '/DevOps project/ecommerce-integration-tests/main', wait: false
        }
        failure {
            echo "Pipeline failed. Check the Jenkins console output for errors."
        }
        always {
            sh 'docker image prune -f'
            deleteDir()
        }
    }
}