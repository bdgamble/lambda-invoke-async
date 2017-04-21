# lambda-invoker

Module that allows invoking a lambda function synchronously via the `RequestResponse` invocationType or asynchronously via the `Event` invocationType.

# Usage

## new Invoker(options)
Constructor for the class.
- **options** - { Object, optional } - an object to provide configuration options.
  - **logger** - { Object, optional } - a valid logger. If no logger is provided, no debug information or errors will be logged.

```javascript
const Invoker = require('lambda-invoker');
const logger = require('./path/to/your/logger');

// no logger
const invoker = new Invoker();

// logger as option
const invoker2 = new Invoker({ logger });
```

## invoke(options, cb)
Method to synchronously invoke a lambda function.
- **options** - { Object, required } - invoke options for lambda
  - **functionName** - { String, required } - the lambda function you wish to invoke.
  - **payload** - { Object, required } - the payload you wish to send to the lambda function.
  - **clientContext** - { Object, base64-encoded } - used to pass client-specific information to the lambda function being invoked via the context variable.
- **cb** - { function } - takes params err and result and is called on success or failure of invoking the lambda function. By default returns a promise that rejects on error or resolves with the result from invoking the lambda.

```javascript
const Invoker = require('lambda-invoker');

const invoker = new Invoker();

// lambda handler
module.exports.handler = function(event, context, cb) {
  const invokeOptions: {
    functionName: 'testFunctionName',
    payload: { data: 'blah' },
    clientContext: { requestId: context.awsRequestId }
  };
  invoker.invoke(invokeOptions, cb);
};
```

## invokeAsync(functionName, payload, clientContext, cb)
Method to asynchronously invoke a lambda function.
- **options** - { Object, required } - invoke options for lambda
  - **functionName** - { String, required } - the lambda function you wish to invoke.
  - **payload** - { Object, required } - the payload you wish to send to the lambda function.
  - **clientContext** - { Object, base64-encoded } - used to pass client-specific information to the lambda function being invoked via the context variable.
- **cb** - { function } - takes params err and result and is called on success or failure of invoking the lambda function. By default returns a promise that rejects on error or resolves with the result from invoking the lambda.

```javascript
const Invoker = require('lambda-invoker');

const invoker = new Invoker();

// lambda handler
module.exports.handler = function(event, context, cb) {
  const invokeOptions: {
    functionName: 'testFunctionName',
    payload: { data: 'blah' },
    clientContext: { requestId: context.awsRequestId }
  };
  invoker.invokeAsync(invokeOptions, cb);
};
```
