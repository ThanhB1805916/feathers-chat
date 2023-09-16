pipeline {
  agent any
  stages {
    stage('Ls') {
      steps {
        sh 'ls -la'
      }
    }

    stage('Install package ') {
      steps {
        nodejs("NodeJS-20.6.1"){
          sh 'npm install'
        }
      }
    }

  }
}
