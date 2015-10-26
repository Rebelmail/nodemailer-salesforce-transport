'use strict';

var neoAsync = require('neo-async');
var FuelRest = require('fuel-rest');
var emailAddresses = require('email-addresses');

var packageData = require('../package.json');

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
