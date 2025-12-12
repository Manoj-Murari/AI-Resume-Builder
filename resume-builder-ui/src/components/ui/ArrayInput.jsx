
import React, { useState, useEffect } from 'react';
import InputGroup from './InputGroup';

const ArrayInput = ({ label, items, onChange, placeholder }) => {
    const [localValue, setLocalValue] = useState((items || []).join(', '));

    useEffect(() => {
        const currentParsed = localValue.split(',').map(s => s.trim()).filter(Boolean).join(',');
        const newParsed = (items || []).join(',');
        if (currentParsed !== newParsed) {
            setLocalValue((items || []).join(', '));
        }
    }, [items]);

    const handleChange = (text) => {
        setLocalValue(text);
        const newItems = text.split(',').map(s => s.trim()).filter(s => s.length > 0);
        onChange(newItems);
    };

    return (
        <InputGroup
            label={label}
            value={localValue}
            onChange={handleChange}
            placeholder={placeholder}
        />
    );
};

export default ArrayInput;
