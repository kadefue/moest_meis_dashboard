import React, { useState, useEffect, useRef } from 'react';

export default function SearchableSelect({ options, value, onChange, placeholder = "Select option...", style, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  // Normalize options to array of objects { value, label }
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'object' && opt !== null) {
      return { value: opt.value, label: opt.label };
    }
    return { value: opt, label: opt };
  });

  // Filter options based on query
  const filteredOptions = normalizedOptions.filter(opt =>
    opt.label.toString().toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOption = normalizedOptions.find(opt => opt.value === value);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset search query when dropdown opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'relative', 
        width: '100%', 
        zIndex: isOpen ? 1010 : 1,
        ...style 
      }}
    >
      {/* Selection Box */}
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          background: disabled ? 'var(--neutral-100)' : 'var(--white)',
          border: '1px solid var(--neutral-300)',
          borderRadius: 'var(--radius-sm)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontSize: '0.875rem',
          color: selectedOption ? 'var(--neutral-900)' : 'var(--neutral-500)',
          minHeight: '40px',
          boxSizing: 'border-box',
          boxShadow: isOpen ? '0 0 0 3px rgba(20, 184, 166, 0.15)' : 'none',
          borderColor: isOpen ? 'var(--primary)' : 'var(--neutral-300)',
          transition: 'all 0.2s',
          opacity: disabled ? 0.7 : 1
        }}
      >
        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span style={{ 
          fontSize: '0.75rem', 
          color: 'var(--neutral-500)', 
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s'
        }}>
          ▼
        </span>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            minWidth: '100%',
            width: 'max-content',
            maxWidth: '450px',
            background: 'var(--white)',
            border: '1px solid var(--neutral-200)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          {/* Search Box */}
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--neutral-150)', background: 'var(--neutral-50)' }}>
            <input 
              type="text" 
              placeholder="Type to search..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px',
                border: '1px solid var(--neutral-300)',
                borderRadius: '4px',
                fontSize: '0.8rem',
                outline: 'none',
                boxSizing: 'border-box',
                background: 'var(--white)',
                color: 'var(--neutral-900)'
              }}
              autoFocus
            />
          </div>

          {/* Options List */}
          <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '12px', fontSize: '0.8rem', color: 'var(--neutral-500)', textAlign: 'center' }}>
                No results found
              </div>
            ) : (
              filteredOptions.map(opt => (
                <div 
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  style={{
                    padding: '10px 14px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    color: opt.value === value ? 'var(--primary)' : 'var(--neutral-800)',
                    background: opt.value === value ? 'rgba(20, 184, 166, 0.08)' : 'transparent',
                    fontWeight: opt.value === value ? 600 : 400,
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.target.style.background = 'var(--neutral-100)'}
                  onMouseLeave={e => e.target.style.background = opt.value === value ? 'rgba(20, 184, 166, 0.08)' : 'transparent'}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
