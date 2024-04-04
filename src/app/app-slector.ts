import { useSelector } from "react-redux"
import { AppRootStateType } from "app/store"
import { RequestStatusType } from "app/app-reducer"
import { createSelector } from "@reduxjs/toolkit"

export const selectStatus = (state: AppRootStateType) => state.app.status
export const selectIsInitialized = (state: AppRootStateType) => state.app.isInitialized
export const selectIsLoggedIn = (state: AppRootStateType) => state.auth.isLoggedIn
