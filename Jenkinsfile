pipeline {
   agent any

   stages {
      stage('Deploy') {
         when {
            expression { env.BRANCH_NAME == "master" }
         }
         steps {
            sshagent (credentials: ['jenkins-ssh-nfs']) {
               sh 'rsync -avr -e "ssh -l flandoo_brickcodes -o StrictHostKeyChecking=no" --exclude ".git" . ssh.phx.nearlyfreespeech.net:/home/public/palace'
            }
         }
      }
   }
}
