import Connector, { OAuthOptions, createConnector } from "../src/connector"

const request = require("../../request/src/request")
request.default = jest.fn().mockImplementation((options) : Promise<object> => {
    return options
})

describe("@connector", () => {

    let successfulConnector : Connector
    let oauthOptions : OAuthOptions

    beforeAll(() => {
        successfulConnector = new Connector('will', 'secret', 'code')
        oauthOptions = {
            client_id : 'will',
            client_secret : 'secret',
            url : 'https://auth.code.workgrid.com/oauth2/token',
            scope: 'com.workgrid.api/notifications.all'
        }
    })

    test("createJobs forms correct options on call", async () => {
        const createJobsOutput = await successfulConnector.createJobs([{}])
        expect(createJobsOutput).toEqual({
            oauthOptions : oauthOptions,
            method: 'post',
            url: 'https://code.workgrid.com/v2/jobs',
            data: [{}]
        })
    })

    test("createJob is equivalent to createJobs when given a single job", async () => {
        const createJobOutput = await successfulConnector.createJob({})
        const createJobsOutput = await successfulConnector.createJobs([{}])
        expect(createJobOutput).toEqual(createJobsOutput)
    })

    test("getJob forms correct options on call", async () => {
        const getJobOutput = await successfulConnector.getJob('1')
        expect(getJobOutput).toEqual({
            oauthOptions : oauthOptions,
            method : 'get',
            url:`https://code.workgrid.com/v2/jobs/1`
        })
    })

    test("getEvents forms correct options on call", async () => {
        const eventsOptions = {
            limit : 50,
            cursor : "",
            eventStatus : "processed",
            eventType : "Notification.Action"
        }
        const getEventsOutput = await successfulConnector.getEvents(eventsOptions)
        expect(getEventsOutput).toEqual({
            oauthOptions : oauthOptions,
            method : 'get',
            url : `https://code.workgrid.com/v2/events`,
            data : eventsOptions
        })
    })

    test("getEvent forms correct options on call", async () => {
        const getEventOutput = await successfulConnector.getEvent('1')
        expect(getEventOutput).toEqual({
            oauthOptions : oauthOptions,
            method : 'get',
            url : `https://code.workgrid.com/v2/events/1`
        })
    })

    test("updateEventStatus forms correct options on call", async () => {
        const updateEventStatusOutput = await successfulConnector.updateEventStatus('1')
        expect(updateEventStatusOutput).toEqual({
            oauthOptions : oauthOptions,
            method : 'put',
            url : `https://code.workgrid.com/v2/events/1/status`,
            data : {
                status : 'processed'
            }
        })
    })

})