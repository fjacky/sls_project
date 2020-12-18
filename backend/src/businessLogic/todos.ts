import * as uuid from 'uuid'
/*  */
import { TodosAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { TodoItem } from '../models/TodoItem'
import { createLogger } from '../utils/logger'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const logger = createLogger('todos')
const todosAccess = new TodosAccess()

export async function createTodo(createTodoRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {
    logger.info("Creating new todo item.")
    const todoId = uuid.v4()

    return await todosAccess.createTodo({
        userId,
        todoId,
        createdAt: new Date().toISOString(),
        ...createTodoRequest
    } as TodoItem)
}

export async function getTodos(userId: string): Promise<TodoItem[]> {
    logger.info("Retrieving todo items for user.")
    return await todosAccess.getTodos(userId)
}

export async function updateTodo(userId: string, todoId: string, updatedTodo: UpdateTodoRequest): Promise<void> {
    logger.info('Updating todo item.')
    return await todosAccess.updateTodo(userId, todoId, updatedTodo)
}

export async function deleteTodo(userId: string, todoId: string): Promise<void> {
    logger.info("Deleting todo item.")
    await todosAccess.deleteTodo(userId, todoId)
}

export async function generateUploadUrl(userId: string, todoId: string): Promise<String> {
    logger.info("Generating upload url and storing it to the todo item.")
    const imageId = uuid.v4()
    await todosAccess.addAttachment(userId, todoId, imageId)
    return await todosAccess.getUploadUrl(imageId)
}
