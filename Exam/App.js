/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {StackNavigator} from 'react-navigation';

import Client from './Client.js';
import Theater from './Theater.js';
import Main from './Main.js';
import Admin from './Admin';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

global.dataArray = [];
global.theaterArray = [];
global.reserved = [];
global.purchased = [];
global.confirmed = [];
global.baseUrl = 'http://192.168.43.5:4021/';

const ModalStack = StackNavigator({
  Main: {
    screen: Main,
  },
  Client: {
    screen: Client,
  },
  Theater: {
    screen: Theater,
  },
  Admin:{
    screen: Admin,
  }
});

export default ModalStack;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
