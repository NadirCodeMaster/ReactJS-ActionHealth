import { createBrowserHistory } from 'history';

/**
 * Singleton history object.
 * @see https://k94n.com/es6-modules-single-instance-pattern
 */
export let appHistory = createBrowserHistory();
