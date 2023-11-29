import React from 'react';
import ReactDOM from 'react-dom';
import { GlobalStyles } from '@contentful/f36-components';
import { SDKProvider } from '@contentful/react-apps-toolkit';
import App from './App';
import LocalhostWarning from './components/LocalhostWarning';

const container = document.getElementById('root')!;

if (process.env.NODE_ENV === 'development' && window.self === window.top) {
  // You can remove this if block before deploying your app
  ReactDOM.render(<LocalhostWarning />, container);
} else {
  ReactDOM.render(
    <SDKProvider>
      <GlobalStyles />
      <App />
    </SDKProvider>,
    container
  );
}
