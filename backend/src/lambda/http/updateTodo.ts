import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { updateTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('generateUploadUrl')


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)

  const userId = getUserId(event)
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  try {
    await updateTodo(userId, todoId, updatedTodo)

    return {
      statusCode: 200,
      headers:  {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: ''
    }
  } catch (error) {
    return {
      statusCode: 400,
      headers:  {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: error
    }
  }
})

handler.use(
  cors({
    credentials: true
  })
)