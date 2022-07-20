import { createStore, applyMiddleware } from 'redux';
import rootReducer from './reducers';
import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction';
import createSagaMiddleware from 'redux-saga';
import sagas from './sagas/index';
import { appHistory } from '../appHistory';

const configureStore = history => {
  const sagaMiddleware = createSagaMiddleware();
  const middleware = [sagaMiddleware];
  const composeEnhancers = composeWithDevTools({
    // options like actionSanitizer, stateSanitizer
  });
  const store = createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(...middleware))
  );
  sagaMiddleware.run(sagas, { history });
  return store;
};

const appStore = configureStore(appHistory);

export default appStore;
