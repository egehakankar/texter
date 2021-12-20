const functions = require("firebase-functions");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
let admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
admin.firestore().settings({ignoreUndefinedProperties:true});

exports.addKey = functions.https.onRequest(async(req, res) => {
	res.set('Access-Control-Allow-Origin', '*');
	res.set("Access-Control-Allow-Credentials", "true");
	res.set("Access-Control-Allow-Methods", '*');
	res.set("Content-Type","application/json");
	res.set("Access-Control-Allow-Headers","Content-Type, Access-Control-Allow-Methods, Access-Control-Allow-Headers, Authorization, X-Requested-With");

	
    const tokens = await getTokens();

    if(tokens.includes(req.body.token) ){
    	res.send("Key Already Exists");
    }
    else {
    	if(req.body.token != undefined) {
    		await admin.firestore().collection('keys').add({
    			keyA: req.body.token,
    			photos: true,
    			uid: req.body.uid
	    	});
	    	res.send("Added New Key");
    	}
    	else {
    		res.send("Empty Key");
    	}
    	
    }

});

async function getTokens() {
    const snapshot = await admin.firestore().collection('keys').get();
    return snapshot.docs.map(doc => doc.data().keyA);
}

exports.sendNotification2 = functions.https.onRequest(async(req, res) => {
	res.set('Access-Control-Allow-Origin', '*');
	res.set("Access-Control-Allow-Credentials", "true");
	res.set("Access-Control-Allow-Methods", '*');
	res.set("Content-Type","application/json");
	res.set("Access-Control-Allow-Headers","Content-Type, Access-Control-Allow-Origin ,Access-Control-Allow-Methods, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    const tokens = await getTokens();

    const index = tokens.indexOf(req.body.token);
    if (index > -1) {
  		tokens.splice(index, 1);
	}

    const payload = {
        notification: {
            title: req.body.name,
            body: req.body.body,
        },
        tokens: tokens,
    };
    await admin.messaging().sendMulticast(payload);
    
    res.send("sent");
});