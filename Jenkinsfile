
pipeline {
    agent any

    environment {
        IMAGE_NAME = 'shrutipitale27/studyspace'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Validate Project Files') {
            steps {
                sh '''
                    set -e
                    test -f index.html
                    test -f style.css
                    test -f script.js
                    test -f Dockerfile
                    echo "StudySpace files verified."
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    set -e
                    docker build \
                      -t ${IMAGE_NAME}:${BUILD_NUMBER} \
                      -t ${IMAGE_NAME}:latest .
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_TOKEN'
                )]) {
                    sh '''
                        set -e
                        echo "$DOCKER_TOKEN" | docker login \
                          -u "$DOCKER_USER" --password-stdin
                        docker push ${IMAGE_NAME}:${BUILD_NUMBER}
                        docker push ${IMAGE_NAME}:latest
                        docker logout
                    '''
                }
            }
        }
    }

    post {
        always {
            echo 'StudySpace CI/CD pipeline completed.'
        }
    }
}
