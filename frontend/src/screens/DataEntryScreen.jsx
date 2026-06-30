import React, { useState, useEffect, useRef } from 'react';
import { getTable, saveTable, logAction, getVisibleIndicators } from '../MockData';
import { useToast } from '../components/ToastProvider';
import { useConfirm } from '../components/ConfirmProvider';
import SearchableSelect from '../components/SearchableSelect';

export default function DataEntryScreen({ user }) {
  const [step, setStep] = useState(1);
  const [indicators, setIndicators] = useState([]);
  const [activities, setActivities] = useState([]);
  
  // Form State
  const [activityId, setActivityId] = useState('standalone');
  const [indicatorId, setIndicatorId] = useState('');
  const [period, setPeriod] = useState('2024/25 Q4');
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [actualValue, setActualValue] = useState('');
  const [remarks, setRemarks] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [submissionTrack, setSubmissionTrack] = useState('Official_Gov'); // MSDD Dual Track: Official_Gov vs Stakeholder_Contribution
  
  const [errors, setErrors] = useState({});
  const [isSavedDraft, setIsSavedDraft] = useState(false);
  const [draftTime, setDraftTime] = useState('');
  
  const autoSaveTimer = useRef(null);

  // User submissions and editing states
  const [mySubmissions, setMySubmissions] = useState([]);
  const [editingSubmission, setEditingSubmission] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editRemarks, setEditRemarks] = useState('');

  const loadSubmissions = () => {
    const actuals = getTable('actual_data');
    const userSubmissions = actuals.filter(entry => entry.submitted_by === user?.username);
    setMySubmissions(userSubmissions);
  };

  useEffect(() => {
    // MSDD Page 8 Constraint: submissions are strictly restricted to primary indicators (is_derived = false)
    const allInds = getVisibleIndicators(user);
    const primaryOnly = allInds.filter(i => !i.is_derived);
    setIndicators(primaryOnly);
    
    const allActivities = getTable('activities');
    setActivities(allActivities);

    // Smart defaults based on logged in user scope
    if (user?.region_id) {
      const regions = getTable('regions');
      const regObj = regions.find(r => r.region_id === user.region_id);
      if (regObj) setRegion(regObj.name);
    } else {
      if (user?.role === 'Regional M&E Officer') {
        const reg = (user.dept || '').split(' ')[0];
        setRegion(reg);
      } else if (user?.role === 'District Education Officer') {
        const parts = (user.dept || '').split(' ');
        setRegion('Dodoma');
        setDistrict(parts.slice(0, parts.length - 1).join(' '));
      } else if (user?.role === 'School Data Entry Officer') {
        setRegion('Dodoma');
        setDistrict('Bahi');
        setWard('Bahi');
      }
    }

    // Load user submissions
    loadSubmissions();

    // Load any existing draft
    const savedDraft = localStorage.getItem('me_draft_entry');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setIndicatorId(draft.indicatorId || '');
        setPeriod(draft.period || '2024/25 Q4');
        setRegion(draft.region || '');
        setDistrict(draft.district || '');
        setWard(draft.ward || '');
        setActualValue(draft.actualValue || '');
        setRemarks(draft.remarks || '');
        setFileName(draft.fileName || '');
        setFileSize(draft.fileSize || '');
        setSubmissionTrack(draft.submissionTrack || 'Official_Gov');
        setDraftTime(draft.savedAt || '');
        setIsSavedDraft(true);
      } catch (e) {
        console.error('Error loading draft', e);
      }
    }

    // Setup auto-save every 30 seconds
    autoSaveTimer.current = setInterval(() => {
      triggerAutoSave();
    }, 30000);

    return () => {
      clearInterval(autoSaveTimer.current);
    };
  }, [user]);

  const { addToast } = useToast();
  const { showConfirm } = useConfirm();

  const handleDeleteSubmission = async (dataId) => {
    const entry = getTable('actual_data').find(d => d.data_id === dataId);
    if (!entry) return;
    if (entry.submitted_by !== user?.username) {
      addToast({ message: 'Permission Error: You can only delete entries you submitted.', type: 'warning' });
      return;
    }
    const ok = await showConfirm({ title: 'Delete submission', message: 'Are you sure you want to delete this submission? This action will be logged in the audit trails.' });
    if (!ok) return;

    const actuals = getTable('actual_data');
    const updatedActuals = actuals.filter(d => d.data_id !== dataId);
    saveTable('actual_data', updatedActuals);
    
    logAction(
      user?.username, 
      'DELETE', 
      'Actual Data', 
      `Deleted actual value of ${entry.actual_value} for indicator ${entry.indicator_id} in ${entry.region} (${entry.period})`
    );
    
    loadSubmissions();
    addToast({ message: 'Data entry deleted successfully.', type: 'success' });
  };

  const handleSaveEdit = () => {
    const indId = editingSubmission.indicator_id;
    const meta = getTable('metadata').find(m => m.indicator_id === indId);
    const unitStr = meta?.unit ? meta.unit.toLowerCase() : '';
    
    let val;
    if (unitStr.includes('bool')) {
      const normalized = editValue.toString().trim().toLowerCase();
      if (normalized !== 'true' && normalized !== 'false' && normalized !== '1' && normalized !== '0' && normalized !== 'yes' && normalized !== 'no') {
        addToast({ message: 'Boolean values must be yes/no, true/false, or 1/0', type: 'warning' });
        return;
      }
      val = (normalized === 'true' || normalized === '1' || normalized === 'yes') ? 1 : 0;
    } else {
      if (editValue === '' || isNaN(editValue)) {
        addToast({ message: 'Please enter a valid numeric value', type: 'warning' });
        return;
      }
      val = Number(editValue);
      if (unitStr.includes('percent') || unitStr.includes('%')) {
        if (val < 0 || val > 100) {
          addToast({ message: 'Percentage values must be between 0 and 100', type: 'warning' });
          return;
        }
      } else if (indId === 'IND-002' || unitStr.includes('ratio')) {
        if (val < 5 || val > 150) {
          addToast({ message: 'Teacher ratio should realistically be between 5 and 150', type: 'warning' });
          return;
        }
      }
    }

    const actuals = getTable('actual_data');
    const oldValue = editingSubmission.actual_value;
    const oldStatus = editingSubmission.status;
    
    const updated = actuals.map(d => {
      if (d.data_id === editingSubmission.data_id) {
        return {
          ...d,
          actual_value: val,
          remarks: editRemarks,
          status: 'Submitted', // Reset status on edit to re-trigger verification workflow
          date_submitted: new Date().toISOString()
        };
      }
      return d;
    });

    saveTable('actual_data', updated);
    
    logAction(
      user?.username,
      'UPDATE',
      'Actual Data',
      `Updated submission ${editingSubmission.data_id}: value changed from ${oldValue} to ${val}. Status reset from ${oldStatus} to Submitted.`
    );

    setEditingSubmission(null);
    loadSubmissions();
    addToast({ message: 'Submission updated successfully. Status reset to Submitted for verification.', type: 'success' });
  };

  const triggerAutoSave = () => {
    if (!indicatorId && !actualValue) return;

    const draft = {
      indicatorId, period, region, district, ward, actualValue, remarks, fileName, fileSize, submissionTrack,
      savedAt: new Date().toLocaleTimeString()
    };
    localStorage.setItem('me_draft_entry', JSON.stringify(draft));
    setDraftTime(draft.savedAt);
    setIsSavedDraft(true);
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!region) newErrors.region = 'Region is required';
      if (user?.role !== 'Regional M&E Officer' && !district) newErrors.district = 'District is required';
      if (!period) newErrors.period = 'Reporting period is required';
      if (!submissionTrack) newErrors.submissionTrack = 'Submission track is required';
    }
    if (currentStep === 2) {
      const meta = getTable('metadata').find(m => m.indicator_id === indicatorId);
      const unitStr = meta?.unit ? meta.unit.toLowerCase() : '';

      if (unitStr.includes('bool')) {
        const normalized = actualValue.trim().toLowerCase();
        if (normalized !== 'true' && normalized !== 'false' && normalized !== '1' && normalized !== '0' && normalized !== 'yes' && normalized !== 'no') {
          newErrors.actualValue = 'Boolean values must be yes/no, true/false, or 1/0';
        }
      } else {
        if (!actualValue || isNaN(actualValue)) {
          newErrors.actualValue = 'Please enter a valid numeric value';
        } else {
          const val = Number(actualValue);
          if (unitStr.includes('percent') || unitStr.includes('%')) {
            if (val < 0 || val > 100) newErrors.actualValue = 'Percentage values must be between 0 and 100';
          } else if (indicatorId === 'IND-002' || unitStr.includes('ratio')) {
            if (val < 5 || val > 150) newErrors.actualValue = 'Teacher ratio should realistically be between 5 and 150';
          }
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      triggerAutoSave();
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
          addToast({ message: 'File size exceeds maximum 5MB limit.', type: 'warning' });
        return;
      }
      setFileName(file.name);
      setFileSize((file.size / 1024).toFixed(1) + ' KB');
      triggerAutoSave();
    }
  };

  const handleSubmit = () => {
    // MSDD validation safety check: verify indicator is not derived
    const allInds = getTable('indicators');
    const targetInd = allInds.find(i => i.indicator_id === indicatorId);
    if (targetInd && targetInd.is_derived) {
      addToast({ message: 'Validation Error: Submissions for derived indicators are restricted.', type: 'warning' });
      return;
    }

    const actuals = getTable('actual_data');
    const newId = `DAT-0${actuals.length + 1}`;
    
    const meta = getTable('metadata').find(m => m.indicator_id === indicatorId);
    const unitStr = meta?.unit ? meta.unit.toLowerCase() : '';
    let parsedValue;
    if (unitStr.includes('bool')) {
      const normalized = actualValue.trim().toLowerCase();
      parsedValue = (normalized === 'true' || normalized === '1' || normalized === 'yes') ? 1.00 : 0.00;
    } else {
      parsedValue = Number(actualValue);
    }

    const newEntry = {
      data_id: newId,
      indicator_id: indicatorId,
      period,
      actual_value: parsedValue,
      region,
      district: district || null,
      ward: ward || null,
      submitted_by: user.username,
      source_category: submissionTrack, // Official_Gov vs Stakeholder_Contribution
      date_submitted: new Date().toISOString(),
      status: 'Submitted',
      remarks: remarks || ''
    };

    actuals.unshift(newEntry);
    saveTable('actual_data', actuals);

    logAction(
      user.username, 
      'SUBMIT', 
      'Actual Data', 
      `Logged value of ${actualValue} for indicator ${indicatorId} in ${region} (${period}) under track ${submissionTrack}`
    );

    localStorage.removeItem('me_draft_entry');
    
    setActualValue('');
    setRemarks('');
    setFileName('');
    setFileSize('');
    setStep(5);
    loadSubmissions();
  };

  const activeIndicator = indicators.find(i => i.indicator_id === indicatorId);

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      
      {/* Draft Save Banner */}
      {isSavedDraft && step < 5 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#e0f2fe',
          color: '#0369a1',
          padding: '8px 16px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem',
          fontWeight: 500,
          marginBottom: '16px'
        }}>
          <span>💾 Auto-save: Draft saved locally at <strong>{draftTime}</strong></span>
          <button 
            style={{ border: 'none', background: 'transparent', color: '#0369a1', cursor: 'pointer', fontWeight: 700 }}
            onClick={() => { localStorage.removeItem('me_draft_entry'); setIsSavedDraft(false); }}
          >
            Discard Draft
          </button>
        </div>
      )}

      {/* Stepper Header */}
      {step < 5 && (
        <div className="stepper">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-circle">1</div>
            <div className="step-label">Scope</div>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-circle">2</div>
            <div className="step-label">Values</div>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
            <div className="step-circle">3</div>
            <div className="step-label">Evidence</div>
          </div>
          <div className={`step ${step >= 4 ? 'active' : ''} ${step > 4 ? 'completed' : ''}`}>
            <div className="step-circle">4</div>
            <div className="step-label">Review</div>
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className="card" style={{ padding: '32px', position: 'relative', zIndex: 100 }}>
        
        {/* STEP 1: SCOPE */}
        {step === 1 && (
          <div>
            <h3>Stage 1: Define Reporting Entity & Period</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginBottom: '24px' }}>
              Confirm your geographic boundary, timing parameters, and target indicator.
            </p>

            <div className="form-group">
              <label className="form-label">Activity Context</label>
              <SearchableSelect
                options={[
                  { value: "standalone", label: "No Specific Activity (Standalone KPI)" },
                  ...activities.map(act => ({ value: act.activity_id, label: `${act.activity_id}: ${act.name}` }))
                ]}
                value={activityId}
                onChange={(val) => {
                  setActivityId(val);
                  setIndicatorId(''); // Reset indicator when activity changes
                }}
              />
              <div className="helper-text">Optional: Link this data submission to a specific activity.</div>
            </div>

            <div className="form-group">
              <label className="form-label">Indicator Code <span className="required">*</span></label>
              <SearchableSelect
                options={indicators
                  .filter(ind => activityId === 'standalone' || ind.associated_activity_id === activityId)
                  .map(ind => ({ value: ind.indicator_id, label: `${ind.indicator_id}: ${ind.name}` }))
                }
                value={indicatorId}
                onChange={setIndicatorId}
                placeholder="Select Indicator"
              />
              <div className="helper-text">Select which primary KPI is being logged. Derived indicators are locked.</div>
            </div>

            <div className="form-group">
              <label className="form-label">Submission Track (Data Flow Pipeline) <span className="required">*</span></label>
              <SearchableSelect
                options={[
                  { value: "Official_Gov", label: "Official Government Track (Official national stats)" },
                  { value: "Stakeholder_Contribution", label: "Stakeholder Participation Track (NGOs, private schools, partners)" }
                ]}
                value={submissionTrack}
                onChange={setSubmissionTrack}
              />
              <div className="helper-text">Non-government submissions are isolated to prevent double-counting.</div>
            </div>

            <div className="form-group">
              <label className="form-label">Reporting Period <span className="required">*</span></label>
              <SearchableSelect
                options={[
                  { value: "2024/25 Q1", label: "2024/25 Quarter 1 (1 Jul 2024 - 30 Sep 2024)" },
                  { value: "2024/25 Q2", label: "2024/25 Quarter 2 (1 Oct 2024 - 31 Dec 2024)" },
                  { value: "2024/25 Q3", label: "2024/25 Quarter 3 (1 Jan 2025 - 31 Mar 2025)" },
                  { value: "2024/25 Q4", label: "2024/25 Quarter 4 (1 Apr 2025 - 30 Jun 2025)" },
                  { value: "2024/25", label: "2024/25 Annual Census (1 Jul 2024 - 30 Jun 2025)" }
                ]}
                value={period}
                onChange={setPeriod}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Region <span className="required">*</span></label>
                {user?.role === 'Regional M&E Officer' || user?.role === 'District Education Officer' || user?.role === 'School Data Entry Officer' ? (
                  <input 
                    type="text" 
                    className="form-input" 
                    value={region} 
                    disabled 
                    style={{ background: 'var(--neutral-100)', color: 'var(--neutral-600)', minHeight: '40px' }}
                  />
                ) : (
                  <SearchableSelect
                    options={[
                      { value: "Dar es Salaam", label: "Dar es Salaam" },
                      { value: "Dodoma", label: "Dodoma" },
                      { value: "Mwanza", label: "Mwanza" },
                      { value: "Arusha", label: "Arusha" },
                      { value: "Mbeya", label: "Mbeya" }
                    ]}
                    value={region}
                    onChange={setRegion}
                    placeholder="Select Region"
                  />
                )}
                {errors.region && <span className="error-text">⚠️ {errors.region}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">District {user?.role !== 'Regional M&E Officer' && <span className="required">*</span>}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Bahi"
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  disabled={user?.role === 'District Education Officer' || user?.role === 'School Data Entry Officer'}
                />
                {errors.district && <span className="error-text">⚠️ {errors.district}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Ward (optional)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Bahi Ward"
                value={ward}
                onChange={e => setWard(e.target.value)}
                disabled={user?.role === 'School Data Entry Officer'}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button className="btn btn-primary" onClick={handleNext}>Next Stage ▶</button>
            </div>
          </div>
        )}

        {/* STEP 2: VALUES */}
        {step === 2 && (
          <div>
            <h3>Stage 2: Enter Indicator Metric Data</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginBottom: '24px' }}>
              Submit numerical figures and qualitative context.
            </p>

            <div style={{ padding: '16px', background: 'var(--neutral-100)', borderRadius: 'var(--radius-sm)', marginBottom: '24px' }}>
              <div style={{ fontWeight: 700, color: 'var(--secondary)' }}>Indicator Description</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--neutral-700)', marginTop: '4px' }}>
                {activeIndicator?.name}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Actual Value <span className="required">*</span></label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter quantitative value"
                value={actualValue}
                onChange={e => setActualValue(e.target.value)}
                onBlur={() => validateStep(2)}
              />
              {errors.actualValue && <span className="error-text">⚠️ {errors.actualValue}</span>}
              <div className="helper-text">
                Value unit must match: {getTable('metadata').find(m => m.indicator_id === indicatorId)?.unit || 'Numerical value'}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Remarks & Explanations (optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Log any variances, data capture limitations, or context notes..."
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button className="btn btn-secondary" onClick={handleBack}>◀ Back</button>
              <button className="btn btn-primary" onClick={handleNext}>Next Stage ▶</button>
            </div>
          </div>
        )}

        {/* STEP 3: EVIDENCE */}
        {step === 3 && (
          <div>
            <h3>Stage 3: Attach Supporting Documentation</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginBottom: '24px' }}>
              In compliance with e-GA audits, evidence forms (e.g. Scans, PDF reports) verify indicator legitimacy.
            </p>

            <div style={{
              border: '2px dashed var(--neutral-200)',
              borderRadius: 'var(--radius-md)',
              padding: '40px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: 'var(--neutral-50)',
              transition: 'border-color 0.2s',
            }}
            onClick={() => document.getElementById('file-upload').click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) {
                setFileName(file.name);
                setFileSize((file.size / 1024).toFixed(1) + ' KB');
                triggerAutoSave();
              }
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--neutral-200)'}
            >
              <input 
                id="file-upload" 
                type="file" 
                style={{ display: 'none' }} 
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg"
                onChange={handleFileUpload}
              />
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📁</div>
              <div style={{ fontWeight: 600, color: 'var(--neutral-900)' }}>Drag & drop evidence files here</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--neutral-600)', marginTop: '4px' }}>
                Supports PDF, Excel, Word, or Scanned Images (Max size: 5MB)
              </div>
            </div>

            {fileName && (
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                background: 'var(--neutral-100)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.85rem'
              }}>
                <div>
                  <span style={{ marginRight: '8px' }}>📄</span>
                  <strong>{fileName}</strong> <span style={{ color: 'var(--neutral-600)', marginLeft: '8px' }}>({fileSize})</span>
                </div>
                <button 
                  style={{ border: 'none', background: 'transparent', color: 'var(--error)', cursor: 'pointer', fontWeight: 700 }}
                  onClick={(e) => { e.stopPropagation(); setFileName(''); setFileSize(''); }}
                >
                  Remove
                </button>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button className="btn btn-secondary" onClick={handleBack}>◀ Back</button>
              <button className="btn btn-primary" onClick={handleNext}>Next Stage ▶</button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW */}
        {step === 4 && (
          <div>
            <h3>Stage 4: Review and Submit Ledger Entry</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginBottom: '24px' }}>
              Verify correctness. Submitted entries are held in 'Submitted' workflow state for coordinator validation.
            </p>

            <table className="custom-table" style={{ border: '1px solid var(--neutral-200)', borderRadius: 'var(--radius-sm)', marginBottom: '24px' }}>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600, width: '200px' }}>Indicator Code</td>
                  <td><strong>{indicatorId}</strong> ({activeIndicator?.name})</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Submission Track</td>
                  <td><strong>{submissionTrack === 'Official_Gov' ? '🏛️ Official Government Track' : '🤝 Stakeholder Contribution Track'}</strong></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Reporting Period</td>
                  <td>{period}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Geographic Level</td>
                  <td>
                    {region} Region
                    {district && `, ${district} District`}
                    {ward && `, ${ward} Ward`}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Actual Value</td>
                  <td style={{ fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 700 }}>
                    {actualValue} {indicatorId === 'IND-002' ? 'Pupils/Teacher' : '%'}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Evidence File</td>
                  <td>{fileName ? `📄 ${fileName} (${fileSize})` : <span style={{ color: 'var(--neutral-600)' }}>None attached</span>}</td>
                </tr>
                {remarks && (
                  <tr>
                    <td style={{ fontWeight: 600 }}>Notes / Remarks</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--neutral-700)' }}>{remarks}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button className="btn btn-secondary" onClick={handleBack}>◀ Back</button>
              <button className="btn btn-primary" onClick={handleSubmit}>🚀 Submit for Verification</button>
            </div>
          </div>
        )}

        {/* STEP 5: SUCCESS */}
        {step === 5 && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ color: 'var(--success)' }}>Data Submitted Successfully</h2>
            <p style={{ maxWidth: '480px', margin: '0 auto 24px auto', fontSize: '0.9rem', color: 'var(--neutral-600)' }}>
              Your ledger entry has been transmitted and logged into the audit trails. It is now pending verification by the National M&E Officer.
            </p>
            <button className="btn btn-primary" onClick={() => { setStep(1); }}>
              Log Another Entry
            </button>
          </div>
        )}

      </div>

      {/* Submissions Section */}
      <div className="card" style={{ marginTop: '32px', padding: '24px' }}>
        <h3 style={{ borderBottom: '2px solid var(--neutral-100)', paddingBottom: '12px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📋 My Submitted Data Entries
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', marginBottom: '16px' }}>
          You can update or delete any data submissions you have previously recorded.
        </p>

        {mySubmissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--neutral-500)', fontSize: '0.9rem' }}>
            No submissions found for your account. Use the form above to log data.
          </div>
        ) : (
          <div className="table-container" style={{ margin: 0, overflowX: 'auto' }}>
            <table className="custom-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Indicator</th>
                  <th>Period</th>
                  <th>Location</th>
                  <th>Value</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mySubmissions.map(sub => (
                  <tr key={sub.data_id}>
                    <td style={{ fontWeight: 700 }}>{sub.data_id}</td>
                    <td>
                      <span className="badge badge-info" style={{ fontFamily: 'monospace' }}>{sub.indicator_id}</span>
                    </td>
                    <td>{sub.period}</td>
                    <td>
                      {sub.region}
                      {sub.district && ` > ${sub.district}`}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{sub.actual_value}</td>
                    <td>
                      <span className={`badge ${
                        sub.status === 'Approved' ? 'badge-success' : sub.status === 'Verified' ? 'badge-warning' : 'badge-info'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '4px 8px', fontSize: '0.75rem', minHeight: 'auto' }}
                          onClick={() => {
                            setEditingSubmission(sub);
                            setEditValue(sub.actual_value.toString());
                            setEditRemarks(sub.remarks || '');
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          className="btn" 
                          style={{ padding: '4px 8px', fontSize: '0.75rem', minHeight: 'auto', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}
                          onClick={() => handleDeleteSubmission(sub.data_id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Glassmorphism Edit Modal */}
      {editingSubmission && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '28px', margin: '16px', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--primary)' }}>Edit Submission: {editingSubmission.data_id}</h3>
              <button 
                style={{ border: 'none', background: 'transparent', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--neutral-500)' }}
                onClick={() => setEditingSubmission(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Indicator</label>
              <div style={{ padding: '10px', background: 'var(--neutral-100)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--neutral-700)', fontWeight: 600 }}>
                {editingSubmission.indicator_id} - {indicators.find(i => i.indicator_id === editingSubmission.indicator_id)?.name}
              </div>
            </div>
            
            <div className="grid-2" style={{ gap: '16px', marginBottom: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Period</label>
                <div style={{ padding: '10px', background: 'var(--neutral-100)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--neutral-700)' }}>
                  {editingSubmission.period}
                </div>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Location</label>
                <div style={{ padding: '10px', background: 'var(--neutral-100)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--neutral-700)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {editingSubmission.region}{editingSubmission.district ? ` > ${editingSubmission.district}` : ''}
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Actual Value <span className="required">*</span></label>
              <input 
                type="text" 
                className="form-input" 
                value={editValue} 
                onChange={e => setEditValue(e.target.value)}
              />
              <div className="helper-text">
                Value unit: {getTable('metadata').find(m => m.indicator_id === editingSubmission.indicator_id)?.unit || 'Numerical value'}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Remarks & Explanations (optional)</label>
              <textarea 
                className="form-textarea" 
                value={editRemarks} 
                onChange={e => setEditRemarks(e.target.value)}
                placeholder="Reason for change, context notes..."
                rows={3}
              />
            </div>

            {editingSubmission.status !== 'Submitted' && (
              <div style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fef3c7',
                color: '#b45309',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                marginBottom: '16px',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start'
              }}>
                <span>⚠️</span>
                <span>
                  <strong>Status Warning:</strong> This submission is currently <strong>{editingSubmission.status}</strong>. Saving this change will reset its status to <strong>Submitted</strong> and require re-verification.
                </span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button className="btn btn-secondary" onClick={() => setEditingSubmission(null)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                onClick={handleSaveEdit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
