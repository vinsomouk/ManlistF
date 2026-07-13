pipeline {
    agent {
        label 'Agent_Manlist_Front'
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

        stage('Install') {
            steps {
                sh 'pnpm install --frozen-lockfile'
            }
        }

        stage('Lint') {
            steps {
                sh 'pnpm run lint'
            }
        }

       stage('Tests') {
    steps {
        echo 'Tests Vitest désactivés temporairement'
    }
}

        stage('Build') {
            steps {
                sh 'pnpm run build'
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
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
                expression { false }
            }
            steps {
                sh 'pnpm audit --prod'
            }
        }

        stage('Push Registry') {
            when {
                expression { false }
            }
            steps {
                echo 'Push Docker à configurer plus tard'
            }
        }

        stage('Deploy') {
            when {
                expression { false }
            }
            steps {
                echo 'Déploiement à configurer plus tard'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}