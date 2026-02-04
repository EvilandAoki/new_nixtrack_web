import dayjs from 'dayjs'

export const formatDate = (date: string | Date, format: string = 'DD/MM/YYYY'): string => {
  if (!date) return '-'
  return dayjs(date).format(format)
}

export const formatDateTime = (date: string | Date): string => {
  if (!date) return '-'
  return dayjs(date).format('DD/MM/YYYY HH:mm')
}

export const formatCurrency = (amount: number, currency: string = 'BOB'): string => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency,
  }).format(amount)
}

export const formatBoolean = (value: 0 | 1 | boolean, trueText: string = 'Sí', falseText: string = 'No'): string => {
  return value ? trueText : falseText
}

export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const formatPhone = (phone: string): string => {
  if (!phone) return '-'
  // Format: +591 XX XXX XXXX
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length <= 8) {
    return cleaned.replace(/(\d{4})(\d{4})/, '$1-$2')
  }
  return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '+591 $1 $2 $3')
}
