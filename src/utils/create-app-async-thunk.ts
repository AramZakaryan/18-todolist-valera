import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, AppRootStateType } from "app/store";


export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  rejectValue: null,
  state: AppRootStateType,
  dispatch: AppDispatch
}>();