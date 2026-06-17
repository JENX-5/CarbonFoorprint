import { CarbonData as Data } from '../../lib/data.js';
import { AlertTriangle } from '../../components/icons/index.jsx';

export function FieldRow({ field, value, error, onChange }) {
  const inputId = `field-${field.name}`;

  if (field.type === 'select') {
    const options = Data[field.optionsKey];
    return (
      <div className="form-row">
        <label htmlFor={inputId}>{field.label}</label>
        <select id={inputId} name={field.name} value={value} onChange={onChange}>
          {Object.entries(options).map(([key, optionLabel]) => (
            <option key={key} value={key}>{optionLabel}</option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === 'checkbox') {
    return (
      <div className="form-row form-row--checkbox">
        <input id={inputId} type="checkbox" name={field.name} checked={!!value} onChange={onChange} />
        <label htmlFor={inputId}>{field.label}</label>
      </div>
    );
  }

  return (
    <div className="form-row">
      <label htmlFor={inputId}>
        {field.label}{field.unit ? <span className="form-row__unit"> ({field.unit})</span> : null}
      </label>
      <input
        id={inputId}
        type="number"
        name={field.name}
        value={value}
        onChange={onChange}
        min={field.min}
        max={field.max}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
      <p className="field-error" id={`${inputId}-error`}>
        {error ? <><AlertTriangle size={13} aria-hidden="true" /> {error}</> : null}
      </p>
    </div>
  );
}
