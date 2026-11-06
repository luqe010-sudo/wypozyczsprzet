'use client'

import { useRef, useState } from 'react'
import { createEquipment } from '../../../../equipment/actions'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, MapPin } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { ListingBasics, ListingRentalFields, rentalPeriods } from '@/components/dashboard/ListingDetailsFields'
import ListingGallery from '@/components/listing/ListingGallery'
import { priceText } from '@/lib/format'
import { trackEvent } from '@/lib/gtag'

const steps = ['Sprzęt i lokalizacja', 'Zdjęcia i warunki', 'Podgląd']

export default function NewEquipmentForm({ companyId, companyName, categories = [], subcategories = [], branches = [] }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const stepTitle = useRef(null)
  const groups = useRef([])

  function showStep(index) {
    setError('')
    setStep(index)
    requestAnimationFrame(() => stepTitle.current?.focus())
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (isLoading || uploading) return
    const invalid = groups.current[step]?.querySelector(':invalid')
    if (invalid) {
      invalid.reportValidity()
      return
    }
    const data = new FormData(event.currentTarget)

    if (step < steps.length - 1) {
      if (step === 1) {
        setPreview({
          name: data.get('name').trim(),
          category: categories.find((item) => item.id === data.get('category_id'))?.db_key,
          city: branches.find((branch) => branch.id === data.get('branch_id'))?.city,
          images: JSON.parse(data.get('gallery') || '[]'),
          description: data.get('description').trim(),
          priceType: data.get('price_type'),
          priceAmount: data.get('price_amount'),
          Czas: rentalPeriods[data.get('rental_period')],
        })
      }
      showStep(step + 1)
      return
    }

    setError('')
    setIsLoading(true)
    try {
      const result = await createEquipment(companyId, data)
      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }
      trackEvent('listing_created', { pending_moderation: result.pending })
      toast.success(result.pending ? 'Ogłoszenie zapisane i przekazane do moderacji.' : 'Ogłoszenie zostało dodane.')
      router.replace(`/dashboard/company/${companyId}`)
    } catch {
      setError('Nie udało się dodać ogłoszenia. Spróbuj ponownie.')
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/dashboard/company/${companyId}`} className="mb-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
        <ArrowLeft size={17} aria-hidden="true" /> Wróć do firmy
      </Link>

      <div className="listing-panel">
        <h1 className="market-heading">Dodaj ogłoszenie</h1>
        <p className="mt-1 text-sm text-muted">{companyName}</p>
        <ol aria-label="Postęp dodawania ogłoszenia" className="my-5 grid grid-cols-3 gap-2 border-b border-border pb-4 sm:gap-3">
          {steps.map((title, index) => (
            <li key={title} aria-current={step === index ? 'step' : undefined} className={`flex flex-col items-start gap-1.5 text-xs font-semibold sm:flex-row sm:items-center sm:text-sm ${index === step ? 'text-foreground' : 'text-muted'}`}>
              <span className={`grid size-7 shrink-0 place-items-center rounded-full ${index <= step ? 'bg-market-yellow text-market-navy' : 'bg-background'}`}>
                {index < step ? <><Check size={15} aria-hidden="true" /><span className="sr-only">Ukończono</span></> : index + 1}
              </span>
              {title}
            </li>
          ))}
        </ol>

        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          <h2 ref={stepTitle} tabIndex={-1} className="scroll-mt-24 text-lg font-bold text-foreground">{steps[step]}</h2>

          <div hidden={step !== 0} ref={(node) => { groups.current[0] = node }}>
            <ListingBasics categories={categories} subcategories={subcategories} branches={branches} />
          </div>

          <div hidden={step !== 1} ref={(node) => { groups.current[1] = node }}>
            <ListingRentalFields onUploadingChange={setUploading} />
          </div>

          <div hidden={step !== 2} ref={(node) => { groups.current[2] = node }}>
            {step === 2 && preview && (
              <article className="rounded-xl border border-border bg-background p-3 sm:p-4">
                <div className="grid items-start gap-4 sm:grid-cols-2">
                  <ListingGallery name={preview.name} city={preview.city} category={preview.category} images={preview.images} />
                  <div className="min-w-0">
                    <h3 className="break-words text-lg font-bold">{preview.name}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted"><MapPin size={15} aria-hidden="true" /> {preview.city}</p>
                    <p className="mt-2 text-lg font-extrabold">{priceText(preview)}</p>
                    {preview.description && <p className="mt-2 whitespace-pre-line break-words text-sm text-muted">{preview.description}</p>}
                  </div>
                </div>
              </article>
            )}
            <div className="mt-4 space-y-3 text-sm">
              <label className="flex items-start gap-2">
                <input id="promotion" name="promotion" type="checkbox" className="mt-0.5 size-4 shrink-0 accent-brand-600" />
                Chcę promować to ogłoszenie w przyszłości
              </label>
              <div className="flex items-start gap-2">
                <input id="terms" name="terms" type="checkbox" required className="mt-0.5 size-4 shrink-0 accent-brand-600" />
                <div>
                  <label htmlFor="terms">Akceptuję regulamin oraz politykę prywatności *</label>
                  <div className="flex flex-wrap gap-x-3 text-brand-600 dark:text-brand-400">
                    <Link href="/regulamin" target="_blank" rel="noopener" className="underline">Regulamin</Link>
                    <Link href="/polityka-prywatnosci" target="_blank" rel="noopener" className="underline">Polityka prywatności</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">{error}</p>}

          <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
            {step > 0 && <button type="button" disabled={isLoading} onClick={() => showStep(step - 1)} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold hover:bg-background dark:border-slate-600"><ArrowLeft size={16} aria-hidden="true" /> Wstecz</button>}
            <button type="submit" disabled={isLoading || uploading} className="market-action">
              {isLoading ? 'Zapisywanie…' : uploading ? 'Wysyłanie zdjęć…' : step === 2 ? 'Dodaj ogłoszenie' : 'Dalej'}
              {step < 2 && !uploading && <ArrowRight size={16} aria-hidden="true" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
