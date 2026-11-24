export function sendSuccess(response, message, data, statusCode = 200, meta) {
  const body = { success: true, message, data }

  if (meta) {
    body.meta = meta
  }

  return response.status(statusCode).json(body)
}
