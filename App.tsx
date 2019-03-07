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
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const { Clock, Value, debug, add, divide, clockRunning, startClock, sin, sub, multiply, stopClock, cond, not, eq, interpolate, set } = Animated;
type Node<T> = Animated.Node<T>;
type Adaptable<T> = Animated.Adaptable<T>;

type Props = {};
export default class App extends Component<Props> {
  gestureEvent: (...args: any[]) => void;
  tapGestureEvent: (...args: any[]) => void;
  _opacity: Node<number>;
  private _offsetX: Node<number>;
  _rotation: Animated.Node<number>;
  _offsetY: Animated.Node<number>;

  constructor(props: Props) {
    super(props);

    const state = new Value(-1);
    const tapState = new Value(-1);
    const dx = new Value(0);
    const x = new Value(0);
    const y = new Value(0);
    const clock = new Clock();

    const dy = multiply(sin(divide(clock, 1000)), 200);
    this._offsetY =
      cond(clockRunning(clock), [
        add(y, dy),
      ],
        [
          
          y,
        ]
      );

    const ifClockIsNotRunning = (action: Adaptable<number>) => cond(not(clockRunning(clock)), action);
      
    this._offsetX =
      cond(eq(debug('state', state), State.BEGAN), [
          ifClockIsNotRunning([set(y, sub(y, dy)), startClock(clock)]),
          add(x, dx)
        ],
        cond(eq(state, State.ACTIVE),
          add(x, dx),
          [ stopClock(clock), set(y, add(y, dy)), set(x, add(x, dx)) ]
          )
        );

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

    this.tapGestureEvent = Animated.event([{
      nativeEvent: { state: tapState }
    }]);
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
                translateY: this._offsetY,
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
