
pipeline {
    agent any

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
                    echo "StudySpace project files verified."
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    set -e
                    docker build \
                      -t studyspace:${BUILD_NUMBER} \
                      -t studyspace:latest .
                '''
            }
        }
    }

    post {
        success {
            echo 'StudySpace validation and Docker image build succeeded.'
        }
        failure {
            echo 'StudySpace pipeline failed. Check the console output.'
        }
    }
}
