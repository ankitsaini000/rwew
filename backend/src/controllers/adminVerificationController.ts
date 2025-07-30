import { Request, Response } from 'express';
import CreatorVerification from '../models/CreatorVerification';
import BrandVerification from '../models/BrandVerification';
import { IUser } from '../models/User';
import { Types } from 'mongoose';

export const getAllVerificationDocuments = async (req: Request, res: Response) => {
  try {
    // Fetch creators
    const creatorDocs = await CreatorVerification.find().populate('userId', 'fullName email username avatar role phone');
    // Fetch brands
    const brandDocs = await BrandVerification.find().populate('userId', 'fullName email username avatar role phone');

    // Map to unified format
    const docs: any[] = [];

    function getOwner(userId: any): any {
      if (userId && typeof userId === 'object') {
        return userId;
      }
      return null;
    }

    creatorDocs.forEach(doc => {
      if (doc.pan?.documentUrl) {
        docs.push({
          _id: doc._id + '-creator-pan',
          ownerType: 'creator',
          owner: getOwner(doc.userId),
          documentName: 'PAN',
          documentUrl: doc.pan.documentUrl,
          status: doc.pan.status
        });
      }
      if (doc.identity?.documentUrl) {
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
      if (doc.pan?.documentUrl) {
        docs.push({
          _id: doc._id + '-brand-pan',
          ownerType: 'brand',
          owner: getOwner(doc.userId),
          documentName: 'PAN',
          documentUrl: doc.pan.documentUrl,
          status: doc.pan.status
        });
      }
      if (doc.gst?.documentUrl) {
        docs.push({
          _id: doc._id + '-brand-gst',
          ownerType: 'brand',
          owner: getOwner(doc.userId),
          documentName: 'GST',
          documentUrl: doc.gst.documentUrl,
          status: doc.gst.status
        });
      }
      if (doc.idProof?.documentUrl) {
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch verification documents' });
  }
};

export const updateVerificationDocumentStatus = async (req: Request, res: Response) => {
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
      const update: any = {};
      if (field === 'pan') update['pan.status'] = status;
      if (field === 'identity') update['identity.status'] = status;
      updated = await CreatorVerification.findByIdAndUpdate(docId, { $set: update }, { new: true });
    } else if (type === 'brand') {
      const update: any = {};
      if (field === 'pan') update['pan.status'] = status;
      if (field === 'gst') update['gst.status'] = status;
      if (field === 'idproof' || field === 'idProof') update['idProof.status'] = status;
      updated = await BrandVerification.findByIdAndUpdate(docId, { $set: update }, { new: true });
    }
    if (!updated) return res.status(404).json({ error: 'Document not found' });
    res.json({ success: true, updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update document status' });
  }
}; 