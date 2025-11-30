import React, { useState, useEffect } from 'react';
import { X, Flag, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../src/integrations/supabase/client';
import { reportSchema } from '../lib/schemas';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedType: 'request' | 'user' | 'offer';
  reportedId: string;
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or misleading' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'fraud', label: 'Suspected fraud' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'misleading', label: 'Misleading information' },
  { value: 'other', label: 'Other' },
] as const;

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  reportedType,
  reportedId,
}) => {
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [alreadyReported, setAlreadyReported] = useState(false);

  // Check if user already reported this item
  useEffect(() => {
    if (isOpen && reportedId) {
      checkExistingReport();
    }
  }, [isOpen, reportedId]);

  const checkExistingReport = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('reports')
      .select('id')
      .eq('reporter_id', user.id)
      .eq('reported_type', reportedType)
      .eq('reported_id', reportedId)
      .maybeSingle();

    if (data) {
      setAlreadyReported(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate using zod schema
    const validation = reportSchema.safeParse({
      reportedType,
      reportedId,
      reason,
      description: description.trim() || null,
    });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Invalid input');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to submit a report');
        return;
      }

      const { error: insertError } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          reported_type: reportedType,
          reported_id: reportedId,
          reason,
          description: description.trim() || null,
        });

      if (insertError) {
        if (insertError.code === '23505') {
          setError('You have already reported this item');
        } else {
          throw insertError;
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        // Reset state after close
        setTimeout(() => {
          setSuccess(false);
          setReason('');
          setDescription('');
        }, 300);
      }, 1500);
    } catch (err) {
      console.error('Error submitting report:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      // Reset state after close animation
      setTimeout(() => {
        setReason('');
        setDescription('');
        setError(null);
        setSuccess(false);
        setAlreadyReported(false);
      }, 300);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-bold text-gray-900">Report {reportedType}</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">Report Submitted</h3>
              <p className="text-gray-500 mt-1">Thank you for helping keep our community safe.</p>
            </div>
          ) : alreadyReported ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">Already Reported</h3>
              <p className="text-gray-500 mt-1">You have already submitted a report for this {reportedType}.</p>
              <button
                onClick={handleClose}
                className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="text-sm text-gray-600 mb-4">
                Help us understand what's wrong with this {reportedType}. Your report will be reviewed by our team.
              </p>

              {/* Reason Selection */}
              <div className="space-y-2 mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Reason for report <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {REPORT_REASONS.map((item) => (
                    <label
                      key={item.value}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        reason === item.value
                          ? 'border-deepBlue bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={item.value}
                        checked={reason === item.value}
                        onChange={(e) => setReason(e.target.value)}
                        className="sr-only"
                      />
                      <span className={`text-sm ${reason === item.value ? 'text-deepBlue font-medium' : 'text-gray-700'}`}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional details (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide any additional context that might help us review this report..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-softTeal focus:border-transparent resize-none text-sm"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/500</p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !reason}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Report'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
