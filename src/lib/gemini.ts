import { GoogleGenerativeAI } from '@google/generative-ai'
import { google } from '@ai-sdk/google'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)

export const geminiClient = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash-latest' 
})

export const embeddingModel = genAI.getGenerativeModel({ 
  model: 'text-embedding-004' 
})

export async function generateWithTimeout(
  prompt: string,
  timeoutMs: number = 30000
) {
  return Promise.race([
    geminiClient.generateContent(prompt),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI timeout')), timeoutMs)
    )
  ])
}
