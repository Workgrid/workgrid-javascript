//import Connector from '../src/connector'

jest.setTimeout(10000)

describe('a local test', () => {
  //     let connector: Connector
  //     let data: object

  //     beforeAll(() => {
  //       connector = new Connector({
  //         clientId: '67mqrnch63j22q5t1rrfl9ud2h',
  //         clientSecret: '122beof502vn7gi9asltu07ejupoat12lkgb7hphotssq2v5dcnu',
  //         companyCode: 'workgridsoftware',
  //         grantType: 'client_credentials',
  //         scopes: ['com.workgrid.api/notifications.all']
  //       })
  //       data = {
  //         type: 'notification.create',
  //         data: {
  //           location: 'toknow',
  //           audience: [
  //             {
  //               type: 'email',
  //               value: 'William.Toohey@libertymutual.com'
  //             }
  //           ],
  //           category: 'FYI',
  //           summary: {
  //             title: 'Hey Will',
  //             body: 'Chicken Butt',
  //             image: {
  //               altText: 'Beans',
  //               url: 'https://images-prod.healthline.com/hlcmsresource/images/AN_images/AN78-Beans_dry-732x549-Thumb.jpg'
  //             }
  //           },
  //           detail: {
  //             type: 'url',
  //             url: 'https://images-prod.healthline.com/hlcmsresource/images/AN_images/AN78-Beans_dry-732x549-Thumb.jpg'
  //           }
  //         }
  //       }
  //     })

  //   test('make a notification', async () => {
  //     const response = await connector.createJob(data)
  //   })

  test('fds', () => {
    expect(true).toBe(true)
  })
})
