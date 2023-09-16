pipeline {
  agent any
  stages {
    stage('Ls') {
      steps {
        ls -la
      }
    }

    stage('Install package ') {
      steps {
        sh 'npm install'
      }
    }

  }
}
