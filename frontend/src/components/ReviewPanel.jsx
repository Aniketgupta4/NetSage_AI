import React from 'react';
import {
  CheckCircle2,
  Code2,
  ShieldCheck,
  X
} from "lucide-react";

function ReviewPanel({
  diagnosis,
  reviewState,
  reviewComment,
  setReviewComment,
  onSubmit
}) {

  if (!diagnosis) {
    return null;
  }

  return (
    <>
      <style>{`
        .review-panel-container {
          background-color: #131d2b;
          border: 1px solid rgba(148, 163, 184, 0.15);
          border-radius: 0.75rem;
          padding: 1.5rem;
          font-family: system-ui, -apple-system, sans-serif;
          width: 100%;
          box-sizing: border-box;
          color: #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .review-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }

        .review-header-icon {
          color: #22d3ee;
          background: rgba(34, 211, 238, 0.1);
          padding: 0.625rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .review-header-text h3 {
          margin: 0 0 0.25rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #ffffff;
        }

        .review-header-text p {
          margin: 0;
          font-size: 0.875rem;
          color: #94a3b8;
        }

        .review-textarea {
          width: 100%;
          background-color: #0b1120;
          border: 1px solid #334155;
          border-radius: 0.5rem;
          padding: 0.75rem 1rem;
          color: #f1f5f9;
          font-size: 0.875rem;
          min-height: 100px;
          resize: vertical;
          box-sizing: border-box;
          transition: all 0.2s;
          margin-bottom: 1.25rem;
        }

        .review-textarea:focus {
          outline: none;
          border-color: #06b6d4;
          box-shadow: 0 0 0 1px #06b6d4;
        }
        
        .review-textarea::placeholder {
          color: #64748b;
        }

        .review-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        @media (min-width: 640px) {
          .review-actions {
            flex-direction: row;
          }
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
          flex: 1;
        }

        .btn-accept {
          background-color: rgba(16, 185, 129, 0.1);
          color: #34d399;
          border-color: rgba(16, 185, 129, 0.2);
        }
        .btn-accept:hover { background-color: rgba(16, 185, 129, 0.2); color: #6ee7b7; }

        .btn-edit {
          background-color: rgba(148, 163, 184, 0.1);
          color: #cbd5e1;
          border-color: rgba(148, 163, 184, 0.2);
        }
        .btn-edit:hover { background-color: rgba(148, 163, 184, 0.2); color: #ffffff; }

        .btn-reject {
          background-color: rgba(239, 68, 68, 0.1);
          color: #f87171;
          border-color: rgba(239, 68, 68, 0.2);
        }
        .btn-reject:hover { background-color: rgba(239, 68, 68, 0.2); color: #fca5a5; }

        /* Dynamic Complete States */
        .review-complete {
          border-radius: 0.75rem;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .review-complete.ACCEPTED {
          background-color: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #34d399;
        }
        
        .review-complete.REJECTED {
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #f87171;
        }
        
        .review-complete.EDITED {
          background-color: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.2);
          color: #22d3ee;
        }

        .review-complete-text {
          display: flex;
          flex-direction: column;
        }

        .review-complete-text strong {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.125rem;
        }

        .review-complete-text span {
          font-size: 0.875rem;
          opacity: 0.9;
        }
      `}</style>

      {reviewState !== "idle" ? (
        <div className={`review-complete ${reviewState}`}>
          {reviewState === "REJECTED" ? <X size={24} /> : <CheckCircle2 size={24} />}
          <div className="review-complete-text">
            <strong>Review recorded</strong>
            <span>Decision: {reviewState}</span>
          </div>
        </div>
      ) : (
        <div className="review-panel-container">
          <div className="review-header">
            <div className="review-header-icon">
              <ShieldCheck size={20} />
            </div>
            <div className="review-header-text">
              <h3>Human review</h3>
              <p>Approve, edit, or reject the AI recommendation.</p>
            </div>
          </div>

          <textarea
            className="review-textarea"
            value={reviewComment}
            onChange={(event) => setReviewComment(event.target.value)}
            placeholder="Add reviewer notes here (optional)..."
          />

          <div className="review-actions">
            <button
              className="action-btn btn-accept"
              onClick={() => onSubmit("ACCEPTED")}
            >
              <CheckCircle2 size={16} />
              Accept
            </button>

            <button
              className="action-btn btn-edit"
              onClick={() => onSubmit("EDITED")}
            >
              <Code2 size={16} />
              Edit
            </button>

            <button
              className="action-btn btn-reject"
              onClick={() => onSubmit("REJECTED")}
            >
              <X size={16} />
              Reject
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ReviewPanel;