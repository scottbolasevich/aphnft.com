/* eslint-disable no-unused-vars */
'use strict'
import React from 'react'
import ReactDOM from 'react-dom'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { StepsStyleConfig as Steps } from 'chakra-ui-steps';
import {createBrowserHistory} from "history"
import App  from './App'
require('./index.css');

const history = createBrowserHistory();
const theme = extendTheme({
  components: {
    Steps,
  },
});

ReactDOM.render(<ChakraProvider theme={theme}>
                    <App history={history} />
                </ChakraProvider>, document.getElementById('root'))