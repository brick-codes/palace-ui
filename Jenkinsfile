pipeline {
  agent any

  stages {
    stage('Deploy') {
      when {
        expression { env.BRANCH_NAME == "auto-deploy" }
      }
      steps {
        sshagent (credentials: ['jenkins-ssh-nfs']) {
          sh 'scp -o StrictHostKeyChecking=no -r . flandoo_brickcodes@ssh.phx.nearlyfreespeech.net:/home/public/palace'
        }
      }
    }
  }
}
