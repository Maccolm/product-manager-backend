import { parseBearer } from "../utils/jwtHelpers.mjs"

async function isTokenValid(req, res) {
	const token = req.headers['authorization']

	if (!token) {
		return 'Token is not provided'
	}
	try {
		const decoded = parseBearer(token, req.headers)
		if(decoded === 'TokenExpiredError') 
			return false
		return true
	} catch (error) {
		console.error('error to valid token', error)
		return error 
	}
}
export default isTokenValid