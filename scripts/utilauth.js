function authSignature(conKey,conSec,url,method){
  
    var accessor =
        {
            consumerSecret: conSec,
            tokenSecret: null,
            serviceProvider:
            {
                accessTokenURL: url
            },
            consumerKey: conKey
        };
    var message =
        {
            action: accessor.serviceProvider.accessTokenURL,
            method: method,
            parameters: []
        };
    message.parameters.push(["oauth_consumer_key", accessor.consumerKey]);
    message.parameters.push(["oauth_signature_method", "HMAC-SHA1"]);
    message.parameters.push(["oauth_version", "1.0"]);
    message.parameters.push(["oauth_timestamp", ""]);
    message.parameters.push(["oauth_nonce", ""]);
    message.parameters.push(["oauth_signature", ""]);
    

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);
    var realm=url;
    var authorizationHeader = OAuth.getAuthorizationHeader(realm, message.parameters);    
    var requestBody = OAuth.formEncode(message.parameters);   

    var parameters={
        "relam": realm,
        "msgParameters": message.parameters
    } 
     return parameters;
     }

     