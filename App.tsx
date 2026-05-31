import React from 'react';
import {StatusBar} from 'react-native';
import CameraScreen from './src/screens/CameraScreen';

const App = () => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <CameraScreen />
    </>
  );
};

export default App;