import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement forgot password API call
    setSubmitted(true)
  }

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
<h1 className="font-display text-3xl font-semibold tracking-tight mb-2">Reset your password</h1>
        <p className="text-muted">
          Enter your email to receive reset instructions
        </p>
      </div>

      <div className="rounded-2xl border border-border/10 bg-surface p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)] sm:p-8">
        {submitted ? (
          <div className="text-center space-y-4">
            <p className="text-muted">
              If an account exists with that email, you will receive password reset instructions.
            </p>
            <Link to="/signin">
              <Button>Back to Sign In</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Send Reset Link
            </Button>
          </form>
        )}

        <div className="mt-6 text-center text-sm">
          <Link
            to="/signin"
            className="text-muted hover:text-brand-muted"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage




