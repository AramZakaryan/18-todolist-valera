import { AppRootStateType } from "app/store"
import { useSelector } from "react-redux"
import { TasksStateType } from "features/TodolistsList/tasks-reducer"

export const selectTodolists = (state: AppRootStateType) => state.todolists
export const selectTasks = (state: AppRootStateType) => state.tasks
