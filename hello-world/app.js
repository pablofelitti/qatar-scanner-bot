const request = require('request');

function line(responseBody, searchElement) {
    let index = responseBody.indexOf(searchElement)
    return responseBody.substring(index, index + 27)
}

function sendMessage(line) {
    //TODO complete this
    console.log("--- SENDING MESSAGE")
}

function validateAndSendMessage(line, stringToValidateTo) {
    if (line !== stringToValidateTo) {
        console.log("Found line different than expected, this means there was a change")
        sendMessage(line)
    }
}

exports.lambdaHandler = async (event, context) => {
    try {
        let responseBody = await new Promise((resolve, reject) => {

            let options = {
                'method': 'GET',
                'url': 'https://qatarscanner.com/',
                'headers': {}
            };

            request(options, function (error, response) {
                if (error) reject();
                resolve(response.body)
            });
        })

        const m24Line = line(responseBody, "M24");
        const m39Line = line(responseBody, "M39");
        const m50Line = line(responseBody, "M50");

        validateAndSendMessage(m24Line, "M24 I... D.... RI... RD....");
        validateAndSendMessage(m39Line, "M39 I... D.... RI... RD....");
        validateAndSendMessage(m50Line, "M50 I... D.... RI... RD....");

    } catch (err) {
        console.log(err);
        return err;
    }
};
