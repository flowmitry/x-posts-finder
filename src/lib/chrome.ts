import { INITIAL_PROCESSING_STATE, PROCESSING_STORAGE_KEY, SETTINGS_STORAGE_KEY } from './constants'
import type { ProcessingState, Settings } from '../types'

const hasChromeRuntime = typeof chrome !== 'undefined' && !!chrome.runtime

export function isChromeEnvironment(): boolean {
  return hasChromeRuntime
}

export async function getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
  if (!hasChromeRuntime || !chrome.tabs) {
    return undefined
  }

  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error('Failed to query active tab:', chrome.runtime.lastError.message)
        resolve(undefined)
        return
      }

      resolve(tabs[0])
    })
  })
}

export async function sendMessageToTab<T>(tabId: number, message: unknown): Promise<T | undefined> {
  if (!hasChromeRuntime || !chrome.tabs) {
    return undefined
  }

  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
        return
      }

      resolve(response as T)
    })
  })
}

export async function sendRuntimeMessage<T>(message: unknown): Promise<T | undefined> {
  if (!hasChromeRuntime) {
    return undefined
  }

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
        return
      }

      resolve(response as T)
    })
  })
}

export async function getLocalStorageValue<T>(key: string): Promise<T | undefined> {
  if (!hasChromeRuntime || !chrome.storage?.local) {
    return undefined
  }

  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
        return
      }

      resolve(result[key] as T | undefined)
    })
  })
}

export async function setLocalStorageValue<T>(key: string, value: T): Promise<void> {
  if (!hasChromeRuntime || !chrome.storage?.local) {
    return
  }

  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
        return
      }

      resolve()
    })
  })
}

export type RuntimeMessageListener = Parameters<typeof chrome.runtime.onMessage.addListener>[0]
export type StorageChangeListener = Parameters<typeof chrome.storage.onChanged.addListener>[0]

export function addRuntimeMessageListener(listener: RuntimeMessageListener): () => void {
  if (!hasChromeRuntime) {
    return () => {}
  }

  chrome.runtime.onMessage.addListener(listener)
  return () => chrome.runtime.onMessage.removeListener(listener)
}

export function addStorageListener(listener: StorageChangeListener): () => void {
  if (!hasChromeRuntime) {
    return () => {}
  }

  chrome.storage.onChanged.addListener(listener)
  return () => chrome.storage.onChanged.removeListener(listener)
}

export async function persistProcessingState(state: ProcessingState): Promise<void> {
  await setLocalStorageValue(PROCESSING_STORAGE_KEY, state)
}

export async function persistDefaultProcessingState(): Promise<void> {
  await setLocalStorageValue(PROCESSING_STORAGE_KEY, INITIAL_PROCESSING_STATE)
}

export async function persistSettings(settings: Settings): Promise<void> {
  await setLocalStorageValue(SETTINGS_STORAGE_KEY, settings)
}
