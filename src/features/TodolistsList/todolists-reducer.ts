import { todolistsAPI, TodolistType } from "api/todolists-api"
import { appActions, RequestStatusType } from "app/app-reducer"
import { handleServerNetworkError } from "utils/error-utils"
import { AppThunk } from "app/store"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"

const slice = createSlice({
  name: "todolists",
  initialState: [] as TodolistDomainType[],
  reducers: {
    removeTodolist(state, action: PayloadAction<{ id: string }>) {
      const todolistInd = state.findIndex((tl) => tl.id === action.payload.id)
      if (todolistInd !== -1) state.splice(todolistInd, 1)
    },
    addTodolist(state, action: PayloadAction<{ todolist: TodolistType }>) {
      const todolist: TodolistDomainType = {
        ...action.payload.todolist,
        filter: "all",
        entityStatus: "idle",
      }
      state.unshift(todolist)
    },
    changeTodolistTitle(state, action: PayloadAction<{ id: string; title: string }>) {
      const todolistInd = state.findIndex((tl) => tl.id === action.payload.id)
      if (todolistInd !== -1) state[todolistInd].title = action.payload.title
    },
    changeTodolistFilter(state, action: PayloadAction<{ id: string; filter: FilterValuesType }>) {
      const todolistInd = state.findIndex((tl) => tl.id === action.payload.id)
      if (todolistInd !== -1) state[todolistInd].filter = action.payload.filter
    },
    changeTodolistEntityStatus(
      state,
      action: PayloadAction<{ id: string; entityStatus: RequestStatusType }>,
    ) {
      const todolistInd = state.findIndex((tl) => tl.id === action.payload.id)
      if (todolistInd !== -1) state[todolistInd].entityStatus = action.payload.entityStatus
    },
    setTodolists(state, action: PayloadAction<{ todolists: Array<TodolistType> }>) {
      action.payload.todolists.forEach((tl) =>
        state.push({
          ...tl,
          filter: "all",
          entityStatus: "idle",
        } as TodolistDomainType),
      )
    },
    clearState(state) {
      return []
    },
  },
})

export const todolistsReducer = slice.reducer

export const todolistsActions = slice.actions

// thunks
export const fetchTodolistsTC = (): AppThunk => {
  return (dispatch) => {
    dispatch(appActions.setAppStatus({ status: "loading" }))
    todolistsAPI
      .getTodolists()
      .then((res) => {
        dispatch(todolistsActions.setTodolists({ todolists: res.data }))
        dispatch(appActions.setAppStatus({ status: "succeeded" }))
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch)
      })
  }
}
export const removeTodolistTC = (id: string): AppThunk => {
  return (dispatch) => {
    //изменим глобальный статус приложения, чтобы вверху полоса побежала
    dispatch(appActions.setAppStatus({ status: "loading" }))
    //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
    dispatch(todolistsActions.changeTodolistEntityStatus({ id, entityStatus: "loading" }))
    todolistsAPI.deleteTodolist(id).then((res) => {
      dispatch(todolistsActions.removeTodolist({ id }))
      //скажем глобально приложению, что асинхронная операция завершена
      dispatch(appActions.setAppStatus({ status: "succeeded" }))
    })
  }
}
export const addTodolistTC = (title: string): AppThunk => {
  return (dispatch) => {
    dispatch(appActions.setAppStatus({ status: "loading" }))
    todolistsAPI.createTodolist(title).then((res) => {
      dispatch(todolistsActions.addTodolist({ todolist: res.data.data.item }))
      dispatch(appActions.setAppStatus({ status: "succeeded" }))
    })
  }
}
export const changeTodolistTitleTC = (id: string, title: string): AppThunk => {
  return (dispatch) => {
    todolistsAPI.updateTodolist(id, title).then((res) => {
      dispatch(todolistsActions.changeTodolistTitle({ id, title }))
    })
  }
}

// types
export type AddTodolistActionType = ReturnType<typeof todolistsActions.addTodolist>
export type RemoveTodolistActionType = ReturnType<typeof todolistsActions.removeTodolist>
export type SetTodolistsActionType = ReturnType<typeof todolistsActions.setTodolists>
export type FilterValuesType = "all" | "active" | "completed"
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType
  entityStatus: RequestStatusType
}
