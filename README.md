# nodemailer-salesforce-transport

A Salesforce Marketing Cloud (formerly ExactTarget) transport for Nodemailer.

[![Build Status](https://travis-ci.org/Rebelmail/nodemailer-salesforce-transport.svg?branch=master)](https://travis-ci.org/Rebelmail/nodemailer-salesforce-transport)
[![NPM version](https://badge.fury.io/js/nodemailer-salesforce-transport.png)](http://badge.fury.io/js/nodemailer-salesforce-transport)

## Example

```javascript
'use strict';

var nodemailer = require('nodemailer');

var salesforceTransport = require('nodemailer-salesforce-transport');

var transport = nodemailer.createTransport(salesforceTransport({
  triggeredSendDefinitionKey: 'triggeredSendDefinitionKey',
  auth: {
    clientId: 'clientId',
    clientSecret: 'clientSecret'
  }
}));

transport.sendMail({
  from: 'sender@example.com',
  to: 'user@example.com',
  subject: 'Hello',
  html: '<p>How are you?</p>'
}, function(err, info) {
  if (err) {
    console.error(err);
  } else {
    console.log(info);
  }
});
```
