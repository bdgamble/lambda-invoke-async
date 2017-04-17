'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');

chai.use(chaiAsPromised);
const expect = chai.expect;

const Invoker = require('../');

function generateAWSPromise(value) {
  return {
    promise() {
      return Promise.resolve(typeof value === 'function' ? value() : value);
    }
  };
}

function jsonToBase64(obj) {
  if (!obj) {
    return null;
  }
  return new Buffer(JSON.stringify(obj)).toString('base64');
}

describe('lambda-invoke-async', () => {
  const TEST_FUNCTION_NAME = 'functionName';
  const TEST_PAYLOAD = { data: 'blah' };
  const TEST_CLIENT_CONTEXT = { context: 'some-context' };

  describe('constructor', () => {
    it('instantiates the client', () => {
      return expect(new Invoker())
        .to.have.property('_client');
    });

    it('sets the logger', () => {
      return expect(new Invoker({ logger: console }))
        .to.have.property('logger', console);
    });
  });

  describe('invoke', () => {
    let invoker;
    before(done => {
      invoker = new Invoker();
      this.sandbox = sinon.sandbox.create();
      done();
    });

    beforeEach(done => {
      this.invokeMock = this.sandbox.mock(invoker._client)
        .expects('invoke');
      done();
    });

    afterEach(done => {
      this.sandbox.restore();
      this.invokeMock.verify();
      done();
    });

    describe('throws validation error when', () => {
      it('is missing functionName', () => {
        this.invokeMock.never();
        return expect(invoker.invoke(undefined, undefined, undefined))
          .to.be.rejectedWith(Error, /functionName and payload are required parameters/);
      });

      it('is missing payload', () => {
        this.invokeMock.never();
        return expect(invoker.invoke(TEST_FUNCTION_NAME, undefined, undefined))
          .to.be.rejectedWith(Error, /functionName and payload are required parameters/);
      });
    });

    const testError = new Error('invocation error');
    const testData= { data: 'test data'};
    const testCBError = new Error('testCB Error');
    const testCBData= { data: 'testCB data'};
    function testCB(err, result) {
      return new Promise((resolve, reject) => {
        if (err) {
          console.error('Ignoring error: ', err);
          reject(testCBError);
          return;
        }
        console.info('Ignoring result: ', result);
        resolve(testCBData);
      });
    }

    [
      { testCase: 'with no callback', cb: undefined, expectedData: testData, expectedError: testError },
      { testCase: 'with callback', cb: testCB, expectedData: testCBData, expectedError: testCBError }
    ].forEach(test => {
      describe(test.testCase, () => {

        describe('throws error when', () => {
          it('should rethrow invocation error', () => {
            this.invokeMock.once()
              .returns(generateAWSPromise(() => Promise.reject(testError)));

            return expect(
              invoker.invoke(TEST_FUNCTION_NAME, TEST_PAYLOAD, TEST_CLIENT_CONTEXT, test.cb)
            )
            .to.be.rejectedWith(test.expectedError);
          });
        });

        describe('succeeds when', () => {
          it('given all parameters', () => {
            this.invokeMock.once().withExactArgs({
              InvocationType: 'RequestResponse',
              FunctionName: TEST_FUNCTION_NAME,
              Payload: JSON.stringify(TEST_PAYLOAD),
              ClientContext: jsonToBase64(TEST_CLIENT_CONTEXT)
            }).returns(generateAWSPromise(testData));

            return expect(
              invoker.invoke(TEST_FUNCTION_NAME, TEST_PAYLOAD, TEST_CLIENT_CONTEXT, test.cb)
            )
            .to.eventually.equal(test.expectedData);
          });

          it('should invoke lambda function correctly when clientContext is not passed', () => {
            this.invokeMock.once().withExactArgs({
              InvocationType: 'RequestResponse',
              FunctionName: TEST_FUNCTION_NAME,
              Payload: JSON.stringify(TEST_PAYLOAD),
              ClientContext: null
            }).returns(generateAWSPromise(testData));

            return expect(
              invoker.invoke(TEST_FUNCTION_NAME, TEST_PAYLOAD, undefined, test.cb)
            )
            .to.eventually.equal(test.expectedData);
          });
        });
      });
    });
  });

  describe('invokeAsync', () => {
    let invoker;
    before(done => {
      invoker = new Invoker();
      this.sandbox = sinon.sandbox.create();
      done();
    });

    beforeEach(done => {
      this.invokeMock = this.sandbox.mock(invoker._client)
        .expects('invoke');
      done();
    });

    afterEach(done => {
      this.sandbox.restore();
      this.invokeMock.verify();
      done();
    });

    describe('throws validation error when', () => {
      it('is missing functionName', () => {
        this.invokeMock.never();
        return expect(invoker.invokeAsync(undefined, undefined, undefined))
          .to.be.rejectedWith(Error, /functionName and payload are required parameters/);
      });

      it('is missing payload', () => {
        this.invokeMock.never();
        return expect(invoker.invokeAsync(TEST_FUNCTION_NAME, undefined, undefined))
          .to.be.rejectedWith(Error, /functionName and payload are required parameters/);
      });
    });

    const testError = new Error('invocation error');
    const testData= { data: 'test data'};
    const testCBError = new Error('testCB Error');
    const testCBData= { data: 'testCB data'};
    function testCB(err, result) {
      return new Promise((resolve, reject) => {
        if (err) {
          console.error('Ignoring error: ', err);
          reject(testCBError);
          return;
        }
        console.info('Ignoring result: ', result);
        resolve(testCBData);
      });
    }

    [
      { testCase: 'with no callback', cb: undefined, expectedData: testData, expectedError: testError },
      { testCase: 'with callback', cb: testCB, expectedData: testCBData, expectedError: testCBError }
    ].forEach(test => {
      describe(test.testCase, () => {

        describe('throws error when', () => {
          it('should rethrow invocation error', () => {
            this.invokeMock.once()
              .returns(generateAWSPromise(() => Promise.reject(testError)));

            return expect(
              invoker.invokeAsync(TEST_FUNCTION_NAME, TEST_PAYLOAD, TEST_CLIENT_CONTEXT, test.cb)
            )
            .to.be.rejectedWith(test.expectedError);
          });
        });

        describe('succeeds when', () => {
          it('given all parameters', () => {
            this.invokeMock.once().withExactArgs({
              InvocationType: 'Event',
              FunctionName: TEST_FUNCTION_NAME,
              Payload: JSON.stringify(TEST_PAYLOAD),
              ClientContext: jsonToBase64(TEST_CLIENT_CONTEXT)
            }).returns(generateAWSPromise(testData));

            return expect(
              invoker.invokeAsync(TEST_FUNCTION_NAME, TEST_PAYLOAD, TEST_CLIENT_CONTEXT, test.cb)
            )
            .to.eventually.equal(test.expectedData);
          });

          it('should invoke lambda function correctly when clientContext is not passed', () => {
            this.invokeMock.once().withExactArgs({
              InvocationType: 'Event',
              FunctionName: TEST_FUNCTION_NAME,
              Payload: JSON.stringify(TEST_PAYLOAD),
              ClientContext: null
            }).returns(generateAWSPromise(testData));

            return expect(
              invoker.invokeAsync(TEST_FUNCTION_NAME, TEST_PAYLOAD, undefined, test.cb)
            )
            .to.eventually.equal(test.expectedData);
          });
        });
      });
    });
  });
});
