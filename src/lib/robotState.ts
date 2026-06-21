export type RobotState = 'idle' | 'thinking' | 'search' | 'calculator' | 'time' | 'talking'

/**
 * Map the chat's current status text (from the backend SSE `status` events)
 * and streaming flag onto a robot animation state.
 *
 * Status examples: "Thinking...", "Using search_web...", "Using calculator...",
 * "Using get_current_time...", "Planning your request...", "Step 1 of 3: ...".
 */
export function deriveRobotState(status: string | null, streaming: boolean): RobotState {
  if (status) {
    const s = status.toLowerCase()
    if (s.includes('search') || s.includes('web') || s.includes('look')) return 'search'
    if (s.includes('calc') || s.includes('math')) return 'calculator'
    if (s.includes('time') || s.includes('clock') || s.includes('date')) return 'time'
    // "Thinking", "Planning", "Synthesizing", "Step N of M", etc.
    return 'thinking'
  }
  if (streaming) return 'talking'
  return 'idle'
}
