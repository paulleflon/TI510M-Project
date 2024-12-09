import express from 'express';
import jwt from 'jsonwebtoken';
const router = express.Router();

const nameRegex = /^.{1,255}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,24}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/signup', (req, res) => {
	const {name, password, email} = req.body;
	// Controller
	if (!name || !password || !email) return res.status(400).json({error: 'Missing required information'});
	if (!nameRegex.test(name)) return res.status(400).json({error: 'Invalid name'});
	if (!passwordRegex.test(password)) return res.status(400).json({error: 'Invalid password'});
	if (!emailRegex.test(email)) return res.status(400).json({error: 'Invalid email'});
	// Add customer to database
	req.app.db.addCustomer({name, password, email}).then(id => {
		res.status(201).json({id});
	}).catch((err) => {
		res.status(500).json({error: err.message});
	});
});

router.get('/login', async (req, res) => {
	const {email, password} = req.query;
	// Controller
	if (!email || !password) return res.status(400).json({error: 'Missing required information'});
	let customerId;
	try {
		customerId = await req.app.db.attemptLogin(email, password);
	} catch (err) {
		res.clearCookie('auth');
		return res.status(401).json({error: err.message});
	}
	const token = jwt.sign({customerId}, process.env.JWT_SECRET, {expiresIn: '30d'});
	res.cookie('auth', token, {maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production'});
	res.status(200).json({message: 'Logged in successfully.'});
});

router.get('/logout', (req, res) => {
	res.clearCookie('auth');
	res.status(200).json({message: 'Logged out successfully.'});
});

export default router;