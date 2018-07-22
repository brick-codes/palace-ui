pipeline {
  agent any

  stages {
    stage('Deploy') {
      when {
        expression { env.BRANCH_NAME == "master" }
      }
      steps {
        sshagent (credentials: ['jenkins-ssh-nfs']) {
          sh 'scp -o StrictHostKeyChecking=no -rp . flandoo_brickcodes@ssh.phx.nearlyfreespeech.net:/home/public/palace'
        }
      }
    }
  }
}
