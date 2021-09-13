exports.handler = function(context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();
    twiml.dial({callerId:'client:alice'}).client('alice');

    // twiml.say("Congratulations! You have received your first inbound call! Good bye.");
  callback(null, twiml);
};