import { Client } from "../src/client"

describe("Testing Client", () => {
    describe("apiCall()", () => {
        let client : Client
        let successfulRequest : any
        let options : any
    
        beforeAll(() => {
            client = new Client("67mqrnch63j22q5t1rrfl9ud2h", "122beof502vn7gi9asltu07ejupoat12lkgb7hphotssq2v5dcnu", "https://workgridsoftware.dev.workgrid.com/")
            successfulRequest = jest.fn(() => ({ data : { status : "Success" }}))
            options = { params : null, request : successfulRequest, url : "" }
        })
        
        test("Custom request is invoked when provided", () => {
            client.callApi(options).then(() =>
                expect(successfulRequest).toBeCalled()
            )
        })
        test("Successful API call results in successful status", () => {
            client.callApi(options).then(data =>
                expect(data.status).toBe("Success"))
        })
        test("Unsuccessful API call status results in failed status", async () => {
            let failedStatus = { data : { status : "Failed"} }
            let request = jest.fn(() => (failedStatus))
            let newOptions = Object.assign({}, options, { request : request })
            await expect(client.callApi(newOptions)).rejects.toEqual(failedStatus)
        })
        test("Error from API call results in exception catching", async () => {
            let request : any = jest.fn(() => { throw new Error("Failed.") });
            let newOptions = Object.assign({}, options, { request : request })
            await expect(client.callApi(newOptions)).rejects.toThrow()
        })
    })
})