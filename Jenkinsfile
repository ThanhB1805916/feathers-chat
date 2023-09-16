pipeline {
  agent any
  stages {
    stage('Checkout Code') {
      steps {
        git(url: 'https://github.com/ThanhB18059162022/feathers-chat', branch: 'master')
      }
    }
     stage('Ls') {
      steps {
        echo "hello world"
      }
    }

  }
}
