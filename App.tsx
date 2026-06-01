import 'react-native-gesture-handler';
import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {StatusBar} from 'react-native';
import './src/i18n';
import {getLanguage} from './src/services/StorageService';
import i18n from './src/i18n';
import SplashScreen from './src/screens/SplashScreen';
import AppNavigator from './src/screens/Navigation';

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    getLanguage().then(lang => {
      i18n.changeLanguage(lang);
      setI18nReady(true);
    });
  }, []);

  if (!i18nReady) return null;

  if (showSplash) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#050508" />
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#050508" />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </>
  );
};

export default App;