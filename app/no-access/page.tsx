import { UserButton } from '@clerk/nextjs'

export default function NoAccessPage() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
      <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-sm border border-gray-100">
        <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <span className="text-2xl">🔒</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Geen toegang</h1>
        <p className="text-gray-500 text-sm mb-6">
          Je hebt geen toegang tot dit gedeelte. Neem contact op met het Vicar team als je denkt dat dit fout is.
        </p>
        <div className="flex justify-center">
          <UserButton />
        </div>
      </div>
    </div>
  )
}
