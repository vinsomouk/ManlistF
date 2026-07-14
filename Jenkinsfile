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
        DOCKER_IMAGE = 'vmk700/manlist-front'
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
                echo 'Tests Vitest temporairement désactivés'
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
            steps {
                script {
                    docker.withRegistry(
                        'https://index.docker.io/v1/',
                        'dockerhub-creds'
                    ) {
                        docker.image(
                            "${DOCKER_IMAGE}:${BUILD_NUMBER}"
                        ).push()

                        docker.image(
                            "${DOCKER_IMAGE}:${BUILD_NUMBER}"
                        ).push('latest')
                    }
                }
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
            echo "Pipeline frontend réussi : ${DOCKER_IMAGE}:${BUILD_NUMBER}"
        }

        failure {
            echo "Échec du pipeline frontend : ${BUILD_URL}"
        }

        always {
            cleanWs()
        }
    }
}