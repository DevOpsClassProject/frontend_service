@Library('my-shared-library') _

pipeline {
    agent {
        node {
            // If branch is develop, run on the dev-server agent. 
            // Otherwise (feature branches), use the docker-runner.
            label (env.CHANGE_BRANCH == 'develop' ? 'docker-v1' : 'docker-runner')
        }
    }

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
        stage('Run Integration Tests') {
            steps {
                script {
                    build job: '/DevOps project/ecommerce-integration-tests/main', wait: false
                }
            }
        }
        stage('Deploy') {
            steps {
                script {
                    if (env.CHANGE_BRANCH == 'develop' || env.BRANCH_NAME == 'develop'){
                        echo "Updating Database container in ${env.BRANCH_NAME}..."
                        sh "docker compose up -d ecommerce-frontend"
                    }else {
                        echo "Skipping container deployment."
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                // Only prune if we are NOT on a protected branch
                if ((env.BRANCH_NAME != null && env.BRANCH_NAME.contains('feature')) || env.BRANCH_NAME.contains('feature')) {
                    echo "Feature branch detected (${env.BRANCH_NAME}). Cleaning up Docker system..."
                    sh 'docker system prune -f'
                }else {
                echo "Skipping Docker prune (Branch is null or not a feature branch)."
            }
            }
            deleteDir()
        }
    }
}