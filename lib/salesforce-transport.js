'use strict';

var util = require('util');
var neoAsync = require('neo-async');
var FuelRest = require('fuel-rest');
var emailAddresses = require('email-addresses');

var packageData = require('../package.json');

function SalesforceError(message, extra) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.extra = extra;
}

util.inherits(SalesforceError, Error);

function SalesforceTransport(options) {
  this.name = 'Salesforce';
  this.version = packageData.version;

  options = options || {};

  if (typeof options.externalKey !== 'string') {
    throw new Error('missing externalKey');
  }

  this.externalKey = options.externalKey || packageData.name;
  this.salesforceClient = new FuelRest(options);
}

SalesforceTransport.prototype.send = function send(mail, callback) {
  var data = mail.data || {};

  var toAddrs = emailAddresses.parseAddressList(data.to) || [];
  var fromAddr = emailAddresses.parseOneAddress(data.from) || {};

  var externalKey = this.externalKey;
  var salesforceClient = this.salesforceClient;

  function iterator(item, next) {
    var options = {
      uri: '/messaging/v1/messageDefinitionSends/key:' + externalKey + '/send',
      json: {
        From: {
          Name: fromAddr.name,
          Address: fromAddr.address
        },
        To: {
          Address: item.address,
          SubscriberKey: item.address,
          ContactAttributes: {
            SubscriberAttributes: {
              subject: data.subject,
              text: data.text,
              html: data.html
            }
          }
        }
      }
    };

    salesforceClient.post(options, function done(err, response) {
      if (err) {
        return next(err);
      }

      if (response.body.responses[0].hasErrors) {
        var messageErrors = response.body.responses[0].messageErrors;
        return next(new SalesforceError(messageErrors[0].messageErrorStatus, messageErrors));
      }

      return next(null, response.body.responses[0].recipientSendId);
    });
  }

  return neoAsync.map(toAddrs, iterator, function done(err, result) {
    if (err) {
      return callback(err);
    }

    return callback(null, { messageId: result[0] });
  });
};

module.exports = function(options) {
  return new SalesforceTransport(options);
};
