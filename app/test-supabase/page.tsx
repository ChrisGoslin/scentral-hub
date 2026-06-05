import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <div className="p-10 bg-[var(--bg)] min-h-screen text-[var(--text)]">
      <h1 className="text-2xl font-serif italic mb-6">Supabase Connectivity Test</h1>
      <ul className="space-y-2">
        {todos?.map((todo) => (
          <li key={todo.id} className="border-b border-[var(--line)] pb-1">
            {todo.name}
          </li>
        ))}
        {(!todos || todos.length === 0) && (
          <li className="text-[var(--text-muted)] italic">No todos found or table does not exist yet.</li>
        )}
      </ul>
      <div className="mt-10">
        <a href="/" className="text-[10px] font-bold uppercase tracking-widest hover:text-[var(--accent)] transition">
          ← Return to Atelier
        </a>
      </div>
    </div>
  )
}
