import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { SubmitButton } from '@/components/submit-button'
import { z } from 'zod'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  email: z.string().email(),
})

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ message: string; errorMessage: string }>
}) {
  const params = await searchParams
  const login = async (formData: FormData) => {
    'use server'

    const formSafeParsed = formSchema.safeParse({
      email: formData.get('email') as string,
    })
    if (!formSafeParsed.success) {
      return redirect('/login?errorMessage=Invalid email')
    }

    const defaultUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : `http://localhost:${process.env.PORT || 3000}`

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithOtp({
      email: formSafeParsed.data.email,
      options: {
        emailRedirectTo: `${defaultUrl}/api/auth/callback`,
      },
    })

    if (error) {
      return redirect('/login?errorMessage=Could not authenticate user')
    }

    return redirect('/login?message=Check email to continue sign in process')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3 pointer-events-none" />

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M3 5V19A9 3 0 0 0 21 19V5" />
              <path d="M3 12A9 3 0 0 0 21 12" />
            </svg>
          </div>
          <span className="text-base font-semibold tracking-tight">QueryBase</span>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm p-8 gradient-border">
          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold mb-1.5">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in with your email to continue
            </p>
          </div>

          <form className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="h-10 bg-background/60 border-border/60 focus:border-primary/40 text-sm"
              />
            </div>

            <SubmitButton
              formAction={login}
              pendingText="Signing in..."
              className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-sm transition-all hover:shadow-lg hover:shadow-primary/20"
            >
              Continue with Email
            </SubmitButton>

            {(params?.message || params?.errorMessage) && (
              <div
                className={`mt-3 p-3 rounded-lg text-center text-sm ${
                  params.errorMessage
                    ? 'bg-destructive/10 text-destructive border border-destructive/20'
                    : 'bg-primary/10 text-primary border border-primary/20'
                }`}
              >
                {params.message || params.errorMessage}
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-[11px] text-muted-foreground/40 mt-6">
          We'll send you a magic link to sign in
        </p>
      </div>
    </div>
  )
}
