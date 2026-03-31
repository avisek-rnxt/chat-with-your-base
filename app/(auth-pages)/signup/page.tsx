import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { SubmitButton } from '@/components/submit-button'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import Link from 'next/link'

const formSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
})

export default async function Signup({
  searchParams,
}: {
  searchParams: Promise<{ message: string; errorMessage: string }>
}) {
  const params = await searchParams
  const signup = async (formData: FormData) => {
    'use server'

    const formSafeParsed = formSchema.safeParse({
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    })
    if (!formSafeParsed.success) {
      const errors = formSafeParsed.error.flatten().fieldErrors
      const msg = errors.email
        ? 'Invalid email'
        : errors.password
          ? 'Password must be at least 6 characters'
          : 'Please fill in all fields'
      return redirect(`/signup?errorMessage=${encodeURIComponent(msg)}`)
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email: formSafeParsed.data.email,
      password: formSafeParsed.data.password,
      options: {
        data: {
          first_name: formSafeParsed.data.firstName,
          last_name: formSafeParsed.data.lastName,
        },
      },
    })

    if (error) {
      return redirect(`/signup?errorMessage=${encodeURIComponent(error.message)}`)
    }

    // If email confirmation is required, user.identities will be empty
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return redirect('/signup?errorMessage=An account with this email already exists')
    }

    // If session exists, user is confirmed and logged in
    if (data.session) {
      return redirect('/app')
    }

    // Email confirmation required
    return redirect('/login?message=Check your email to confirm your account')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3 pointer-events-none" />

      <div className="w-full max-w-sm relative">
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M3 5V19A9 3 0 0 0 21 19V5" />
              <path d="M3 12A9 3 0 0 0 21 12" />
            </svg>
          </div>
          <span className="text-base font-semibold tracking-tight">Bamboo Base</span>
        </div>

        <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-8">
          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold mb-1.5">Create an account</h1>
            <p className="text-sm text-muted-foreground">
              Get started with Bamboo Base
            </p>
          </div>

          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-xs font-medium text-muted-foreground">
                  First name
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  required
                  className="h-10 bg-background border-border text-sm"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-xs font-medium text-muted-foreground">
                  Last name
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  required
                  className="h-10 bg-background border-border text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="h-10 bg-background border-border text-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                Password
              </label>
              <PasswordInput
                id="password"
                name="password"
                placeholder="••••••••"
                required
                minLength={6}
                className="h-10 bg-background border-border text-sm pr-10"
              />
              <p className="text-[11px] text-muted-foreground/60">
                Must be at least 6 characters
              </p>
            </div>

            <SubmitButton
              formAction={signup}
              pendingText="Creating account..."
              className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-sm transition-all hover:shadow-lg hover:shadow-primary/20"
            >
              Create Account
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

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
