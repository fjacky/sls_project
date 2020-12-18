import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { createLogger } from '../../utils/logger'
import { generateUploadUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'

const logger = createLogger('generateUploadUrl')


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)
  const userId = getUserId(event)
  const todoId = event.pathParameters.todoId

  try {
    const uploadUrl = await generateUploadUrl(userId, todoId)
    return {
      statusCode: 201,
      body: JSON.stringify({
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        uploadUrl
      })
    }
   } catch (error) {
      return {
        statusCode: 400,
        body: error
      }
    }
})


handler.use(
  cors({
    credentials: true
  })
)
