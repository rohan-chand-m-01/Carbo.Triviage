export interface GeminiResponse {
  text: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export function mockGenerateContent(prompt: string): Promise<GeminiResponse> {
  const responses = [
    "Based on current carbon intensity data, your supply chain emissions are approximately 2,450 tCO2e this quarter.",
    "The latest EU ETS price is currently trending upward, which may impact your CBAM liability calculations.",
    "Your Scope 3 emissions represent 68% of total carbon footprint, with transportation being the largest category.",
    "Recent policy changes in EU carbon regulations may require additional reporting for your sector."
  ]
  
  return Promise.resolve({
    text: responses[Math.floor(Math.random() * responses.length)],
    usage: {
      promptTokens: 150,
      completionTokens: 80,
      totalTokens: 230
    }
  })
}

export function mockEmbedContent(text: string): Promise<number[]> {
  // Return 768-dimensional mock embedding (same as text-embedding-004)
  const embedding = Array.from({ length: 768 }, () => Math.random() - 0.5)
  return Promise.resolve(embedding)
}
