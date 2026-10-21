import { configureStore } from '@reduxjs/toolkit'
import authReducer, { clearUser } from '../features/auth/authSlice'
import { setUnauthorizedHandler } from '../api/axios'

export const store = configureStore({ reducer: { auth: authReducer } })

setUnauthorizedHandler(() => {
  store.dispatch(clearUser())
})
