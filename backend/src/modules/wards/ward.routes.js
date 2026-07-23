const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middlewares/auth.middleware');

// TODO: Wire up controller, validator, asyncHandler for wards
router.use(authenticate);

router.get('/',     (req, res) => res.status(200).json({ message: 'wards module - GET all (stub)' }));
router.post('/',    (req, res) => res.status(201).json({ message: 'wards module - POST create (stub)' }));
router.get('/:id',  (req, res) => res.status(200).json({ message: 'wards module - GET by id (stub)' }));
router.put('/:id',  (req, res) => res.status(200).json({ message: 'wards module - PUT update (stub)' }));
router.delete('/:id', (req, res) => res.status(200).json({ message: 'wards module - DELETE (stub)' }));

module.exports = router;
