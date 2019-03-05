/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated from 'react-native-reanimated';
import { PanGestureHandler, State, TapGestureHandler } from 'react-native-gesture-handler';

const { Value, add,debug, cond, eq, interpolate, set } = Animated;
type Node<T> = Animated.Node<T>;

type Props = {};
export default class App extends Component<Props> {
  gestureEvent: (...args: any[]) => void;
  _opacity: Node<number>;
  private _offsetX: Node<number>;
  _rotation: Animated.Node<number>;

  constructor() {
    super();

    const state = new Value(-1);
    const dx = new Value(0);
    const xStart = new Value(0);

    this._offsetX = cond(eq(state, State.END), [
        set(xStart, add(xStart, dx)),
        xStart],
      add(xStart, dx));

    //this._opacity = cond(eq(state, State.BEGAN), 0.2, 1);
    this._opacity = interpolate(this._offsetX,{
      inputRange: [-200, 200],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    this._rotation = interpolate(this._offsetX,{
      inputRange: [-200, 200],
      outputRange: [-3.14159, 3.14159],
      extrapolate: 'clamp',
    });

    this.gestureEvent = Animated.event([{
      nativeEvent: { state, translationX: dx }
    }]);
  }
  render() {
    return (
      <View style={styles.container}>
        <PanGestureHandler onHandlerStateChange={this.gestureEvent}
          onGestureEvent={this.gestureEvent}>
          <Animated.View style={[styles.box, {
            opacity: this._opacity,
            transform: [
              {
                translateX: this._offsetX,
                rotate: this._rotation
              }
            ]}]} />
        </PanGestureHandler>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  box: {
    height: 100,
    width: 100,
    backgroundColor: 'red',
  },
});
