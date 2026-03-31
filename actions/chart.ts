'use server'

import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: 'https://openrouter.ai/api/v1',
})

import { type Result, configSchema, type Config } from '@/lib/chart'

export const generateChartConfig = async (
  results: Result[],
  userQuery: string
) => {
  try {
    const { text } = await generateText({
      model: openrouter(process.env.OPENROUTER_MODEL || 'openai/gpt-4o'),
      maxTokens: 1024,
      system: 'You are a data visualization expert. You only respond with valid JSON, no markdown fences or explanation.',
      prompt: `Given the following data from a SQL query result, generate a chart config JSON object.

Required fields:
- "type": one of "bar", "line", "area", "pie", "scatter"
- "xKey": string (key for x-axis)
- "yKeys": string[] (keys for y-axis values)
- "legend": boolean
- "description": string (what the chart shows)
- "takeaway": string (main insight)
- "title": string

Optional fields:
- "colors": object mapping yKeys to CSS color strings
- "multipleLines": boolean (line charts only)
- "measurementColumn": string (line charts only)
- "lineCategories": string[] (line charts only)

Example:
{"type":"bar","xKey":"month","yKeys":["count"],"legend":true,"description":"Monthly counts","takeaway":"Steady growth","title":"Monthly Data"}

User Query: ${userQuery}

Data: ${JSON.stringify(results.slice(0, 50), null, 2)}

Respond with ONLY the JSON object, nothing else.`,
    })

    // Extract JSON from response (handle potential markdown fences)
    let jsonStr = text.trim()
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    const parsed = JSON.parse(jsonStr)
    const config = configSchema.parse(parsed)

    const colors: Record<string, string> = {}
    config.yKeys.forEach((key, index) => {
      colors[key] = `hsl(var(--chart-${index + 1}))`
    })

    const updatedConfig: Config = { ...config, colors }
    return { config: updatedConfig }
  } catch (e) {
    // @ts-expect-errore
    console.error(e.message)
    throw new Error('Failed to generate chart suggestion')
  }
}
