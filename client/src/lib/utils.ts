import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCookie(name: string) {
  let cookieValue = null

  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';')

    for (let cookie of cookies) {
      cookie = cookie.trim()

      if (cookie.substring(0, name.length + 1) === name + '=') {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
        break
      }
    }
  }

  return cookieValue
}

export async function apiFetch(path: string, options: any = {}) {
  const url = '/api/' + path
  const csrfToken = getCookie('csrftoken')
  const headers: Record<string, string> = {
    'X-CSRFToken': csrfToken || '',
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  })

  const contentType = response.headers.get('Content-Type')
  let data
  if (contentType && contentType.includes('application/json')) {
    data = await response.json()
  } else {
    data = await response.text()
  }

  if (!response.ok) {
    return { status: response.status, error: data }
  }

  return { status: response.status, data }
}

export function getAuthErrors(errors: any) {
  if (!errors) return

  const formErrors: Record<string, Array<{ message: string }>> = {}

  for (const error of errors) {
    if (formErrors[error.param]) {
      formErrors[error.param].push({ message: error.message })
    } else {
      formErrors[error.param] = [{ message: error.message }]
    }
  }

  return {
    fields: formErrors,
  }
}
