/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_WS_BASE_URL: string
  readonly VITE_DEV_MODE: string
  readonly VITE_ENABLE_LOGGING: string
  readonly VITE_TOKEN_STORAGE_KEY: string
  readonly VITE_REFRESH_TOKEN_STORAGE_KEY: string
  readonly VITE_DEFAULT_USERNAME: string
  readonly VITE_DEFAULT_PASSWORD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 