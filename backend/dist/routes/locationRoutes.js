"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Location_1 = __importDefault(require("../models/Location"));
const router = express_1.default.Router();
// GET /api/locations/states - Get all Indian states
router.get('/states', async (req, res) => {
    try {
        const states = await Location_1.default.find({
            country: 'India',
            isActive: true
        })
            .select('state')
            .sort('state');
        const stateList = states.map(location => location.state);
        res.json({
            success: true,
            data: stateList,
            message: 'Indian states retrieved successfully'
        });
    }
    catch (error) {
        console.error('Error fetching states:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch states',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// GET /api/locations/validate/:state - Validate if a state exists
router.get('/validate/:state', async (req, res) => {
    try {
        const { state } = req.params;
        const location = await Location_1.default.findOne({
            country: 'India',
            state: state,
            isActive: true
        });
        res.json({
            success: true,
            data: {
                isValid: !!location,
                state: state,
                country: 'India'
            },
            message: location ? 'State is valid' : 'State not found'
        });
    }
    catch (error) {
        console.error('Error validating state:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate state',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// GET /api/locations - Get all locations (for admin purposes)
router.get('/', async (req, res) => {
    try {
        const locations = await Location_1.default.find({ isActive: true }).sort('state');
        res.json({
            success: true,
            data: locations,
            message: 'Locations retrieved successfully'
        });
    }
    catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch locations',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
