pipeline {
    agent {
        label 'Agent_Manlist_Front'
    }

    environment {
        DOCKER_IMAGE = "manlist-front"
        DOCKER_REGISTRY = "your-registry.com/manlist"
        VERSION = "${env.BUILD_ID}-${env.GIT_COMMIT.take(7)}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'git submodule update --init --recursive'
            }
        }

        stage('Install & Test') {
            steps {
                sh 'pnpm install --frozen-lockfile'
                sh 'pnpm run lint'
                sh 'pnpm run test:ci'
            }
            post {
                always {
                    junit '**/junit.xml'
                    cobertura coberturaReportFile: '**/coverage/lcov.info'
                }
            }
        }

        stage('Build Production') {
            steps {
                sh 'pnpm run build'
                archiveArtifacts artifacts: 'dist/**'
            }
        }

        stage('Security Scan') {
            steps {
                sh 'npm audit --production --json > audit.json'
                dependencyCheck additionalArguments: '--scan ./ --format JSON', odcInstallation: 'OWASP-DC'
                owaspDependencyCheck pattern: '**/dependency-check-report.json'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${DOCKER_IMAGE}:${VERSION}")
                }
            }
        }

        stage('Push to Registry') {
            when {
                branch 'main'
            }
            steps {
                script {
                    docker.withRegistry('https://${DOCKER_REGISTRY}', 'docker-creds') {
                        docker.image("${DOCKER_IMAGE}:${VERSION}").push()
                    }
                }
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'main'
            }
            steps {
                sshagent(['staging-server-creds']) {
                    sh """
                    ssh user@staging-server "
                        docker pull ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${VERSION} && \
                        docker stop manlist-front || true && \
                        docker rm manlist-front || true && \
                        docker run -d \\
                            --name manlist-front \\
                            --restart always \\
                            -p 8080:80 \\
                            -v /path/to/env:/app/.env:ro \\
                            ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${VERSION}
                    "
                    """
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            slackSend channel: '#deployments', message: "Build ${VERSION} réussi ✅"
        }
        failure {
            slackSend channel: '#errors', message: "Échec du build ${VERSION} ❌"
        }
    }
}