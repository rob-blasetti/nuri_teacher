declare module 'react-native-vector-icons/Ionicons' {
  import { ComponentType } from 'react';

  type IoniconsProps = {
    name: string;
    size?: number;
    color?: string;
  };

  type IoniconsComponent = ComponentType<IoniconsProps> & {
    loadFont: () => Promise<void>;
  };

  const Ionicons: IoniconsComponent;
  export default Ionicons;
}
