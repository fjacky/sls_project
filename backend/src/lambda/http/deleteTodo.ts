import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { deleteTodo } from '../../businessLogic/todos'


const logger = createLogger('createTodo')


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => { 
  logger.info('Processing event: ', event)

  const userId = getUserId(event)
  const todoId = event.pathParameters.todoId

  await deleteTodo(userId, todoId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: ''
  }
})

handler.use(
  cors({
    credentials: true
  })
)
