import 'react';

declare module 'react' {
  interface JSX {
    IntrinsicElements: {
      [elemName: string]: any;
    };
  }
}

declare module 'react/jsx-runtime' {
  export namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
} 