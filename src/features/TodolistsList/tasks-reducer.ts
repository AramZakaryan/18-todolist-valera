import { todolistsActions } from "./todolists-reducer"
import { TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType } from "api/todolists-api"
import { AppDispatch, AppRootStateType, AppThunk } from "app/store"
import { appActions } from "app/app-reducer"
import { handleServerAppError, handleServerNetworkError } from "utils/error-utils"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AxiosError } from "axios"

export const slice = createSlice({
  name: "tasks",
  initialState: {} as TasksStateType,
  reducers: {
    removeTask(state, action: PayloadAction<{ taskId: string; todolistId: string }>) {
      const tasks = state[action.payload.todolistId]
      const taskIndex = tasks.findIndex((t) => t.id === action.payload.taskId)
      if (taskIndex !== -1) tasks.splice(taskIndex, 1)
    },
    addTask(state, action: PayloadAction<{ task: TaskType }>) {
      state[action.payload.task.todoListId].unshift(action.payload.task)
    },
    updateTask(
      state,
      action: PayloadAction<{
        taskId: string
        model: UpdateDomainTaskModelType
        todolistId: string
      }>
    ) {
      const tasks = state[action.payload.todolistId]
      const taskIndex = tasks.findIndex((t) => t.id === action.payload.taskId)
      if (taskIndex !== -1)
        tasks[taskIndex] = {
          ...tasks[taskIndex],
          ...action.payload.model
        }
    }
    // setTasks(
    //   state,
    //   action: PayloadAction<{
    //     tasks: Array<TaskType>
    //     todolistId: string
    //   }>
    // ) {
    //   action.payload.tasks.forEach((t) => state[action.payload.todolistId].push(t))
    // }
  },
  extraReducers: (builder) =>
    builder
      .addCase(todolistsActions.addTodolist, (state, action) => {
        state[action.payload.todolist.id] = []
      })
      .addCase(todolistsActions.removeTodolist, (state, action) => {
        delete state[action.payload.id]
      })
      .addCase(todolistsActions.setTodolists, (state, action) => {
        action.payload.todolists.forEach((tl) => {
          state[tl.id] = []
        })
      })
      .addCase(todolistsActions.clearState, (state) => {
        return {}
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {


        action.payload.tasks.forEach((t) => state[action.payload.todolistId].push(t))


      })
})
export const tasksReducer = slice.reducer
export const tasksActions = slice.actions

//////////// Thunks

/** ZA: fetchTasks Thunk Creator
 */
const fetchTasks = createAsyncThunk<
  { tasks: TaskType[], todolistId: string },
  string
>
("tasks/fetchTasks",
  async (todolistId, thunkAPI) => {
    const { dispatch, getState } = thunkAPI
    dispatch(appActions.setAppStatus({ status: "loading" }))
    try {
      const res = await todolistsAPI.getTasks(todolistId)
      const tasks = res.data.items
      dispatch(appActions.setAppStatus({ status: "succeeded" }))
      return { tasks: tasks, todolistId: todolistId }
    } catch (err: any) {
      handleServerNetworkError(err, dispatch)
      return thunkAPI.rejectWithValue(null)
    }


  }
)
// export const fetchTasks =
//   (todolistId: string): AppThunk =>
//     (dispatch) => {
//       dispatch(appActions.setAppStatus({ status: "loading" }))
//       todolistsAPI.getTasks(todolistId).then((res) => {
//         const tasks = res.data.items
//         dispatch(tasksActions.setTasks({ tasks: tasks, todolistId: todolistId }))
//         dispatch(appActions.setAppStatus({ status: "succeeded" }))
//       })
//     }

export const removeTaskTC =
  (taskId: string, todolistId: string): AppThunk =>
    (dispatch) => {
      todolistsAPI.deleteTask(todolistId, taskId).then((res) => {
        const action = tasksActions.removeTask({ taskId: taskId, todolistId: todolistId })
        dispatch(action)
      })
    }
export const addTaskTC =
  (title: string, todolistId: string): AppThunk =>
    (dispatch) => {
      dispatch(appActions.setAppStatus({ status: "loading" }))
      todolistsAPI
        .createTask(todolistId, title)
        .then((res) => {
          if (res.data.resultCode === 0) {
            const task = res.data.data.item
            const action = tasksActions.addTask({ task })
            dispatch(action)
            dispatch(appActions.setAppStatus({ status: "succeeded" }))
          } else {
            handleServerAppError(res.data, dispatch)
          }
        })
        .catch((error) => {
          handleServerNetworkError(error, dispatch)
        })
    }
export const updateTaskTC =
  (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string): AppThunk =>
    (dispatch, getState) => {
      const state = getState()
      const task = state.tasks[todolistId].find((t) => t.id === taskId)
      if (!task) {
        //throw new Error("task not found in the state");
        console.warn("task not found in the state")
        return
      }

      const apiModel: UpdateTaskModelType = {
        deadline: task.deadline,
        description: task.description,
        priority: task.priority,
        startDate: task.startDate,
        title: task.title,
        status: task.status,
        ...domainModel
      }

      todolistsAPI
        .updateTask(todolistId, taskId, apiModel)
        .then((res) => {
          if (res.data.resultCode === 0) {
            const action = tasksActions.updateTask({
              taskId: taskId,
              model: domainModel,
              todolistId: todolistId
            })
            dispatch(action)
          } else {
            handleServerAppError(res.data, dispatch)
          }
        })
        .catch((error) => {
          handleServerNetworkError(error, dispatch)
        })
    }

/** ZA: all tasks thunks
 */
export const tasksThunks = { fetchTasks }


// types
export type UpdateDomainTaskModelType = {
  title?: string
  description?: string
  status?: TaskStatuses
  priority?: TaskPriorities
  startDate?: string
  deadline?: string
}
export type TasksStateType = {
  [key: string]: Array<TaskType>
}
