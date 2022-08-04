import dotenv from 'dotenv'

dotenv.config()

type EnvironmentConfig = {
  truskApiBaseUrl: string
  truskBusinessBaseUrl: string
}

const environment: EnvironmentConfig = {
  truskApiBaseUrl: process.env.TRUSK_API_BASE_URL as string || 'https://staging-02-api.trusk.com',
  truskBusinessBaseUrl: process.env.TRUSK_BUSINESS_BASE_URL as string || 'https://staging-02-pro.trusk.com',
}

export default environment
