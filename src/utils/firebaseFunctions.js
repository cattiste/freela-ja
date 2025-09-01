// src/utils/firebaseFunctions.js
import { getFunctions } from 'firebase/functions'
import { getApp } from 'firebase/app'

export const functionsClient = getFunctions(getApp(), "southamerica-east1")
