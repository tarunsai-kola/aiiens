const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middlewares/auth.middleware');

// TODO: Wire up controller, validator, asyncHandler for reports
router.use(authenticate);

router.get('/',     (req, res) => res.status(200).json({ message: 'reports module - GET all (stub)' }));
router.post('/',    (req, res) => res.status(201).json({ message: 'reports module - POST create (stub)' }));
router.get('/:id',  (req, res) => res.status(200).json({ message: 'reports module - GET by id (stub)' }));
router.put('/:id',  (req, res) => res.status(200).json({ message: 'reports module - PUT update (stub)' }));
router.delete('/:id', (req, res) => res.status(200).json({ message: 'reports module - DELETE (stub)' }));

module.exports = router;
