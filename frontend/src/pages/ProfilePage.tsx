import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { CalendarDays, Camera, Check, Eye, EyeOff, KeyRound, Mail, Trash2, Upload, UserRound } from 'lucide-react'
import { userService } from '@/services/userService'
import { useAuthStore } from '@/store/authStore'

const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const apiErrorMessage = (error: unknown, fallback: string) => {
  const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail
  return typeof detail === 'string' ? detail : fallback
}

const maskEmail = (email: string) => {
  const [localPart, domain] = email.split('@')
  if (!domain) return email
  return `${localPart.slice(0, 1)}••••@${domain}`
}

const ProfilePage = () => {
  const { user, setUser } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarError, setAvatarError] = useState('')
  const [avatarMessage, setAvatarMessage] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [resendIn, setResendIn] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')

  const uploadAvatar = useMutation({
    mutationFn: userService.uploadAvatar,
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      setAvatarMessage('Your profile photo has been updated.')
      setAvatarError('')
    },
    onError: (error) => setAvatarError(apiErrorMessage(error, 'We couldn’t upload that photo. Please try again.')),
  })

  const removeAvatar = useMutation({
    mutationFn: userService.removeAvatar,
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      setAvatarMessage('Your profile photo has been removed.')
      setAvatarError('')
    },
    onError: (error) => setAvatarError(apiErrorMessage(error, 'We couldn’t remove your photo. Please try again.')),
  })

  const requestCode = useMutation({
    mutationFn: userService.requestPasswordChangeCode,
    onSuccess: () => {
      setCodeSent(true)
      setResendIn(60)
      setOtp('')
      setPasswordError('')
      setPasswordMessage('A 6-digit code is on its way to your email.')
    },
    onError: (error) => setPasswordError(apiErrorMessage(error, 'We couldn’t send a code. Please try again.')),
  })

  const changePassword = useMutation({
    mutationFn: userService.changePassword,
    onSuccess: () => {
      setOtp('')
      setNewPassword('')
      setConfirmPassword('')
      setCodeSent(false)
      setResendIn(0)
      setPasswordError('')
      setPasswordMessage('Your password has been changed successfully.')
    },
    onError: (error) => setPasswordError(apiErrorMessage(error, 'We couldn’t change your password. Check the code and try again.')),
  })

  useEffect(() => {
    if (resendIn <= 0) return
    const timeout = window.setTimeout(() => setResendIn((seconds) => seconds - 1), 1000)
    return () => window.clearTimeout(timeout)
  }, [resendIn])

  if (!user) return null

  const memberSince = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })

  const selectAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return
    setAvatarError('')
    setAvatarMessage('')
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError('Choose a JPEG, PNG, or WebP image.')
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError('Profile photos must be 2 MB or smaller.')
      return
    }
    uploadAvatar.mutate(file)
  }

  const submitPasswordChange = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordError('')
    setPasswordMessage('')
    if (!/^\d{6}$/.test(otp)) {
      setPasswordError('Enter the 6-digit code from your email.')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('Your new password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('The passwords do not match.')
      return
    }
    changePassword.mutate({ code: otp, password: newPassword, confirm_password: confirmPassword })
  }

  return (
    <main className="min-h-[65vh] bg-background text-foreground">
      <div className="container-custom max-w-4xl py-10 sm:py-14">
        <header className="mb-8 border-b border-border/[0.08] pb-7">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted"><span className="h-2 w-2 rounded-sm bg-primary-500" /> Your Watchloom</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground-strong sm:text-4xl">Profile</h1>
          <p className="mt-2 text-sm text-muted sm:text-base">Your account details and Watchloom preferences.</p>
        </header>

        <section className="overflow-hidden rounded-2xl border border-border/[0.08] bg-surface">
          <div className="flex flex-col gap-5 border-b border-border/[0.08] p-5 sm:flex-row sm:items-center sm:p-7">
            <div className="relative h-20 w-20 shrink-0">
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-primary-500/30 bg-primary-500/10 text-accent-foreground">
                {user.avatar ? <img src={user.avatar} alt={`${user.display_name}'s profile`} className="h-full w-full object-cover" /> : <UserRound className="h-8 w-8" />}
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-primary-500 text-[#17191f]">
                {uploadAvatar.isPending ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" /> : <Camera className="h-4 w-4" />}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-display text-xl font-semibold text-foreground-strong">{user.display_name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">@{user.username}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={selectAvatar} className="sr-only" aria-label="Choose profile photo" />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadAvatar.isPending || removeAvatar.isPending} className="inline-flex h-9 items-center gap-2 rounded-full bg-primary-500 px-3.5 text-xs font-semibold text-[#17191f] transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60">
                  <Upload className="h-3.5 w-3.5" /> {uploadAvatar.isPending ? 'Uploading…' : user.avatar ? 'Change photo' : 'Upload photo'}
                </button>
                {user.avatar && <button type="button" onClick={() => removeAvatar.mutate()} disabled={uploadAvatar.isPending || removeAvatar.isPending} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border/15 px-3 text-xs font-medium text-muted transition hover:border-rose-500/30 hover:text-rose-500 disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" /> Remove</button>}
                <span className="text-[11px] text-muted-foreground">JPEG, PNG or WebP · up to 2 MB</span>
              </div>
              {avatarError && <p role="alert" className="mt-2 text-xs text-rose-500">{avatarError}</p>}
              {avatarMessage && <p role="status" className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600"><Check className="h-3.5 w-3.5" />{avatarMessage}</p>}
            </div>
            <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-medium ${user.email_verified ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : 'border-[#ffd93d]/20 bg-[#ffd93d]/10 text-brand-muted'}`}>
              {user.email_verified ? 'Email verified' : 'Email not verified'}
            </span>
          </div>

          <dl className="grid gap-0 sm:grid-cols-2">
            <div className="border-b border-border/[0.07] p-5 sm:border-r sm:p-6">
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><Mail className="h-4 w-4 text-accent-foreground" /> Email address</dt>
              <dd className="mt-2 break-all text-sm font-medium text-foreground">{user.email}</dd>
            </div>
            <div className="border-b border-border/[0.07] p-5 sm:p-6">
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><CalendarDays className="h-4 w-4 text-accent-foreground" /> Member since</dt>
              <dd className="mt-2 text-sm font-medium text-foreground">{memberSince}</dd>
            </div>
            <div className="p-5 sm:border-r sm:p-6">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preferred view</dt>
              <dd className="mt-2 text-sm font-medium capitalize text-foreground">{user.preferences.default_view}</dd>
            </div>
            <div className="p-5 sm:p-6">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Favorite genres</dt>
              <dd className="mt-2 text-sm font-medium text-foreground">{user.preferences.favorite_genres.length ? user.preferences.favorite_genres.join(', ') : 'Not set'}</dd>
            </div>
          </dl>
        </section>

        <section className="mt-5 rounded-2xl border border-border/[0.08] bg-surface p-5 sm:p-7" aria-labelledby="password-title">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-brand-muted"><KeyRound className="h-5 w-5" /></span>
            <div>
              <h2 id="password-title" className="font-display text-lg font-semibold text-foreground-strong">Password &amp; sign-in</h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-muted">We’ll verify it’s you with a one-time code sent to {maskEmail(user.email)} before changing your password.</p>
            </div>
          </div>

          {!codeSent ? (
            <div className="mt-5 flex flex-col gap-3 border-t border-border/[0.08] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">The code expires after 10 minutes and can only be used once.</p>
              <button type="button" onClick={() => { setPasswordError(''); setPasswordMessage(''); requestCode.mutate() }} disabled={requestCode.isPending || resendIn > 0} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary-500 px-4 text-sm font-semibold text-[#17191f] transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60">
                <Mail className="h-4 w-4" /> {requestCode.isPending ? 'Sending code…' : resendIn > 0 ? `Send again in ${resendIn}s` : 'Send email code'}
              </button>
            </div>
          ) : (
            <form onSubmit={submitPasswordChange} className="mt-5 space-y-4 border-t border-border/[0.08] pt-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground-strong">Enter your code and choose a new password</p>
                <button type="button" onClick={() => requestCode.mutate()} disabled={requestCode.isPending || resendIn > 0} className="text-xs font-medium text-brand-muted transition hover:text-foreground-strong disabled:cursor-wait disabled:opacity-50">
                  {requestCode.isPending ? 'Sending…' : resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-foreground-strong sm:col-span-2">Email verification code
                  <input value={otp} onChange={(event) => { setOtp(event.target.value.replace(/\D/g, '').slice(0, 6)); setPasswordError('') }} type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="6-digit code" className="mt-2 block h-11 w-full rounded-xl border border-border/15 bg-background px-3.5 text-sm font-normal tracking-[0.2em] text-foreground placeholder:tracking-normal placeholder:text-muted-foreground focus:border-primary-500/60 focus:outline-none focus:ring-4 focus:ring-primary-500/10 sm:max-w-xs" />
                </label>
                <label className="text-sm font-medium text-foreground-strong">New password
                  <span className="relative mt-2 block">
                    <input value={newPassword} onChange={(event) => { setNewPassword(event.target.value); setPasswordError('') }} type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} maxLength={100} placeholder="At least 8 characters" className="h-11 w-full rounded-xl border border-border/15 bg-background px-3.5 pr-11 text-sm font-normal text-foreground placeholder:text-muted-foreground focus:border-primary-500/60 focus:outline-none focus:ring-4 focus:ring-primary-500/10" />
                    <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground-strong">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                  </span>
                </label>
                <label className="text-sm font-medium text-foreground-strong">Confirm new password
                  <input value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setPasswordError('') }} type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} maxLength={100} placeholder="Enter it again" className="mt-2 block h-11 w-full rounded-xl border border-border/15 bg-background px-3.5 text-sm font-normal text-foreground placeholder:text-muted-foreground focus:border-primary-500/60 focus:outline-none focus:ring-4 focus:ring-primary-500/10" />
                </label>
              </div>

              {passwordError && <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-3.5 py-3 text-sm text-rose-500">{passwordError}</p>}
              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" disabled={changePassword.isPending || otp.length !== 6 || newPassword.length < 8 || confirmPassword.length < 8} className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary-500 px-4 text-sm font-semibold text-[#17191f] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50">
                  {changePassword.isPending ? 'Updating password…' : 'Change password'}
                </button>
                <button type="button" onClick={() => { setCodeSent(false); setOtp(''); setNewPassword(''); setConfirmPassword(''); setPasswordError('') }} className="inline-flex h-10 items-center rounded-full px-3 text-sm font-medium text-muted transition hover:text-foreground-strong">Cancel</button>
              </div>
            </form>
          )}

          {passwordError && !codeSent && <p role="alert" className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-3.5 py-3 text-sm text-rose-500">{passwordError}</p>}
          {passwordMessage && <p role="status" className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-3.5 py-3 text-sm text-emerald-600"><Check className="h-4 w-4 shrink-0" />{passwordMessage}</p>}
        </section>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/settings" className="rounded-full border border-border/15 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-hover/[0.05]">Settings</Link>
          <Link to="/library" className="rounded-full px-4 py-2.5 text-sm font-semibold" style={{ backgroundColor: '#FFD93D', color: '#11141b' }}>Open library</Link>
        </div>
      </div>
    </main>
  )
}

export default ProfilePage
