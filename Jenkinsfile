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

        stage('Dependency Security Audit') {
            steps {
                sh '''
                    echo "Audit des dépendances frontend de production..."
                    npm audit --omit=dev --audit-level=high
                '''
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

        stage('Scan Docker Configuration') {
            steps {
                sh '''
                    docker run --rm \
                        -v "$PWD:/workspace" \
                        aquasec/trivy:latest config \
                        --severity HIGH,CRITICAL \
                        --exit-code 1 \
                        /workspace
                '''
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

        stage('Scan Docker Image') {
            steps {
                sh '''
                    docker run --rm \
                        -v /var/run/docker.sock:/var/run/docker.sock \
                        -v trivy-cache:/root/.cache/ \
                        aquasec/trivy:latest image \
                        --severity HIGH,CRITICAL \
                        --ignore-unfixed \
                        --exit-code 1 \
                        "${DOCKER_IMAGE}:${BUILD_NUMBER}"
                '''
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
                echo 'Déploiement à configurer après préparation de la VM'
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