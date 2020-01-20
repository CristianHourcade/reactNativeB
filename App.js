import React, { Component } from 'react';
import { Platform, NativeModules } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import AppNavigator from './navigation/Router';
import { createAppContainer } from 'react-navigation';
import { initializeApp } from './utilities/FirebaseModule';
import Receiver from './screens/receiverNotification';
const AppContainer = createAppContainer(AppNavigator);

export default class App extends Component {
  render() {
    initializeApp();
    console.ignoredYellowBox = ['Warning: Each', 'Warning: Failed']
    return (


        <AppContainer />
        

    );
  }
}


