
pipeline {
    agent none

    environment {
        IMAGE_NAME = 'shrutipitale27/studyspace'
    }

    stages {
        stage('Checkout, Validate, Build and Push') {
            agent { label 'built-in-node' }

            steps {
                checkout scm

                sh '''
                    set -e
                    test -f index.html
                    test -f style.css
                    test -f script.js
                    test -f Dockerfile
                    echo "StudySpace files verified."
                '''

                sh '''
                    set -e
                    docker build \
                      -t ${IMAGE_NAME}:${BUILD_NUMBER} \
                      -t ${IMAGE_NAME}:latest .
                '''

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

        stage('Deploy to Minikube') {
            agent { label 'windows-minikube' }

            steps {
                bat '''
                    kubectl set image deployment/studyspace studyspace=%IMAGE_NAME%:%BUILD_NUMBER%
                    kubectl rollout status deployment/studyspace --timeout=120s
                    kubectl get pods
                    kubectl get service studyspace-service
                '''
            }
        }
    }

    post {
        always {
            echo 'StudySpace CI/CD pipeline completed.'
        }
    }
}
