import { getVerifiedEmail } from '../../utils/verifiedEmail'

export default defineEventHandler(async (event) => {
  const email = await getVerifiedEmail(event)
  return email ? { email } : null
})
