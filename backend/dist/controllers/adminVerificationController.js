"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVerificationDocumentStatus = exports.getAllVerificationDocuments = void 0;
const CreatorVerification_1 = __importDefault(require("../models/CreatorVerification"));
const BrandVerification_1 = __importDefault(require("../models/BrandVerification"));
const getAllVerificationDocuments = async (req, res) => {
    try {
        // Fetch creators
        const creatorDocs = await CreatorVerification_1.default.find().populate('userId', 'fullName email username avatar role phone');
        // Fetch brands
        const brandDocs = await BrandVerification_1.default.find().populate('userId', 'fullName email username avatar role phone');
        // Map to unified format
        const docs = [];
        function getOwner(userId) {
            if (userId && typeof userId === 'object') {
                return userId;
            }
            return null;
        }
        creatorDocs.forEach(doc => {
            var _a, _b;
            if ((_a = doc.pan) === null || _a === void 0 ? void 0 : _a.documentUrl) {
                docs.push({
                    _id: doc._id + '-creator-pan',
                    ownerType: 'creator',
                    owner: getOwner(doc.userId),
                    documentName: 'PAN',
                    documentUrl: doc.pan.documentUrl,
                    status: doc.pan.status
                });
            }
            if ((_b = doc.identity) === null || _b === void 0 ? void 0 : _b.documentUrl) {
                docs.push({
                    _id: doc._id + '-creator-identity',
                    ownerType: 'creator',
                    owner: getOwner(doc.userId),
                    documentName: 'Identity',
                    documentUrl: doc.identity.documentUrl,
                    status: doc.identity.status
                });
            }
        });
        brandDocs.forEach(doc => {
            var _a, _b, _c;
            if ((_a = doc.pan) === null || _a === void 0 ? void 0 : _a.documentUrl) {
                docs.push({
                    _id: doc._id + '-brand-pan',
                    ownerType: 'brand',
                    owner: getOwner(doc.userId),
                    documentName: 'PAN',
                    documentUrl: doc.pan.documentUrl,
                    status: doc.pan.status
                });
            }
            if ((_b = doc.gst) === null || _b === void 0 ? void 0 : _b.documentUrl) {
                docs.push({
                    _id: doc._id + '-brand-gst',
                    ownerType: 'brand',
                    owner: getOwner(doc.userId),
                    documentName: 'GST',
                    documentUrl: doc.gst.documentUrl,
                    status: doc.gst.status
                });
            }
            if ((_c = doc.idProof) === null || _c === void 0 ? void 0 : _c.documentUrl) {
                docs.push({
                    _id: doc._id + '-brand-idproof',
                    ownerType: 'brand',
                    owner: getOwner(doc.userId),
                    documentName: doc.idProof.idType || 'ID Proof',
                    documentUrl: doc.idProof.documentUrl,
                    status: doc.idProof.status
                });
            }
        });
        res.json(docs);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch verification documents' });
    }
};
exports.getAllVerificationDocuments = getAllVerificationDocuments;
const updateVerificationDocumentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'verified' or 'rejected'
        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        // Parse id to get the type and field
        // Example: 653a...-creator-pan
        const [docId, type, field] = id.split('-');
        let updated;
        if (type === 'creator') {
            const update = {};
            if (field === 'pan')
                update['pan.status'] = status;
            if (field === 'identity')
                update['identity.status'] = status;
            updated = await CreatorVerification_1.default.findByIdAndUpdate(docId, { $set: update }, { new: true });
        }
        else if (type === 'brand') {
            const update = {};
            if (field === 'pan')
                update['pan.status'] = status;
            if (field === 'gst')
                update['gst.status'] = status;
            if (field === 'idproof' || field === 'idProof')
                update['idProof.status'] = status;
            updated = await BrandVerification_1.default.findByIdAndUpdate(docId, { $set: update }, { new: true });
        }
        if (!updated)
            return res.status(404).json({ error: 'Document not found' });
        res.json({ success: true, updated });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to update document status' });
    }
};
exports.updateVerificationDocumentStatus = updateVerificationDocumentStatus;
