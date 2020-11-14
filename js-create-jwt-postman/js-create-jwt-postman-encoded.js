// Set token expiration check flag
var getToken = true;

// Prepare timestamps
var currentTimestamp = Math.floor(Date.now() / 1000);
var expireryTimestamp = pm.environment.get('expireryTimestamp');
var jwt = pm.environment.get('jwt');

// Check token expiration
if (!jwt || !expireryTimestamp) {
    console.log('msg: Token or expirery time missing. Creating a new token.');
} else if (expireryTimestamp <= currentTimestamp) {
    console.log('msg: Token expired. Creating a new token.');
} else {
    getToken = false;
    console.log('msg: Token is still valid. Re-using the existing token.');
    console.log('msg: Token', jwt);
}

if (getToken === true) {

    // Get API Secret from Postman environment
    var apiSecret = pm.environment.get('apiSecret');

    // Set headers
    var header = {
        'typ': 'JWT',
        'alg': 'HS256'
    }

    // Set token expiration time
    var expireryTimestamp = currentTimestamp + 30; // Expires in 30 seconds from creation

    // Set payload
    var payload = {
        'iss': pm.environment.get('apiKey'),
        'ist': 'project',
        'iat': currentTimestamp,
        'exp': expireryTimestamp,
        'jti': pm.environment.get('jti')
    }

    function base64url(source) {
        // Encode in classical base64
        encodedSource = CryptoJS.enc.Base64.stringify(source);

        // Remove padding equal characters
        encodedSource = encodedSource.replace(/=+$/, '');

        // Replace characters according to base64url specifications
        encodedSource = encodedSource.replace(/\+/g, '-');
        encodedSource = encodedSource.replace(/\//g, '_');

        return encodedSource;
    }

    // Encode header
    var stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
    var encodedHeader = base64url(stringifiedHeader);

    // Encode payload
    var stringifiedData = CryptoJS.enc.Utf8.parse(JSON.stringify(payload));
    var encodedData = base64url(stringifiedData);

    // Build token
    var token = `${encodedHeader}.${encodedData}`;

    // Sign token
    var signature = CryptoJS.HmacSHA256(token, apiSecret);
    signature = base64url(signature);
    var signedToken = `${token}.${signature}`;

    // Set token and expiration time to variable
    pm.environment.set('jwt', signedToken);
    pm.environment.set('expireryTimestamp', expireryTimestamp);
    console.log('msg: Token', signedToken);

}