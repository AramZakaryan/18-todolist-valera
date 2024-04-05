import { ResponseType } from "api/todolists-api"
import { Dispatch } from "redux"
import { appActions } from "app/app.reducer"
import { AppDispatch } from "app/store"
import axios from "axios"

export const handleServerAppError = <D>(data: ResponseType<D>, dispatch: Dispatch) => {
  if (data.messages.length) {
    dispatch(appActions.setAppError({ error: data.messages[0] }))
  } else {
    dispatch(appActions.setAppError({ error: "Some error occurred" }))
  }
  dispatch(appActions.setAppStatus({ status: "failed" }))
}

export const handleServerNetworkError = (error: unknown, dispatch: AppDispatch) => {
  let errorMessage = "Some error occurred"
  if (axios.isAxiosError(error)) {
    // checking weather the error is AxiosError
    errorMessage = error.response?.data.message || error?.message || errorMessage
  } else if (error instanceof Error) {
    // checking weather the error is native error
    errorMessage = `Native Error: ${error.message}`
  } else {
    // other unclear case
    errorMessage = JSON.stringify(error)
  }
  dispatch(appActions.setAppError({ error: errorMessage }))
  dispatch(appActions.setAppStatus({ status: "failed" }))
}
// export const handleServerNetworkError = (error: { message: string }, dispatch: Dispatch) => {
//   dispatch(appActions.setAppError({ error: error.message ? error.message : "Some error occurred" }))
//   dispatch(appActions.setAppStatus({ status: "failed" }))
// }
