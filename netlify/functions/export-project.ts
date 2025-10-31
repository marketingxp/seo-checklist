import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const handler: Handler = async (event) => {
  const projectId = event.queryStringParameters?.projectId
  if (!projectId) return { statusCode: 400, body: 'Missing projectId' }

  const url = process.env.SUPABASE_URL!
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(url, service)

  const { data, error } = await supabase.from('items').select('*').eq('project_id', projectId)
  if (error) return { statusCode: 500, body: error.message }

  const header = Object.keys(data?.[0] ?? { id: '', title: '', status: '', due_date: '', tags: '' })
  const lines = [header.join(',')]
  for (const row of data ?? []) {
    lines.push(header.map(k => JSON.stringify((row as any)[k])).join(','))
  }
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="project-${projectId}.csv"`
    },
    body: lines.join('\n')
  }
}

export { handler }
