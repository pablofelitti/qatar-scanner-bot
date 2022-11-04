const request = require('request')
const AWS = require('aws-sdk')
AWS.config.update({region: 'us-east-1'})
const sqs = new AWS.SQS({apiVersion: '2012-11-05'})

function line(responseBody, searchElement) {
    let index = responseBody.indexOf(searchElement)
    return responseBody.substring(index, index + 27)
}

async function validateAndSendMessage(line, stringToValidateTo) {
    if (line !== stringToValidateTo) {
        console.log("Found line different than expected, this means there was a change")
        await sendMessageToQueue(line)
    }
}

async function sendMessageToQueue(data) {

    let sqsOrderData = {
        MessageAttributes: {
            "EnvironmentId": {
                DataType: "String",
                StringValue: process.env.ENVIRONMENT
            },
            "Channel": {
                DataType: "String",
                StringValue: "qatar-scanner"
            }
        },
        MessageBody: data,
        QueueUrl: process.env.SQS_QUEUE_URL
    }

    console.log('sending message')
    await sqs.sendMessage(sqsOrderData).promise()
    console.log('message sent')
}

exports.lambdaHandler = async (event, context) => {
    try {
        let responseBody = await new Promise((resolve, reject) => {

            let options = {
                'method': 'GET',
                'url': 'https://qatarscanner.com/',
                'headers': {}
            }

            request(options, function (error, response) {
                if (error) reject()
                resolve(response.body)
            })
        })

        const m24Line = line(responseBody, "M24")
        const m39Line = line(responseBody, "M39")
        const m50Line = line(responseBody, "M50")

        await validateAndSendMessage(m24Line, "M24 I... D.... RI... RD....")
        await validateAndSendMessage(m39Line, "M39 I... D.... RI... RD....")
        await validateAndSendMessage(m50Line, "M50 I... D.... RI... RD....")

    } catch (err) {
        console.log(err)
        return err
    }
}
