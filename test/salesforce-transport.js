'use strict';

var sinon = require('sinon');
var expect = require('chai').expect;

var salesforceTransport = require('..');

var VERSION = require('../package.json').version;

describe('SalesforceTransport', function() {
  var options = {
    externalKey: 'externalKey',
    auth: {
      clientId: 'clientId',
      clientSecret: 'clientSecret'
    }
  };

  it('should expose name and version', function() {
    var transport = salesforceTransport(options);
    expect(transport.name).to.equal('Salesforce');
    expect(transport.version).to.equal(VERSION);
  });

  describe('#send', function(done) {
    var transport = salesforceTransport(options);
    var client = transport.salesforceClient;

    var payload = {
      data: {
        to: 'SpongeBob SquarePants <spongebob@bikini.bottom>, Patrick Star <patrick@bikini.bottom>',
        from: 'Gary the Snail <gary@bikini.bottom>',
        subject: 'Meow...',
        text: 'Meow!',
        html: '<p>Meow!</p>'
      }
    };

    afterEach(function() {
      client.post.restore();
    });

    it('should return error when response hasErrors', function(done) {
      var stub = sinon.stub(client, 'post', function(options, callback) {
        callback(null, {
          body: {
            responses: [{
              hasErrors: true,
              messageErrors: [{
                messageErrorStatus: 'An error occured'
              }]
            }]
          }
        });
      });

      transport.send(payload, function(err, info) {
        expect(err).to.exist;
        expect(stub.calledOnce).to.be.true;
        done();
      });
    });

    it('should return messageId on success', function(done) {
      var stub = sinon.stub(client, 'post', function(options, callback) {
        callback(null, { body: { responses: [{ recipientSendId: 'fake-id' }] } });
      });

      transport.send(payload, function(err, info) {
        expect(err).to.not.exist;
        expect(stub.calledTwice).to.be.true;
        expect(info.messageId).to.equal('fake-id');
        done();
      });
    });
  });
});
