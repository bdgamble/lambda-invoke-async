'use strict';

const AWS = require('aws-sdk');

module.exports = class LambdaInvoker {
  constructor(options) {
    options = options || {};
    this._client = options.client || new AWS.Lambda();
    this.logger = options.logger;
  }

  _formatClientContext(context) {
    if (!context) {
      return null;
    }
    return new Buffer(JSON.stringify(context)).toString('base64');
  }

  _invokeWithType(invocationType, options, cb) {
    const logger = this.logger;
    cb = cb || function defaultCB(err, result) {
      return new Promise((resolve, reject) => {
        if (err) {
          logger && logger.error({ err, options }, 'failed to invoke lambda');
          err._logged = true;
          reject(err);
          return;
        }
        logger && logger.info({ result }, 'successfully invoked lambda function')
        resolve(result);
      });
    };

    if (!options.functionName || !options.payload) {
      return cb(new Error('functionName and payload are required properties of the options parameter.'));
    }

    logger && logger.debug({
      options,
      invocationType
    }, 'trying to invoke lambda');

    return this._client
      .invoke({
        InvocationType: invocationType,
        FunctionName: options.functionName,
        Payload: JSON.stringify(options.payload),
        ClientContext: this._formatClientContext(options.clientContext)
      })
      .promise()
      .then(result => cb(null, result))
      .catch(cb);
  }

  invoke(options, cb) {
    return this._invokeWithType('RequestResponse', options, cb);
  }

  invokeAsync(options, cb) {
    return this._invokeWithType('Event', options, cb);
  }
}
