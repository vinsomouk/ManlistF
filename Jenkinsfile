pipeline {
    agent {
        label 'Agent_Manlist_Front'
    }

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        timestamps()
    }

    environment {
        DOCKER_IMAGE = 'manlist-front'
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Check Environment') {
            steps {
                sh '''
                    node --version
                    npm --version
                    docker --version
                    docker info
                '''
            }
        }

        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Tests') {
            steps {
                echo 'Tests Vitest désactivés temporairement'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'

                archiveArtifacts(
                    artifacts: 'dist/**',
                    fingerprint: true
                )
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    docker.build(
                        "${DOCKER_IMAGE}:${BUILD_NUMBER}",
                        '-f Manlist_Front.Dockerfile .'
                    )
                }
            }
        }

        stage('Security Scan') {
            when {
                expression {
                    return false
                }
            }

            steps {
                sh 'npm audit --omit=dev --audit-level=high'
            }
        }

        stage('Push Registry') {
            when {
                expression {
                    return false
                }
            }

            steps {
                echo 'Push Docker à configurer plus tard'
            }
        }

        stage('Deploy') {
            when {
                expression {
                    return false
                }
            }

            steps {
                echo 'Déploiement à configurer plus tard'
            }
        }
    }

    post {
        success {
            echo "Frontend construit : ${DOCKER_IMAGE}:${BUILD_NUMBER}"
        }

        failure {
            echo "Échec du pipeline frontend : ${BUILD_URL}"
        }

        always {
            cleanWs()
        }
    }
}