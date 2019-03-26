import React, {useRef} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated from 'react-native-reanimated';
import { PanGestureHandler, State, PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';

const { Clock, Value, debug, add, divide, clockRunning, startClock, sin, sub, multiply, stopClock, cond, not, eq, interpolate, set } = Animated;
type Node<T> = Animated.Node<T>;
type Adaptable<T> = Animated.Adaptable<T>;

const pi = 3.141592

interface AnimationState {
  gestureEvent: (event: PanGestureHandlerStateChangeEvent) => void;
  opacity: Node<number>;
  offsetX: Node<number>;
  rotation: Animated.Node<number>;
  offsetY: Animated.Node<number>;
}

function buildAnimation() {
  const state = new Value(-1);
  const dx = new Value(0);
  const x = new Value(0);
  const y = new Value(0);
  const clock = new Clock();

  const dy = multiply(sin(divide(clock, 500)), 200);
  
  const offsetY = cond(clockRunning(clock), add(y, dy), y);

  const ifClockIsNotRunning = (action: Adaptable<number>) => cond(not(clockRunning(clock)), action);
    
  const offsetX =
    cond(eq(debug('state', state), State.BEGAN), [
        ifClockIsNotRunning([set(y, sub(y, dy)), startClock(clock)]),
        add(x, dx)
      ],
      cond(eq(state, State.ACTIVE),
        add(x, dx),
        [ stopClock(clock), set(y, add(y, dy)), set(x, add(x, dx)) ]
        )
      );

  const opacity = interpolate(offsetX,{
    inputRange: [-200, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const rotation = interpolate(offsetX,{
    inputRange: [-200, 200],
    outputRange: [-pi, pi],
    extrapolate: 'clamp',
  });
  
  const gestureEvent = Animated.event([{
    nativeEvent: { state, translationX: dx }
  }]);

  return {gestureEvent, opacity, offsetX, offsetY, rotation};
}

export default function App() {
  const sRef = useRef<AnimationState>();
  const s = sRef.current || (sRef.current = buildAnimation());

  return (
    <View style={styles.container}>
      <PanGestureHandler onHandlerStateChange={s.gestureEvent}
        onGestureEvent={s.gestureEvent}>
        <Animated.View style={[styles.box, {
          opacity: s.opacity,
          transform: [
            {
              translateX: s.offsetX,
              translateY: s.offsetY,
              rotate: s.rotation
            }
          ]}]} />
      </PanGestureHandler>
    </View>
  );
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
