import { tasksReducer } from "features/TodolistsList/tasks-reducer"
import { todolistsReducer } from "features/TodolistsList/todolists-reducer"
import { combineReducers } from "redux"
import {
  ThunkAction,
  ThunkDispatch,
  thunk as thunkMiddleware,
} from "redux-thunk"
import { appReducer } from "./app-reducer"
import { authReducer } from "features/Login/auth-reducer"
import { configureStore, UnknownAction } from "@reduxjs/toolkit"

const rootReducer = combineReducers({
  tasks: tasksReducer,
  todolists: todolistsReducer,
  app: appReducer,
  auth: authReducer,
})

export const store = configureStore({ reducer: rootReducer })

export type AppRootStateType = ReturnType<typeof rootReducer>

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppRootStateType,
  unknown,
  UnknownAction
>

export type AppDispatch = ThunkDispatch<
  AppRootStateType,
  unknown,
  UnknownAction
>
