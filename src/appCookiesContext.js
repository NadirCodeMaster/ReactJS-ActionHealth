import Cookies from 'universal-cookie';

// We'll export this cookies context for use
// by code that needs to add/remove change
// listeners outside of a component.
// (use withCookie() from react-cookies
//  within components for most things).
export let appCookiesContext = new Cookies();
