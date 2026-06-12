'use client'

import { useSignUp } from '@clerk/nextjs/legacy'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'

function RegisterForm() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const searchParams = useSearchParams()
  const router = useRouter()

  const ticket = searchParams.get('__clerk_ticket')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState<string | undefined>('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoaded || !ticket || !signUp) return
    // Pre-fill email from ticket
    signUp.create({ strategy: 'ticket', ticket }).then((res) => {
      setEmail(res.emailAddress ?? undefined)
    }).catch(() => {})
  }, [isLoaded, ticket, signUp])

  if (!ticket) {
    return (
      <div className="text-center space-y-3">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
          </svg>
        </div>
        <h2 className="font-semibold text-gray-900">Geen uitnodiging gevonden</h2>
        <p className="text-sm text-gray-500 max-w-xs">
          Je hebt een persoonlijke uitnodigingslink nodig om een account aan te maken. Vraag een Vicar beheerder om toegang.
        </p>
        <Link href="/login" className="inline-block text-sm text-[#2563EB] hover:underline mt-2">
          Al een account? Inloggen
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isLoaded || !signUp) return
    setLoading(true)
    setError('')

    try {
      const result = await signUp.create({
        strategy: 'ticket',
        ticket,
        firstName,
        lastName,
        password,
        unsafeMetadata: { company },
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push('/dashboard')
      } else {
        setError('Er ging iets mis. Probeer opnieuw.')
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] }
      setError(clerkErr.errors?.[0]?.message ?? 'Er ging iets mis.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Voornaam</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Jan"
            required
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Achternaam</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Janssen"
            required
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Bedrijf</label>
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Bedrijfsnaam"
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">E-mailadres</label>
        <input
          value={email}
          readOnly
          className="w-full px-3 py-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5">Wachtwoord</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimaal 8 tekens"
          required
          minLength={8}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading || !firstName || !lastName || !password}
        className="w-full bg-[#2563EB] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2"
      >
        {loading ? 'Account aanmaken...' : 'Account aanmaken'}
      </button>

      <p className="text-center text-xs text-gray-400">
        Al een account?{' '}
        <Link href="/login" className="text-[#2563EB] hover:underline">
          Inloggen
        </Link>
      </p>
    </form>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Account aanmaken</h1>
          <p className="text-gray-500 text-sm mt-1">Vul je gegevens in om verder te gaan</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <Suspense fallback={<div className="text-center text-gray-400 text-sm">Laden...</div>}>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
