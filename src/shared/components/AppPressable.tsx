import React, { PropsWithChildren } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

type AppPressableProps = PropsWithChildren<PressableProps & {
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  pressedStyle?: StyleProp<ViewStyle>;
}>;

export function AppPressable({ children, style, pressedStyle, ...props }: AppPressableProps) {
  return (
    <Pressable
      {...props}
      style={state => {
        const baseStyle = typeof style === 'function' ? style(state) : style;
        return [baseStyle, state.pressed ? [{ opacity: 0.9, transform: [{ scale: 0.985 }] }, pressedStyle] : null];
      }}>
      {children}
    </Pressable>
  );
}
