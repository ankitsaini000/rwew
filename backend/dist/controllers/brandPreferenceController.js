"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBrandPreference = exports.updateBrandPreference = exports.getBrandPreference = exports.createBrandPreference = void 0;
const BrandPreference_1 = __importDefault(require("../models/BrandPreference"));
const createBrandPreference = async (req, res) => {
    try {
        const _a = req.body, { brandId } = _a, data = __rest(_a, ["brandId"]);
        const existing = await BrandPreference_1.default.findOne({ brandId });
        if (existing) {
            return res.status(400).json({ message: 'Preference already exists for this brand.' });
        }
        const preference = new BrandPreference_1.default(Object.assign({ brandId }, data));
        await preference.save();
        res.status(201).json(preference);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating brand preference', error });
    }
};
exports.createBrandPreference = createBrandPreference;
const getBrandPreference = async (req, res) => {
    try {
        const { brandId } = req.params;
        const preference = await BrandPreference_1.default.findOne({ brandId });
        if (!preference) {
            return res.status(404).json({ message: 'Preference not found' });
        }
        res.json(preference);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching brand preference', error });
    }
};
exports.getBrandPreference = getBrandPreference;
const updateBrandPreference = async (req, res) => {
    try {
        const { brandId } = req.params;
        const update = req.body;
        const preference = await BrandPreference_1.default.findOneAndUpdate({ brandId }, update, { new: true, runValidators: true });
        if (!preference) {
            return res.status(404).json({ message: 'Preference not found' });
        }
        res.json(preference);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating brand preference', error });
    }
};
exports.updateBrandPreference = updateBrandPreference;
const deleteBrandPreference = async (req, res) => {
    try {
        const { brandId } = req.params;
        const result = await BrandPreference_1.default.findOneAndDelete({ brandId });
        if (!result) {
            return res.status(404).json({ message: 'Preference not found' });
        }
        res.json({ message: 'Preference deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting brand preference', error });
    }
};
exports.deleteBrandPreference = deleteBrandPreference;
