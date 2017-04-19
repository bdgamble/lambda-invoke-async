'use strict';

const AWS = require('aws-sdk');

module.exports = class LambdaInvoker {
  constructor(options) {
    options = options || {};
    this._client = new AWS.Lambda();
    this.logger = options.logger;
  }

  _formatClientContext(context) {
    if (!context) {
      return null;
    }
    return new Buffer(JSON.stringify(context)).toString('base64');
  }

  _invokeWithType(invocationType, functionName, payload, clientContext, cb) {
    const logger = this.logger;
    cb = cb || function defaultCB(err, result) {
      return new Promise((resolve, reject) => {
        if (err) {
          logger && logger.error({ err, functionName }, 'failed to invoke lambda');
          err._logged = true;
          reject(err);
          return;
        }
        logger && logger.info({ result }, 'successfully invoked lambda function')
        resolve(result);
      });
    };

    if (!functionName || !payload) {
      return cb(new Error('functionName and payload are required parameters.'));
    }

    logger && logger.debug({
      functionName,
      payload,
      clientContext,
      invocationType
    }, 'trying to invoke lambda');

    return this._client
      .invoke({
        InvocationType: invocationType,
        FunctionName: functionName,
        Payload: JSON.stringify(payload),
        ClientContext: this._formatClientContext(clientContext)
      })
      .promise()
      .then(result => cb(null, result))
      .catch(cb);
  }

  invoke(functionName, payload, clientContext, cb) {
    return this._invokeWithType('RequestResponse', functionName, payload, clientContext, cb);
  }

  invokeAsync(functionName, payload, clientContext, cb) {
    return this._invokeWithType('Event', functionName, payload, clientContext, cb);
  }
}
