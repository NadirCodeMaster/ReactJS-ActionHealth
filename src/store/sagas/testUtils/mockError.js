/**
 * Needed to mock up error structure for failed try catch
 */
export default function MockError(message) {
  this.response = {};
  this.response.data = {
    errors: {
      error1: ['foo, bar'],
      error2: ['baz, oof']
    }
  };
}
MockError.prototype = Object.create(Error.prototype);
