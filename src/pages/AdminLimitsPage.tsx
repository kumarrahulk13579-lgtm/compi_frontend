import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/context/ToastContext'
import { adminApi } from '@/lib/api'
import type { Limit, LimitScope, LimitUpdate } from '@/lib/types'

const SCOPES: { scope: LimitScope; label: string; help: string }[] = [
  {
    scope: 'user_registered',
    label: 'Per registered user',
    help: 'Daily budget for each signed-up account.',
  },
  { scope: 'user_guest', label: 'Per guest', help: 'Daily budget for each guest session.' },
  {
    scope: 'global_guest',
    label: 'Global guest pool',
    help: 'Shared daily budget across all guests combined.',
  },
  {
    scope: 'global_total',
    label: 'Global total',
    help: 'Shared daily budget across everyone (guests and registered users).',
  },
]

export function AdminLimitsPage() {
  const { toast } = useToast()
  const [limits, setLimits] = useState<Limit[] | null>(null)
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await adminApi.getLimits()
      setLimits(data)
      setDraft(Object.fromEntries(data.map((l) => [l.scope, String(l.amount)])))
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not load limits')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const byScope = useMemo(
    () => Object.fromEntries((limits ?? []).map((l) => [l.scope, l])),
    [limits],
  )

  // Only the fields the admin actually changed (and that parse to a valid number).
  const changes = useMemo(() => {
    const out: LimitUpdate = {}
    for (const { scope } of SCOPES) {
      const current = byScope[scope]?.amount
      const next = Number(draft[scope])
      if (draft[scope] != null && draft[scope] !== '' && !Number.isNaN(next) && next !== current) {
        out[scope] = next
      }
    }
    return out
  }, [draft, byScope])

  const dirty = Object.keys(changes).length > 0

  const save = async () => {
    if (!dirty) return
    setSaving(true)
    try {
      const updated = await adminApi.updateLimits(changes)
      setLimits(updated)
      setDraft(Object.fromEntries(updated.map((l) => [l.scope, String(l.amount)])))
      toast('Limits updated')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not update limits')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/"
          aria-label="Back to chat"
          className="inline-flex size-10 items-center justify-center rounded-xl transition-colors hover:bg-[var(--accent)]"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Usage limits</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Daily spend caps enforced by the backend (USD).
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-[var(--muted-foreground)]">
          <Loader2 className="size-5 animate-spin" />
          Loading limits…
        </div>
      ) : limits == null ? (
        <div className="py-16 text-center">
          <p className="mb-3 text-sm text-[var(--muted-foreground)]">Couldn’t load limits.</p>
          <Button variant="outline" onClick={load}>
            Retry
          </Button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
          className="space-y-3"
        >
          {SCOPES.map(({ scope, label, help }) => {
            const limit = byScope[scope]
            return (
              <div
                key={scope}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium">{label}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{help}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[var(--muted-foreground)]">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      inputMode="decimal"
                      value={draft[scope] ?? ''}
                      onChange={(e) => setDraft((d) => ({ ...d, [scope]: e.target.value }))}
                      className="w-28"
                      aria-label={label}
                    />
                  </div>
                </div>
                {limit && (
                  <p className="mt-2 text-right text-[11px] text-[var(--muted-foreground)]">
                    Updated {new Date(limit.updated_at).toLocaleString()}
                  </p>
                )}
              </div>
            )
          })}

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={!dirty || saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save changes
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
