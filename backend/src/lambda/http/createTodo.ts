import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../businessLogic/todos'


const logger = createLogger('createTodo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {  console.log('Caller event', event)
  logger.info('Processing event: ', event)

  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event)

  const newItem = await createTodo(newTodo, userId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: newItem
    })
  } 
})

handler.use(
  cors({
    credentials: true
  })
)
