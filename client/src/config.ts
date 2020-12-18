// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '3ywu178wdl'
export const apiEndpoint = `https://${apiId}.execute-api.eu-central-1.amazonaws.com/dev`

export const authConfig = {
  domain: 'dev-d0xra3u1.eu.auth0.com',            // Auth0 domain
  clientId: '86joCDF1YHM6Htqx7rzxhEppM5lNvbkX',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
