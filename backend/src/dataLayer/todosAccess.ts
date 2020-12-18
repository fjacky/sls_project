import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)
const bucketName = process.env.ATTACHMENT_S3_BUCKET

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosUserIdIndex = process.env.TODOS_USER_ID_INDEX,
    private readonly s3: AWS.S3 = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly attachmentS3Bucket: string = process.env.ATTACHMENT_S3_BUCKET,
    private readonly urlExpiration: number = parseInt(process.env.SIGNED_URL_EXPIRATION)
    ) {
  }

  async createTodo(item: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
        TableName: this.todosTable,
        Item: {
            ...item
        }
    }).promise()

    return await item
  }

  async getTodos(userId: string): Promise<TodoItem[]> {
    const todos = await this.docClient.query({
        TableName: this.todosTable,
        IndexName: this.todosUserIdIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        },
    }).promise()

    return await todos.Items as TodoItem[]
  }

  async updateTodo(userId: string, todoId: string, updatedTodo: TodoUpdate): Promise<void> {
    await this.docClient.update({
        TableName: this.todosTable,
        Key: {userId, todoId},
        UpdateExpression: "set #n = :n, dueDate=:dueDate, done=:done",
        ExpressionAttributeValues: {
        ":n": updatedTodo.name,
        ":dueDate": updatedTodo.dueDate,
        ":done": updatedTodo.done
        },
        ExpressionAttributeNames: {
            '#n': 'name'
          },
        ReturnValues: "NONE"
    }).promise()
  }

  async addAttachment(userId: string, todoId: string, imageId: string): Promise<void> {
    await this.docClient.update({
        TableName: this.todosTable,
        Key: {userId, todoId},
        UpdateExpression: "set attachmentUrl = :attachmentUrl",
        ExpressionAttributeValues: {
        ":attachmentUrl": `https://${bucketName}.s3.amazonaws.com/${imageId}`
        },
        ReturnValues: "NONE"
    }).promise()
  }

  async getTodo(userId: string, todoId: string): Promise<TodoItem> {
    const result = await this.docClient
        .get({
            TableName: this.todosTable,
            Key: {userId, todoId}
        })
        .promise()
    return await result.Item as TodoItem
  }

  async deleteTodo(userId: string, todoId: string): Promise<void> {
    await this.s3.deleteObject({
        Bucket: this.attachmentS3Bucket,
        Key: todoId
    }).promise()
    await this.docClient.delete({
        TableName: this.todosTable,
        Key: { userId, todoId }
      }).promise()
  }

  async getUploadUrl(imageId: String) {
    return this.s3.getSignedUrl('putObject', {
        Bucket: this.attachmentS3Bucket,
        Key: imageId,
        Expires: this.urlExpiration})
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
